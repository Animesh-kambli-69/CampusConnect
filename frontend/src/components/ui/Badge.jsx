import { cn } from '../../lib/utils'

const variants = {
  default:  'bg-gray-700/60 text-gray-300 border border-gray-600/40',
  indigo:   'bg-indigo-900/40 text-indigo-300 border border-indigo-700/40',
  green:    'bg-green-900/40 text-green-300 border border-green-700/40',
  yellow:   'bg-yellow-900/40 text-yellow-300 border border-yellow-700/40',
  red:      'bg-red-900/40 text-red-300 border border-red-700/40',
  violet:   'bg-violet-900/40 text-violet-300 border border-violet-700/40',
  orange:   'bg-orange-900/40 text-orange-300 border border-orange-700/40',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={cn(
      'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
