# Dark Mode Implementation Guide

## Overview
Phase 10 Dark Mode provides toggle-able light/dark themes for CampusConnect with persistent user preferences.

## Architecture

### 1. Theme Context (`frontend/src/context/ThemeContext.jsx`)
- Manages global theme state (light/dark)
- Persists theme preference to localStorage as 'campusconnect-theme'
- Applies 'dark' class to html element for Tailwind dark mode
- Prevents FOUC (Flash of Unstyled Content) with mounted check

### 2. useTheme Hook (`frontend/src/hooks/useTheme.js`)
```javascript
const { theme, toggleTheme } = useTheme()
```
- Simple interface for consuming theme in components
- Throws error if used outside ThemeProvider

### 3. Theme Provider Integration (`main.jsx`)
- Wraps entire app at root level
- Available to all routes and components
- Initialized before QueryClientProvider

## How It Works

### Theme Detection
1. On app load, ThemeContext checks localStorage for 'campusconnect-theme'
2. Defaults to 'dark' if not found
3. Applies theme by:
   - Adding/removing 'dark' class on `<html>` element
   - Triggeringconditional Tailwind styles via dark: prefix

### Theme Toggle
1. User clicks theme toggle in Profile Settings
2. `toggleTheme()` updates state and localStorage
3. HTML class updates dynamically
4. All components with `dark:` utilities re-style automatically
5. Preference persists across sessions

### Color Mapping

#### Dark Mode (default)
- Background: `bg-gray-900`, `bg-gray-800`, `bg-gray-700`
- Text: `text-white`, `text-gray-400`, `text-gray-300`
- Borders: `border-gray-800`, `border-gray-700`
- Accents: Indigo/Violet gradient

#### Light Mode
- Background: `bg-white`, `bg-gray-50`
- Text: `text-gray-900`, `text-gray-600`, `text-gray-700`
- Borders: `border-gray-200`, `border-gray-300`
- Accents: Same Indigo/Violet (fully visible on light bg)

## Implementation Details

### CSS (`index.css`)
Light mode colors are defined using CSS custom properties that override dark mode values:
```css
html:not(.dark) .bg-gray-900 { background-color: #ffffff; }
html:not(.dark) .text-white { color: #111827; }
```

### Tailwind Configuration (`tailwind.config.js`)
```javascript
darkMode: 'class' // Enables class-based dark mode strategy
```

## Feature Checklist

- [x] Theme Context with provider
- [x] useTheme custom hook
- [x] Theme persistence to localStorage
- [x] HTML class manipulation
- [x] Theme toggle UI in ProfilePage
- [x] Light mode CSS color overrides
- [x] Tailwind dark mode configuration
- [x] Smooth transitions between themes
- [ ] System preference detection (optional)
- [ ] Per-component theme awareness (optional)

## Usage in Components

### Profile Page Settings Section
```jsx
import { useTheme } from '../hooks/useTheme'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-3">
      <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

### Optional: Using Tailwind Dark: Prefix
For more granular control, use `dark:` and `light:` prefixes in component classes:
```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Adaptive content
</div>
```

## Files Modified

1. **Created**
   - `frontend/src/context/ThemeContext.jsx`
   - `frontend/src/hooks/useTheme.js`

2. **Updated**
   - `frontend/src/main.jsx` — Added ThemeProvider wrapper
   - `frontend/src/pages/ProfilePage.jsx` — Added theme toggle UI
   - `frontend/src/tailwind.config.js` — Added darkMode: 'class'
   - `frontend/src/index.css` — Light mode color overrides (already present)

## Browser Support
- All modern browsers supporting CSS class manipulation
- localStorage for persistence
- CSS variables and transitions

## Future Enhancements

1. **System Preference Detection**
   - Detect `prefers-color-scheme` media query
   - Auto-select theme based on system settings

2. **Component-Level Theming**
   - Custom color palettes per company/campus
   - Dynamic theme generation from primary color

3. **Schedule-Based Themes**
   - Auto-switch light mode during day, dark at night

4. **Accessibility**
   - High contrast mode option
   - Reduced motion toggle

## Testing

### Manual Testing
1. Visit `/profile` page
2. Scroll to Settings section
3. Click theme toggle button
4. Verify all UI elements switch colors
5. Refresh page - theme should persist
6. Check browser localStorage: `campusconnect-theme` should be set

### Browser DevTools
```javascript
// Check current theme
localStorage.getItem('campusconnect-theme')

// Manually set theme
localStorage.setItem('campusconnect-theme', 'light')
// Refresh page to apply
```

---

## Status
✅ Phase 10: Dark Mode - COMPLETE (100%)
- Core theme switching: ✅
- Settings panel toggle: ✅
- Persistent preferences: ✅
- Light mode styles: ✅
- Tailwind configuration: ✅
