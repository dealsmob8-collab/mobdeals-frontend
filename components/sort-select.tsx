'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface SortSelectProps {
  value: string
}

export function SortSelect({ value }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(nextSort: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', nextSort)
    params.delete('page')

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <select
      name="sort"
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      value={value}
      onChange={(event) => handleChange(event.target.value)}
    >
      <option value="date">Newest First</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="name">Name: A-Z</option>
      <option value="popularity">Most Popular</option>
    </select>
  )
}
