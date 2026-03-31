import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/woocommerce'
import { withCache } from '@/lib/cache'
import { z } from 'zod'

const querySchema = z.object({
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(100).default(12),
  sort: z.enum(['date', 'price_asc', 'price_desc', 'name', 'popularity']).default('date'),
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withCache(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url)
        
        const params = querySchema.parse({
          category: searchParams.get('category') || undefined,
          page: searchParams.get('page') || '1',
          per_page: searchParams.get('per_page') || '12',
          sort: searchParams.get('sort') || 'date',
        })
        
        const result = await getProducts(
          params.category,
          params.page,
          params.per_page,
          params.sort
        )
        
        return NextResponse.json(result, { status: 200 })
      } catch (error) {
        console.error('Products API error:', error)
        
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Invalid query parameters', details: error.errors },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { error: 'Failed to fetch products' },
          { status: 500 }
        )
      }
    },
    { ttl: 60 }
  )
}
