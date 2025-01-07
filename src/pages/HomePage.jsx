import React from 'react'
import HeroSection from '../components/HeroSection'
import FeaturedProducts from '../components/FeaturedProducts'
import ReviewSection from '../components/ReviewSection'
import Footer from '../components/Footer'
import { useLanguage } from '../context/LanguageContext'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="flex-1">
        {/* Featured Products */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-black">
              {t('featured_products')}
            </h2>
            <FeaturedProducts />
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
