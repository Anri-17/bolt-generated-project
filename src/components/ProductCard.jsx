import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import Product3DView from './Product3DView'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <motion.div
      className="card"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="h-64 relative bg-gray-50">
        <Product3DView product={product} />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-text">{product.name}</h3>
        <p className="text-text-light mt-2">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-hero font-bold text-xl">${product.price}</span>
          <button
            onClick={() => addToCart(product)}
            className="btn-outline-black"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  )
}
