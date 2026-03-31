import { NextRequest, NextResponse } from 'next/server'
import { getProductBySlug, validateProductData } from '@/lib/woocommerce'
import { withCache } from '@/lib/cache'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  return withCache(
    request,
    async () => {
      try {
        const { slug } = params
        
        if (!slug) {
          return NextResponse.json(
            { error: 'Product slug is required' },
            { status: 400 }
          )
        }
        
        const product = await getProductBySlug(slug)
        
        if (!product) {
          return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
          )
        }
        
        // Validate product data for audit compliance
        const validation = validateProductData(product)
        if (!validation.valid) {
          console.warn(`Product ${slug} validation issues:`, validation.issues)
        }
        
        return NextResponse.json({ product, validation }, { status: 200 })
      } catch (error) {
        console.error('Product API error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch product' },
          { status: 500 }
        )
      }
    },
    { ttl: 60 }
  )
}
