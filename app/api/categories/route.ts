import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '@/lib/woocommerce'
import { withCache } from '@/lib/cache'

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withCache(
    request,
    async () => {
      try {
        const categories = await getCategories()
        
        // Filter to only show product categories (not post categories)
        const productCategories = categories.filter(
          cat => cat.count > 0 || cat.parent === 0
        )
        
        return NextResponse.json(
          { categories: productCategories },
          { status: 200 }
        )
      } catch (error) {
        console.error('Categories API error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch categories' },
          { status: 500 }
        )
      }
    },
    { ttl: 300 } // Cache categories for 5 minutes
  )
}
