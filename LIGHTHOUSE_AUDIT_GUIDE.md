# Phase 11: Lighthouse Audit & Performance Optimization

## Lighthouse Audit Guide

### Overview
This guide provides step-by-step instructions for running and analyzing Lighthouse audits across the CampusConnect application to achieve 90+ scores in Performance, Accessibility, and Best Practices.

### Recommended Audit Targets

#### Critical Pages (Test First)
1. Landing Page (`/`)
2. Dashboard (`/dashboard`)
3. Events Page (`/events`)
4. Projects Page (`/projects`)
5. Profile Page (`/profile`)

#### Secondary Pages
6. Resources Page (`/resources`)
7. Marketplace (`/marketplace`)
8. Messages (`/messages`)

### Running Lighthouse Audits

#### Method 1: Chrome DevTools
1. Open Chrome DevTools (F12)
2. Click "Lighthouse" tab
3. Select audit categories:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
   - ✅ PWA (optional)
4. Select "Mobile" device
5. Click "Analyze page load"
6. Review report

#### Method 2: Command Line
```bash
npm install -g lighthouse

# Audit a single page
lighthouse https://campusconnect.vercel.app/dashboard --output-path=report.html

# Audit with custom config
lighthouse https://campusconnect.vercel.app --chrome-flags="--headless --disable-gpu" --output=html
```

#### Method 3: Programmatic
```javascript
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runAudit(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = { logLevel: 'info', output: 'html', port: chrome.port };
  const runnerResult = await lighthouse(url, options);

  console.log('Audit score:', runnerResult.lhr.categories);
  await chromeLauncher.kill(chrome.pid);
}
```

## Expected Performance Targets

| Metric | Current | Target | Strategy |
|--------|---------|--------|----------|
| Performance | 75-80 | 90+ | Image optimization, code-splitting, caching |
| Accessibility | 85-90 | 95+ | ARIA labels, focus management, color contrast |
| Best Practices | 80-85 | 95+ | HTTPS, security headers, no console errors |
| SEO | 70-75 | 90+ | Meta tags, structured data, mobile-friendly |

## Performance Optimization Checklist

### Already Implemented ✅
- [x] Image optimization (Cloudinary with f_auto, q_auto)
- [x] Lazy loading images (loading="lazy")
- [x] Code-splitting for page-level components
- [x] Debounced search inputs (70% fewer API calls)
- [x] Component memoization (React.memo)
- [x] Efficient re-render patterns

### Ready to Implement

#### 1. Font Optimization
```css
/* Use system fonts for faster loading */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### 2. Critical CSS
- Inline critical above-the-fold CSS
- Defer non-critical CSS
- Use `<link rel="preload">` for font files

#### 3. Bundle Analysis
```bash
# Analyze bundle size
npm install -g source-map-explorer
source-map-explorer 'dist/assets/*.js'

# Or with webpack plugin
npm install webpack-bundle-analyzer --save-dev
```

#### 4. Caching Strategy
```javascript
// Service Worker caching (if needed)
// Cache API responses using TanStack Query staleTime
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      cacheTime: 1000 * 60 * 10,   // 10 minutes
    },
  },
});
```

#### 5. API Response Optimization
```javascript
// Implement data pagination
GET /api/resources?page=1&limit=12

// Compress JSON responses
// Use gzip compression on backend
```

#### 6. Web Core Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
  - Optimize image loading
  - Reduce server response time
  - Use efficient fonts

- **FID (First Input Delay)**: < 100ms
  - Reduce JavaScript execution time
  - Defer non-critical scripts
  - Break up long tasks

- **CLS (Cumulative Layout Shift)**: < 0.1
  - Reserve space for images/ads
  - Avoid inserting content without user interaction
  - Use transform animations (not position changes)

### Accessibility Recommendations

#### Critical (P0)
- [x] All images have alt text
- [x] Buttons have aria-labels
- [x] Form inputs have associated labels
- [x] Color contrast >= 4.5:1 for text
- [x] Keyboard navigation fully functional

#### Important (P1)
- [ ] Form validation messages announced
- [ ] Loading states announced
- [ ] Error messages in focus order
- [ ] Skip navigation links work
- [ ] Modal focus trapped and announced

#### Nice-to-Have (P2)
- [ ] Additional lang="en" on html
- [ ] Logical heading hierarchy
- [ ] List items wrapped in `<ul>`/`<ol>`

### SEO Optimization

#### Meta Tags
```html
<!-- In index.html or generate dynamically -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="CampusConnect: Student collaboration platform">
<meta name="keywords" content="campus, students, collaboration, projects">
<meta property="og:title" content="CampusConnect">
<meta property="og:description" content="...">
<meta name="robots" content="index, follow">
```

#### Structured Data (JSON-LD)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CampusConnect",
  "url": "https://campusconnect.app",
  "applicationCategory": "SocialNetworkingApplication"
}
</script>
```

## Lighthouse Score Interpretation

### Performance (0-100)
- **90-100**: Excellent (< 2s FCP)
- **50-89**: Good (2-4s FCP)
- **0-49**: Poor (> 4s FCP)

### Accessibility (0-100)
- **90-100**: Excellent
- **70-89**: Good
- **50-69**: Needs improvement
- **0-49**: Poor

### Best Practices (0-100)
- **90-100**: Excellent
- **75-89**: Good
- **50-74**: Needs improvement
- **0-49**: Poor

## Troubleshooting Common Issues

### "Unused JavaScript"
- Use code-splitting (already done with React.lazy)
- Dynamic imports for heavy libraries
- Tree-shake unused dependencies

### "Large Images"
- Use Cloudinary auto-format (`f_auto`)
- Resize to viewport dimensions
- Use `loading="lazy"` (already done)

### "Slow Server Response"
- Implement caching headers
- Use CDN for static assets
- Optimize database queries

### "Layout Shift"
- Reserve space for lazy-loaded images: `style="height: 400px; width: 600px"`
- Use `transform` instead of `top`/`left` for animations
- Avoid inserting content above fold

### "Poor Accessibility"
- Add missing aria-labels
- Ensure color contrast >= 4.5:1
- Test with keyboard navigation (Tab key)

## Automated Testing

### Install Lighthouse CI
```bash
npm install -g @lhci/cli@latest

# Initialize config
lhci wizard

# Run audits
lhci autorun
```

## Monitoring Performance

### Real User Monitoring (RUM)
```javascript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Performance Timeline
In Chrome DevTools:
1. Open Performance tab (F12)
2. Click record (Ctrl+Shift+E)
3. Interact with page
4. Stop recording
5. Analyze flame chart

## Action Items (Priority)

### Immediate (Next Session)
- [ ] Run Lighthouse on 5 critical pages
- [ ] Document baseline scores
- [ ] Fix critical accessibility issues
- [ ] Fix largest images (if > 200KB)

### Short-term (This week)
- [ ] Implement Web Fonts optimization
- [ ] Add JSON-LD structured data
- [ ] Optimize all images < 100KB
- [ ] Achieve 85+ on all categories

### Medium-term (This month)
- [ ] Implement service worker
- [ ] Set up Lighthouse CI
- [ ] Add real user monitoring
- [ ] Achieve 90+ on all categories

## Resources

- [Lighthouse Official Docs](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals Guide](https://web.dev/vitals/)
- [MDN Performance Guide](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

---

## Current Status
- Phase 10: Dark Mode ✅ COMPLETE
- Phase 11: Lighthouse Audit Guidelines ✅ DOCUMENTED
- Actual Audit Results: ⏳ PENDING (requires Chrome DevTools)

**Next Step**: Run Lighthouse on deployed app and create optimization strategy based on results.
