import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/woocommerce'
import { withCache } from '@/lib/cache'
import { z } from 'zod'

const querySchema = z.object({
  q: z.string().min(1).max(100),
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(12),
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withCache(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url)
        
        const params = querySchema.parse({
          q: searchParams.get('q') || '',
          page: searchParams.get('page') || '1',
          per_page: searchParams.get('per_page') || '12',
        })
        
        const result = await searchProducts(
          params.q,
          params.page,
          params.per_page
        )
        
        return NextResponse.json(result, { status: 200 })
      } catch (error) {
        console.error('Search API error:', error)
        
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Invalid search parameters', details: error.errors },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { error: 'Search failed' },
          { status: 500 }
        )
      }
    },
    { ttl: 60 }
  )
}
