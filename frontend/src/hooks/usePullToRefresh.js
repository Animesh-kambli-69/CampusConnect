import { useRef, useEffect, useState } from 'react'

/**
 * Hook to detect pull-to-refresh gesture on mobile
 * @param {Function} onRefresh - Callback when pull-to-refresh is triggered
 * @param {number} threshold - Distance (px) to trigger refresh (default: 80)
 * @returns {Object} - { ref, isPulling, pullDistance }
 */
export default function usePullToRefresh(onRefresh, threshold = 80) {
  const ref = useRef(null)
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e) => {
      // Only start pull if at the top of the element
      if (element.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e) => {
      if (!isPulling || element.scrollTop > 0) return

      const currentY = e.touches[0].clientY
      const distance = currentY - touchStartY.current

      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5))
      }
    }

    const handleTouchEnd = () => {
      if (pullDistance >= threshold) {
        onRefresh?.()
      }
      setIsPulling(false)
      setPullDistance(0)
    }

    element.addEventListener('touchstart', handleTouchStart, false)
    element.addEventListener('touchmove', handleTouchMove, false)
    element.addEventListener('touchend', handleTouchEnd, false)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, false)
      element.removeEventListener('touchmove', handleTouchMove, false)
      element.removeEventListener('touchend', handleTouchEnd, false)
    }
  }, [isPulling, pullDistance, threshold, onRefresh])

  return { ref, isPulling, pullDistance }
}
