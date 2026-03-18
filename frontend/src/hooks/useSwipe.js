import { useRef, useEffect } from 'react'

/**
 * Hook to detect swipe gestures on touch devices
 * @param {Function} onSwipeLeft - Callback when swiped left
 * @param {Function} onSwipeRight - Callback when swiped right
 * @param {number} threshold - Minimum distance (px) to trigger swipe (default: 50)
 * @returns {React.RefObject} - Attach to element to track swipes
 */
export default function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const ref = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY

      const diffX = touchStartX.current - touchEndX
      const diffY = touchStartY.current - touchEndY

      // Only trigger if it's more of a horizontal swipe than vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > threshold) {
          onSwipeLeft?.()
        } else if (diffX < -threshold) {
          onSwipeRight?.()
        }
      }
    }

    element.addEventListener('touchstart', handleTouchStart, false)
    element.addEventListener('touchend', handleTouchEnd, false)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, false)
      element.removeEventListener('touchend', handleTouchEnd, false)
    }
  }, [onSwipeLeft, onSwipeRight, threshold])

  return ref
}
