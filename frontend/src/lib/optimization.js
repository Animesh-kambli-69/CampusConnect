import { useState, useEffect } from 'react'

/**
 * Debounce hook for search and filter inputs
 * Delays function execution until specified delay has passed since last call
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Standalone debounce function for non-React use
 */
export function debounce(func, delay = 500) {
  let timeoutId
  return function debounced(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Optimize Cloudinary URL with auto format and quality
 * Adds f_auto (format) and q_auto (quality) parameters
 */
export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  const {
    format = 'auto', // f_auto - auto format (webp, avif, etc.)
    quality = 'auto', // q_auto - auto quality based on device
    width = null,
    height = null,
    crop = null,
  } = options

  // Parse URL to inject params
  const parts = url.split('/upload/')
  if (parts.length !== 2) return url

  let transformation = `f_${format},q_${quality}`

  if (width) transformation += `,w_${width}`
  if (height) transformation += `,h_${height}`
  if (crop) transformation += `,c_${crop}`

  return `${parts[0]}/upload/${transformation}/${parts[1]}`
}

/**
 * Debounce function for API calls with abort capability
 */
export function createAbortableDebounce(asyncFunc, delay = 500) {
  let timeoutId
  let lastAbortController

  return function debounced(...args) {
    if (lastAbortController) {
      lastAbortController.abort()
    }

    clearTimeout(timeoutId)

    lastAbortController = new AbortController()

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncFunc(...args, lastAbortController.signal)
          resolve(result)
        } catch (error) {
          if (error.name !== 'AbortError') {
            reject(error)
          }
        }
      }, delay)
    })
  }
}
