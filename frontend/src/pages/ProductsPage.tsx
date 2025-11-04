import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { productService, Product } from '../services/productService'
import { cartService } from '../services/cartService'

function ProductsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'created_at')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [message, setMessage] = useState('')

  const categories = [
    { value: '', label: '전체' },
    { value: 'moisturizer', label: '보습제' },
    { value: 'cleanser', label: '클렌저' },
    { value: 'serum', label: '세럼' },
    { value: 'sunscreen', label: '선크림' },
    { value: 'mask', label: '마스크' },
    { value: 'toner', label: '토너' },
  ]

  const sortOptions = [
    { value: 'created_at', label: '최신순' },
    { value: 'price', label: '가격순' },
    { value: 'name', label: '이름순' },
  ]

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['products', category, search, sort, page],
    queryFn: () =>
      productService.getProducts({
        category: category || undefined,
        search: search || undefined,
        sort,
        order: 'DESC',
        page,
        limit: 12,
      }),
  })

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => cartService.addToCart(productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setMessage('장바구니에 추가되었습니다!')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setPage(1)
    updateSearchParams({ category: newCategory, page: '1' })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setPage(1)
    updateSearchParams({ sort: newSort, page: '1' })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    updateSearchParams({ search, page: '1' })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateSearchParams({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    setSearchParams(newParams)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const getProductName = (product: Product) => {
    const lang = i18n.language
    if (lang === 'en' && product.name_en) return product.name_en
    if (lang === 'ja' && product.name_ja) return product.name_ja
    return product.name
  }

  const products = data?.data.products || []
  const pagination = data?.data.pagination

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">제품</h2>
          <p className="text-gray-600 mt-2">당신의 피부에 맞는 제품을 찾아보세요</p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="제품 이름..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" className="btn-primary">
                  검색
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-500">제품이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={getProductName(product)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>

                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {getProductName(product)}
                  </h3>

                  <p className="text-sm text-gray-500 mb-3 capitalize">{product.category}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}원
                    </span>
                    <button
                      onClick={() => addToCartMutation.mutate(product.id)}
                      disabled={addToCartMutation.isPending || product.stock_quantity === 0}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      {product.stock_quantity === 0
                        ? '품절'
                        : addToCartMutation.isPending
                        ? '추가 중...'
                        : '담기'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  이전
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border rounded-lg ${
                      pageNum === page
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default ProductsPage
