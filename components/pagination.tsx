import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, 'https://shop.mobdeals.co.ke')
    if (page > 1) url.searchParams.set('page', String(page))
    return url.pathname + url.search
  }

  const pages: (number | string)[] = []
  
  // Always show first page
  pages.push(1)
  
  // Show pages around current
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  
  if (start > 2) pages.push('...')
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  if (end < totalPages - 1) pages.push('...')
  
  // Always show last page if more than 1
  if (totalPages > 1) pages.push(totalPages)

  return (
    <nav className="flex items-center justify-center gap-2">
      {/* Previous */}
      <Link
        href={getPageUrl(currentPage - 1)}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors',
          currentPage <= 1
            ? 'pointer-events-none opacity-50'
            : 'hover:bg-secondary'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      {/* Page Numbers */}
      {pages.map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="flex h-10 w-10 items-center justify-center text-muted-foreground">
              ...
            </span>
          ) : (
            <Link
              href={getPageUrl(page as number)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                currentPage === page
                  ? 'border-mobdeals-red bg-mobdeals-red text-white'
                  : 'border-border hover:bg-secondary'
              )}
            >
              {page}
            </Link>
          )}
        </div>
      ))}

      {/* Next */}
      <Link
        href={getPageUrl(currentPage + 1)}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors',
          currentPage >= totalPages
            ? 'pointer-events-none opacity-50'
            : 'hover:bg-secondary'
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </nav>
  )
}
