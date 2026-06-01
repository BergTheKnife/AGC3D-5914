# AGC 3D Studios — Design System

## Brand Identity

Italian 3D printing studio. Modern, geometric, minimal, industrial-premium. NOT: futuristic neon, childish, cluttered.

## Colors

```
--color-black:   #111111     (dominant background, headers)
--color-white:   #FFFFFF     (base background)
--color-red:     #CC2222     (primary accent — used sparingly)
--color-red-hover: #AA1A1A
--color-grey-50: #F8F8F8     (light section backgrounds)
--color-grey-100: #F0F0F0
--color-grey-200: #E0E0E0
--color-grey-400: #9A9A9A
--color-grey-600: #555555
--color-grey-800: #2A2A2A
```

## Typography

* **Display / Headings**: Space Grotesk (700, 600) — geometric, modern

* **Body / Labels**: Inter (400, 500) — clean and readable

* **Letter-spacing on brand headings**: tracking-widest for all-caps brand names

## Logo Usage

* SVG logo: /logo.svg (white on dark, black on light)

* Text string: /stringa\_agc.png

* Always maintain clear space around logo

## Layout

* Max container width: 1280px

* Generous white space

* Section padding: py-20 (desktop), py-12 (mobile)

* Grid-based product cards

* Strong typographic hierarchy

## Components

* **Buttons**:

  * Primary: black bg, white text, no border-radius (sharp corners, geometric)

  * Secondary: white bg, black border

  * Accent: red bg, white text (CTAs only)

  * All buttons: uppercase text, tracking-wider, px-6 py-3

* **Cards**: white bg, subtle shadow on hover, sharp corners, clean border

* **Inputs**: black border bottom only (underline style) or full border with focus ring in red

* **Badges**: sharp corners, small uppercase text

## Background

* Hero: dark (#111111) with subtle marble/grain texture from sfondo\_sito.png

* Sections alternate: white / #F8F8F8

* Admin: #F8F8F8 base

## Animations

* Staggered fade-up on section load (Framer Motion / CSS transitions)

* Smooth hover transitions (200ms)

* No heavy animations
