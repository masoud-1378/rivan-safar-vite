# Quickstart & Verification Guide: VibeFarsi Public Storefront

**Feature**: `001-vibefarsi-public-design`  
**Date**: 2026-09-26

---

## 1. Local Development Run

```bash
# In project root: C:\Users\Masoud Akbari\Desktop\Rivan Safar
npm run dev
```

Visit:
- Public Storefront: `http://localhost:3000/`
- Tour Listing: `http://localhost:3000/tours`
- Admin Dashboard: `http://localhost:3000/admin`

---

## 2. Quality & Verification Commands

```bash
# 1. Typecheck and linting
npm run lint

# 2. Production build verification
npm run build

# 3. Dynamic SEO and sitemap integrity check
npm run seo:check
```

---

## 3. Visual & Functional Acceptance Checklist

1. **Token Scope Check**:
   - Inspect public storefront `<body>` in Chrome DevTools: confirm `--background`, `--primary`, `--card` are active.
   - Inspect `/admin`: confirm `.admin-vibefarsi` activates dark graphite tokens without styling collisions.
2. **Typography & Line Spacing**:
   - Confirm font family is Vazirmatn.
   - Ensure zero letter-spacing (`tracking-*`) on Persian text.
3. **Cumulative Layout Shift (CLS)**:
   - Emulate slow 3G network in DevTools.
   - Refresh `/tours`: layout-matching skeletons should appear with exact aspect ratios before real cards hydrate.
4. **Logical RTL Properties**:
   - Inspect elements in DevTools: all padding/margins must be `ps-`, `pe-`, `ms-`, `me-`.
