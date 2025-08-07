# Custom Component Styles (Tailwind Recipes)

This document defines the canonical Tailwind class recipes for our custom design system. Use these as the single source of truth when styling or refactoring components.

## Foundations

- Typography: `font-sans` (Inter) with refined weights
- Border radius scale: `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-card`
- Shadows: `shadow-soft`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-floating`, `shadow-brand`
- Brand colors:
  - Primary: `primary-600` for actions, `primary-700` hover, `primary-50` subtle bg
  - Secondary: `secondary-600`, `secondary-700`
  - Accent: `accent-500` for highlights
  - Semantic: `success`, `warning`, `danger`, `info`
  - Neutrals: `neutral-…` for text and surfaces

- Focus ring: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`
- Motion tokens: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`

---

## Buttons

Base: `inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`

Sizes:
- sm: `px-3 py-1.5 text-sm`
- md: `px-4 py-2 text-sm`
- lg: `px-6 py-3 text-base`

Variants:
- Primary: `bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft`
- Secondary: `bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-400`
- Outline: `border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500`
- Ghost: `text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-400`
- Danger: `bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500`
- Subtle: `bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-300`

Icon-only (square): add `p-0 h-8 w-8` or `h-6 w-6` for small icon buttons.

---

## Inputs

Field container: `space-y-1`

Label: `block text-sm font-medium text-neutral-700`

Input base: `block w-full px-3 py-2 rounded-md border border-neutral-300 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`

States:
- Error: `border-danger-300 focus:ring-danger-500 focus:border-danger-500` + helper text `text-danger-600`
- Disabled: `bg-neutral-100 text-neutral-500 cursor-not-allowed`

Textarea: same as input base + `resize-none`

---

## Cards

Card: `bg-white rounded-card border border-neutral-200 shadow-soft`

Header: `px-6 py-4 border-b border-neutral-200`

Title: `text-lg font-medium text-neutral-900`

Body: `p-6`

Elevated variant: add `shadow-lg` or `shadow-floating`

Muted variant: `bg-neutral-50`

---

## Modals

Overlay: `fixed inset-0 bg-neutral-900/60 animate-fade-in`

Panel: `inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-floating transform transition-all sm:my-8 sm:align-middle sm:w-full`

Sizes: `sm:max-w-md md:max-w-lg lg:max-w-2xl`

Close button: `rounded-md text-neutral-400 hover:text-neutral-600 focus:ring-primary-500`

---

## Toasts

Base: `flex items-center justify-between p-4 border rounded-md shadow-soft animate-slide-up`

Variants:
- Success: `bg-success-50 border-success-200 text-success-800`
- Error: `bg-danger-50 border-danger-200 text-danger-800`
- Warning: `bg-warning-50 border-warning-200 text-warning-800`
- Info: `bg-info-50 border-info-200 text-info-800`

---

## Chat UI

Message bubble (user): `bg-primary-600 text-white px-4 py-3 rounded-lg max-w-xs lg:max-w-md`

Message bubble (assistant): `bg-white border border-neutral-200 text-neutral-900 shadow-sm px-4 py-3 rounded-lg max-w-xs lg:max-w-md`

Copy button (assistant message): icon button `variant=secondary` + `bg-white/90 hover:bg-white`

Sidebar section: `w-80 bg-white border-r border-neutral-200`

Empty state: `text-neutral-500`, icons `text-neutral-300`

---

## Utility Mixins (apply in CSS if needed)

- Subtle card hover: `transition-colors hover:border-primary-200`
- Lift on hover: `transition-transform hover:-translate-y-0.5 hover:shadow-lg`
- Focus ring default: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`

---

Adopt these recipes when refactoring components in Phase 9.2–9.3.
