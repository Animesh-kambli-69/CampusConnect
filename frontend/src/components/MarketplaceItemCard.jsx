import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDate, formatPrice } from '../utils/helpers'

function MarketplaceItemCard({ item }) {
  const { _id, id, title, price, images = [], status, createdAt, sellerId: seller } = item
  const listingId = _id || id

  const thumbnailUrl = images && images.length > 0 ? images[0] : null
  const isAvailable = status === 'available'

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(79, 70, 229, 0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden hover:border-indigo-500/60 transition-all shadow-lg shadow-black/20 group flex flex-col"
    >
      {/* Image with overlay effects */}
      <Link to={`/marketplace/${listingId}`} className="block flex-shrink-0 relative overflow-hidden">
        <div className="aspect-video bg-gray-700 overflow-hidden relative">
          {thumbnailUrl ? (
            <>
              <motion.img
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.4 }}
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <span className="text-5xl mb-2 group-hover:scale-110 transition-transform">📦</span>
              <span className="text-gray-500 text-xs font-medium">No image</span>
            </div>
          )}

          {/* Status badge overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-red-900/60 flex items-center justify-center backdrop-blur-sm">
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-900/90 text-red-200 border border-red-700/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-red-900/50"
              >
                ✓ Sold
              </motion.span>
            </div>
          )}

          {/* Available badge */}
          {isAvailable && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute top-3 right-3 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
            >
              🔥 Live
            </motion.div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <Link
            to={`/marketplace/${listingId}`}
            className="text-white font-bold text-sm hover:text-indigo-300 transition-colors line-clamp-2 leading-snug block mb-2"
          >
            {title}
          </Link>

          {/* Price - prominent display */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {formatPrice(price)}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isAvailable
                  ? 'bg-green-900/40 text-green-300 border-green-700/40'
                  : 'bg-red-900/40 text-red-300 border-red-700/40'
              }`}
            >
              {isAvailable ? '✓ Available' : '✗ Sold'}
            </span>
          </motion.div>
        </div>

        {/* Seller info and action */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-700/40">
          <div className="flex-1 min-w-0">
            {seller && (
              <p className="text-gray-500 text-xs leading-tight">
                Listed by{' '}
                <Link
                  to={`/profile/${seller._id || seller.id}`}
                  className="text-indigo-300 hover:text-indigo-200 font-semibold transition-colors"
                >
                  {seller.name}
                </Link>
              </p>
            )}
            <p className="text-gray-600 text-xs mt-0.5 font-medium">{formatDate(createdAt)}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/marketplace/${listingId}`}
              className="text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2 rounded-lg transition-all font-bold shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 flex-shrink-0 inline-block"
            >
              View →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default MarketplaceItemCard
