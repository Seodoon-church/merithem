import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '../components/Layout'
import { productService } from '../services/productService'
import { cartService } from '../services/cartService'

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  // Fetch product
  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id!),
    enabled: !!id,
  })

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (qty: number) => cartService.addToCart(id!, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setMessage('장바구니에 추가되었습니다!')
      setTimeout(() => setMessage(''), 3000)
    },
  })

  const product = data?.data.product

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const getProductName = () => {
    if (!product) return ''
    const lang = i18n.language
    if (lang === 'en' && product.name_en) return product.name_en
    if (lang === 'ja' && product.name_ja) return product.name_ja
    return product.name
  }

  const getProductDescription = () => {
    if (!product) return ''
    const lang = i18n.language
    if (lang === 'en' && product.description_en) return product.description_en
    if (lang === 'ja' && product.description_ja) return product.description_ja
    return product.description
  }

  const handleAddToCart = () => {
    if (quantity < 1) return
    addToCartMutation.mutate(quantity)
  }

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta
    if (newQty >= 1 && newQty <= (product?.stock_quantity || 0)) {
      setQuantity(newQty)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">로딩 중...</div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 mb-4">제품을 찾을 수 없습니다</p>
          <button onClick={() => navigate('/products')} className="btn-primary">
            제품 목록으로
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          제품 목록으로
        </button>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={getProductName()}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-32 h-32 text-gray-300"
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

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm mb-3 capitalize">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{getProductName()}</h1>
              <p className="text-gray-600">{getProductDescription()}</p>
            </div>

            <div className="mb-6 pb-6 border-b">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xl text-gray-600">원</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">재고:</span>
                {product.stock_quantity > 0 ? (
                  <span className="text-sm text-green-600">{product.stock_quantity}개 남음</span>
                ) : (
                  <span className="text-sm text-red-600">품절</span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">수량</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || product.stock_quantity === 0}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {product.stock_quantity === 0
                  ? '품절'
                  : addToCartMutation.isPending
                  ? '추가 중...'
                  : '장바구니에 담기'}
              </button>
            </div>

            {/* Additional Info */}
            {product.skin_types && product.skin_types.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">적합한 피부 타입</h3>
                <div className="flex flex-wrap gap-2">
                  {product.skin_types.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">주요 성분</h3>
                <ul className="space-y-1">
                  {product.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      • {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.usage_instructions && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">사용 방법</h3>
                <p className="text-sm text-gray-600">{product.usage_instructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProductDetailPage
