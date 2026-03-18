import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const variants = {
  primary:   'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
  ghost:     'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white',
  danger:    'bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 border border-red-700/40',
  gradient:  'bg-gradient-brand text-white shadow-glow-indigo',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      disabled={disabled || loading}
      className={cn(
        'font-medium transition-all duration-150 flex items-center gap-2 justify-center select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
