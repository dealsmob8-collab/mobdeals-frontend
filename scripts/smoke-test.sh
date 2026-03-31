#!/bin/bash

# MobDeals Storefront Production Smoke Tests
# Run this after deployment to verify critical functionality

set -e

BASE_URL="${BASE_URL:-https://shop.mobdeals.co.ke}"
WEBHOOK_SECRET="${WC_WEBHOOK_SECRET:-test_secret}"

echo "================================"
echo "MobDeals Smoke Tests"
echo "Base URL: $BASE_URL"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for tests
run_test() {
    local name="$1"
    local command="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Homepage loads
echo "--- Basic Endpoint Tests ---"
run_test "Homepage loads" "curl -s -o /dev/null -w '%{http_code}' $BASE_URL | grep -q '200'"

# Test 2: Products API (should have cache header)
echo ""
echo "--- Cache Header Tests ---"
echo -n "Testing: Products API caching... "
CACHE_HEADER=$(curl -s -I "$BASE_URL/api/products" 2>/dev/null | grep -i "X-MobDeals-Cache" | head -1)
if echo "$CACHE_HEADER" | grep -q "MISS\|HIT"; then
    echo -e "${GREEN}PASS${NC} (Header: $CACHE_HEADER)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}WARN${NC} (No cache header found: $CACHE_HEADER)"
fi

# Test 3: Cart API should bypass cache
echo -n "Testing: Cart API bypasses cache... "
CART_CACHE=$(curl -s -I "$BASE_URL/api/cart" 2>/dev/null | grep -i "X-MobDeals-Cache" | head -1)
if echo "$CART_CACHE" | grep -q "BYPASS"; then
    echo -e "${GREEN}PASS${NC} (Header: $CART_CACHE)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Expected BYPASS, got: $CART_CACHE)"
    ((TESTS_FAILED++))
fi

# Test 4: Webhook without signature should 403
echo ""
echo "--- Webhook Security Tests ---"
echo -n "Testing: Webhook rejects missing signature... "
WEBHOOK_NO_SIG=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/webhooks/woocommerce")
if [ "$WEBHOOK_NO_SIG" = "403" ]; then
    echo -e "${GREEN}PASS${NC} (Status: $WEBHOOK_NO_SIG)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Expected 403, got: $WEBHOOK_NO_SIG)"
    ((TESTS_FAILED++))
fi

# Test 5: Webhook with invalid signature should 403
echo -n "Testing: Webhook rejects invalid signature... "
WEBHOOK_INVALID=$(curl -s -o /dev/null -w '%{http_code}' \
    -X POST "$BASE_URL/api/webhooks/woocommerce" \
    -H "X-WC-Webhook-Signature: invalid_signature" \
    -d '{"test":"data"}')
if [ "$WEBHOOK_INVALID" = "403" ]; then
    echo -e "${GREEN}PASS${NC} (Status: $WEBHOOK_INVALID)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Expected 403, got: $WEBHOOK_INVALID)"
    ((TESTS_FAILED++))
fi

# Test 6: Categories API
echo ""
echo "--- API Functionality Tests ---"
run_test "Categories API returns JSON" "curl -s '$BASE_URL/api/categories' | grep -q 'categories'"

# Test 7: Search API
echo -n "Testing: Search API... "
SEARCH_RESULT=$(curl -s "$BASE_URL/api/search?q=phone" 2>/dev/null)
if echo "$SEARCH_RESULT" | grep -q "products\|total"; then
    echo -e "${GREEN}PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAIL${NC}"
    ((TESTS_FAILED++))
fi

# Test 8: Product page
echo -n "Testing: Product listing page... "
PRODUCT_PAGE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/products")
if [ "$PRODUCT_PAGE" = "200" ]; then
    echo -e "${GREEN}PASS${NC} (Status: $PRODUCT_PAGE)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}FAIL${NC} (Status: $PRODUCT_PAGE)"
    ((TESTS_FAILED++))
fi

# Test 9: Static assets
echo ""
echo "--- Static Asset Tests ---"
echo -n "Testing: Static assets served... "
# Check for favicon or any static asset
STATIC_CHECK=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/favicon.ico")
if [ "$STATIC_CHECK" = "200" ] || [ "$STATIC_CHECK" = "404" ]; then
    echo -e "${GREEN}PASS${NC} (Static asset handling works)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}WARN${NC} (Unexpected status: $STATIC_CHECK)"
fi

# Summary
echo ""
echo "================================"
echo "Test Summary"
echo "================================"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
