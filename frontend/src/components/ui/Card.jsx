import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'bg-gray-800 border border-gray-700/60 rounded-xl transition-colors',
        hover && 'hover:border-indigo-500/30',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
