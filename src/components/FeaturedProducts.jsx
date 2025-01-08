import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ProductCard from './ProductCard'
import { useLanguage } from '../context/LanguageContext'

export default function FeaturedProducts() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .limit(4)

        if (error) {
          throw error
        }
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching featured products:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hero"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Error loading featured products.</p>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <section className="featured-products-section py-12">
      {products.length > 0 && ( // Conditionally render the heading and grid
        <>
          <h2 className="featured-products-title">
            {t('featured_products')}
          </h2>
          <div className="featured-products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
