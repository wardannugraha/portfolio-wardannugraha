# Implementation Plan - Multi-Layer PNG & Pre-rendered 3D Parallax Intro & Route Refactoring

Create a high-impact, artistic **Multi-Layer PNG & Pre-rendered 3D WebP Parallax Intro** at the root route (`/`) to act as an interactive visual hook for visitors, while moving the existing full portfolio dashboard to a dedicated route (`/portfolio`).

## User Review Required

> **Route Structure Change**:
> - `/` will load the **Artistic Multi-Layer PNG & 3D WebP Parallax Intro Page** (Interactive Editorial Story Collage).
> - `/portfolio` will load the **Existing Portfolio Showcase** (Bento Hero, Projects, Photography, Skills, Credentials).
> - Navigation bar links will be updated for seamless routing between `/` and `/portfolio`.

> **Multi-Layer & Lightweight 3D Parallax Architecture**:
> To ensure ultra-fast loading (< 1 second) and zero GPU lag even on low-end mobile devices:
> 1. **Background Layer (0.2x speed)**: Giant kinetic typography & ambient procedural gradient canvas.
> 2. **Midground Layer (1.0x speed)**: Pre-rendered 3D WebP sequence (Camera/Device rotation or procedural math 3D) + floating project cards.
> 3. **Foreground Layer (1.5x - 1.8x speed)**: Profile cutout PNG, camera & code icons with 3D parallax tilt & smooth rotation.

---

## Proposed Changes

### Routing & Page Layout

#### [NEW] `app/portfolio/page.tsx`
- Move existing full portfolio code from `app/page.tsx` to `app/portfolio/page.tsx`.
- Update metadata title to "Wardan Nugraha | Full Portfolio".

#### [MODIFY] `app/page.tsx`
- Replace current content with the new **Multi-Layer PNG & 3D WebP Parallax Intro Page**.
- Integrates `ScrollParallaxIntro` component with 100vh pinned multi-layer scroll sequence.
- Displays kinetic text hooks & floating PNG/3D layers at key scroll thresholds.
- Provides a glowing Call-To-Action (CTA) button at the final scroll position to navigate to `/portfolio`.

---

### Components

#### [NEW] `components/ScrollParallaxIntro.tsx`
- High-performance Framer Motion `useScroll` and `useTransform` multi-layer parallax engine.
- Supports modular PNG layer assets & pre-rendered lightweight WebP 3D frames.
- Smooth 60fps velocity transforms (translation, scaling, rotation, opacity).
- Responsive layout supporting mobile touch gestures and desktop scroll wheels.

#### [MODIFY] `components/Navbar.tsx`
- Update navbar links to handle route switching between `/` (Story Intro) and `/portfolio` (Full View).
- Add quick-switch button or brand logo link pointing to `/` or `/portfolio`.

---

## Verification Plan

### Automated Tests
- `npm run build`: Verify Next.js route compilation, TypeScript type checking, and SSR/SSG compatibility for `/` and `/portfolio`.

### Manual Verification
- Test multi-layer PNG & 3D WebP scroll velocity, parallax depth, and layout responsiveness across desktop and mobile screen sizes.
- Verify smooth transition when clicking "Explore Full Portfolio →" button to navigate from `/` to `/portfolio`.
- Check navbar navigation links across both routes.
