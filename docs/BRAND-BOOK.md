# OFFER-HUB Brand Book

**Version 1.0 | March 2026**

> The complete brand guidelines for OFFER-HUB — the blockchain-powered freelance marketplace.

---

## Table of Contents

1. [Brand Foundation](#1-brand-foundation)
2. [Logo System](#2-logo-system)
3. [Color Palette](#3-color-palette)
4. [Typography](#4-typography)
5. [Visual Identity](#5-visual-identity)
6. [Voice & Tone](#6-voice--tone)
7. [Messaging Framework](#7-messaging-framework)
8. [Digital Applications](#8-digital-applications)
9. [Accessibility](#9-accessibility)
10. [Brand Assets](#10-brand-assets)

---

## 1. Brand Foundation

### 1.1 What is OFFER-HUB?

OFFER-HUB is a **blockchain-powered marketplace** that connects freelancers with clients seeking professional services. Built on **Stellar blockchain**, it provides secure, transparent, and efficient solutions for the global freelance economy.

### 1.2 Mission

> To democratize access to global talent by providing a secure, transparent, and empowering platform where freelancers and businesses can connect, collaborate, and grow together.

### 1.3 Vision

> To become the world's most trusted freelance marketplace, where blockchain technology ensures fair payments, transparent transactions, and a thriving global community of professionals.

### 1.4 Core Values

| Value | Description |
|-------|-------------|
| **Security** | Blockchain-backed escrow protection for every transaction |
| **Transparency** | Clear terms, visible processes, and honest communication |
| **Empowerment** | Tools and opportunities that help users grow professionally |
| **Simplicity** | Complex technology made accessible and easy to use |
| **Trust** | Building lasting relationships through reliability |

### 1.5 Value Proposition

**For Clients:**
- Access to skilled freelancers worldwide
- Secure payments with escrow protection
- Powerful project management tools
- Dispute resolution support

**For Freelancers:**
- Global exposure to potential clients
- Guaranteed payments via smart contracts
- Portfolio and reputation building
- Fee-free international transfers

### 1.6 Target Audience

**Primary:**
- Small to medium businesses seeking specialized talent
- Entrepreneurs and startups
- Professional freelancers (designers, developers, writers, marketers)

**Secondary:**
- Agencies looking to outsource specific projects
- Enterprise teams needing flexible workforce
- Students and early-career professionals

### 1.7 Brand Personality

OFFER-HUB is like a **trusted business partner** who:
- Speaks clearly and gets to the point
- Celebrates your wins without being over the top
- Has your back when things go wrong
- Makes complex things feel simple
- Is always professional but never cold

---

## 2. Logo System

### 2.1 Primary Logo

The OFFER-HUB logo consists of a **circular emblem** featuring the stylized letters "O" and "H" integrated into a unified design, paired with the wordmark "OFFER HUB".

```
    ┌─────────────────┐
    │                 │
    │   ╭───╮  ┬   ┬  │
    │   │ ○ │  │───│  │
    │   ╰───╯  │   │  │
    │                 │
    │   OFFER HUB     │
    └─────────────────┘
```

**Logo Construction:**
- The "O" forms the left portion with a circular cutout
- The "H" extends from the "O", creating visual continuity
- Both elements are contained within a circular frame
- Wordmark positioned at the bottom: "OFFER HUB"

### 2.2 Logo Variations

| Variation | Use Case |
|-----------|----------|
| **Full Logo** | Primary use on light backgrounds |
| **Logo + Wordmark** | Headers, marketing materials |
| **Emblem Only** | Favicons, app icons, small spaces |
| **Horizontal** | Navigation bars, email signatures |

### 2.3 Logo Sizing

| Context | Minimum Size | Recommended Size |
|---------|--------------|------------------|
| Favicon | 16x16px | 32x32px |
| Mobile Nav | 32x32px | 40x40px |
| Desktop Nav | 40x40px | 48x48px |
| Marketing | 120x120px | As needed |

### 2.4 Clear Space

Maintain minimum clear space around the logo equal to the height of the "O" element on all sides.

### 2.5 Logo Don'ts

- Do not distort or stretch the logo
- Do not change the logo colors arbitrarily
- Do not add effects (shadows, gradients, outlines)
- Do not rotate the logo
- Do not place on busy backgrounds without proper contrast
- Do not recreate or modify the logo elements

---

## 3. Color Palette

### 3.1 Primary Colors (Teal)

The primary palette is built around **Teal** — representing trust, stability, and growth.

| Color | Hex | RGB | CSS Variable | Tailwind |
|-------|-----|-----|--------------|----------|
| **Primary** | `#149A9B` | rgb(20, 154, 155) | `--color-primary` | `bg-primary` |
| **Primary Alt** | `#159A9C` | rgb(21, 154, 156) | `--color-primary-alt` | `bg-primary-alt` |
| **Primary Hover** | `#0D7377` | rgb(13, 115, 119) | `--color-primary-hover` | `hover:bg-primary-hover` |
| **Primary Hover Alt** | `#0D6E6E` | rgb(13, 110, 110) | `--color-primary-hover-alt` | `hover:bg-primary-hover-alt` |

### 3.2 Secondary & Accent Colors

| Color | Hex | RGB | CSS Variable | Usage |
|-------|-----|-----|--------------|-------|
| **Secondary** | `#002333` | rgb(0, 35, 51) | `--color-secondary` | Dark backgrounds, headers |
| **Accent** | `#15949C` | rgb(21, 148, 156) | `--color-accent` | Highlights, accents |

### 3.3 Neutral Colors

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| **Text Primary** | `#19213D` | `--color-text-primary` | Main text (light mode) |
| **Text Secondary** | `#6D758F` | `--color-text-secondary` | Secondary text, captions |
| **Border** | `#B4B9C9` | `--color-border` | Standard borders |
| **Border Light** | `#E1E4ED` | `--color-border-light` | Subtle borders |
| **Background** | `#F1F3F7` | `--color-background` | Page backgrounds |
| **Input** | `#DEEFE7` | `--color-input` | Input field backgrounds |

### 3.4 Semantic Colors

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| **Success** | `#16A34A` | `--color-success` | Confirmations, success states |
| **Warning** | `#D97706` | `--color-warning` | Warnings, cautions |
| **Error** | `#FF0000` | `--color-error` | Errors, destructive actions |

### 3.5 Gradients

| Name | CSS Value | Usage |
|------|-----------|-------|
| **Hero Gradient** | `linear-gradient(to right, #002333, #15949C)` | Hero sections, feature highlights |
| **Progress Gradient** | `linear-gradient(90deg, #149A9B, #15949C)` | Loading indicators, progress bars |

### 3.6 CSS Implementation

```css
@theme {
  /* Primary (Teal) */
  --color-primary: #149A9B;
  --color-primary-alt: #159A9C;
  --color-primary-hover: #0D7377;
  --color-primary-hover-alt: #0D6E6E;

  /* Secondary (Dark Blue) */
  --color-secondary: #002333;

  /* Accent */
  --color-accent: #15949C;

  /* Neutrals */
  --color-text-primary: #19213D;
  --color-text-secondary: #6D758F;
  --color-border: #B4B9C9;
  --color-border-light: #E1E4ED;
  --color-background: #F1F3F7;
  --color-input: #DEEFE7;

  /* States */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #FF0000;
}

:root {
  /* Gradients */
  --gradient-hero: linear-gradient(to right, #002333, #15949C);
}
```

---

## 4. Typography

### 4.1 Font Family

OFFER-HUB uses the **system font stack** for optimal performance and native feel:

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### 4.2 Type Scale

| Element | Size | Weight | Line Height | Tailwind Class |
|---------|------|--------|-------------|----------------|
| **H1** | 36-48px | Bold (700) | 1.2 | `text-4xl font-bold` |
| **H2** | 30px | Semibold (600) | 1.3 | `text-3xl font-semibold` |
| **H3** | 24px | Semibold (600) | 1.4 | `text-2xl font-semibold` |
| **H4** | 20px | Medium (500) | 1.4 | `text-xl font-medium` |
| **Body** | 16px | Regular (400) | 1.5 | `text-base` |
| **Small** | 14px | Regular (400) | 1.5 | `text-sm` |
| **Caption** | 12px | Regular (400) | 1.4 | `text-xs` |

### 4.3 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| **Bold** | 700 | Headlines, primary emphasis |
| **Semibold** | 600 | Subheadings, buttons, labels |
| **Medium** | 500 | Navigation, secondary emphasis |
| **Regular** | 400 | Body text, descriptions |

### 4.4 Typography Guidelines

**Do:**
- Use consistent hierarchy throughout
- Maintain adequate line spacing for readability
- Use primary text color for main content
- Use secondary text color for supporting content

**Don't:**
- Use more than 3 font weights on a single page
- Stretch or compress typography
- Use all caps except for very short labels (e.g., "NEW")
- Use underlines except for links

---

## 5. Visual Identity

### 5.1 Design Philosophy

OFFER-HUB follows a **dark-first design** approach with **Neumorphism** and **Bento Grid** layouts.

**Core Principles:**
- **Dark-first:** Designed primarily for dark mode, with light mode support
- **Neumorphism:** Soft, extruded UI elements with subtle shadows
- **Bento Grids:** Modular, visually interesting card layouts
- **Minimalism:** Clean interfaces with purposeful elements only

### 5.2 Neumorphism

Neumorphism creates soft, extruded UI elements using dual-direction shadows.

#### Shadow System

**Light Mode:**
```css
/* Raised surface */
--shadow-neumorphic-light: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;

/* Inset/pressed surface */
--shadow-neumorphic-inset-light: inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff;
```

**Dark Mode:**
```css
/* Raised surface */
--shadow-neumorphic-dark: 6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a;

/* Inset/pressed surface */
--shadow-neumorphic-inset-dark: inset 4px 4px 8px #0a0f1a, inset -4px -4px 8px #1e2a4a;
```

#### Surface Types

| Surface | Effect | Use Case |
|---------|--------|----------|
| **Raised** | Neumorphic shadow | Cards, buttons, elevated elements |
| **Inset** | Inset neumorphic shadow | Inputs, pressed states, wells |
| **Flat** | No shadow | Text areas, subtle containers |

#### Neumorphism Do's and Don'ts

**Do:**
- Use on distinct, interactive elements
- Maintain consistent shadow direction (top-left light source)
- Use subtle, low-contrast shadows
- Apply to elevated surfaces only

**Don't:**
- Apply to flat lists or text content
- Use different shadow angles on the same page
- Use high-contrast or colored shadows
- Nest multiple neumorphic elements

### 5.3 Border Radius

| Element | Radius | Tailwind Class |
|---------|--------|----------------|
| **Cards** | 16px | `rounded-2xl` |
| **Buttons** | 12px | `rounded-xl` |
| **Inputs** | 8px | `rounded-lg` |
| **Pills/Tags** | 9999px | `rounded-full` |

### 5.4 Bento Grid Layout

Bento grids create visually interesting layouts with varying card sizes.

#### Grid Structure

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="col-span-2 row-span-2">Large card</div>
  <div class="col-span-1">Small card</div>
  <div class="col-span-1">Small card</div>
  <div class="col-span-2">Wide card</div>
</div>
```

#### Card Sizes

| Size | Columns | Rows | Best For |
|------|---------|------|----------|
| **Small** | 1 | 1 | Stats, metrics, quick actions |
| **Medium** | 2 | 1 | Features, summaries |
| **Large** | 2 | 2 | Hero content, primary features |
| **Wide** | 3-4 | 1 | Banners, CTAs, announcements |
| **Tall** | 1 | 2 | Lists, feeds, timelines |

### 5.5 Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `gap-4` | 16px | Grid gaps, card spacing |
| `gap-6` | 24px | Larger grid gaps |
| `p-4` | 16px | Card padding (compact) |
| `p-6` | 24px | Card padding (standard) |
| `p-8` | 32px | Card padding (spacious) |
| `my-8` | 32px | Section vertical margins |
| `my-12` | 48px | Major section vertical margins |

### 5.6 Iconography

OFFER-HUB uses **outline-style icons** with consistent stroke weights.

| Property | Value |
|----------|-------|
| **Stroke width** | 2px |
| **Style** | Rounded line caps and joins |
| **Sizes** | 16px (sm), 20px (md), 24px (lg) |
| **Color** | Inherits from text color |

---

## 6. Voice & Tone

### 6.1 Brand Voice Attributes

Our voice is consistent across all communications:

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Professional** | Expert and credible, never stiff | "Your payment is protected by escrow." |
| **Empowering** | Encouraging growth and success | "Build your career on your terms." |
| **Clear** | Simple language, no jargon | "Get paid faster." |
| **Confident** | Assured but not arrogant | "The secure way to work online." |
| **Approachable** | Friendly and welcoming | "Need help? We're here for you." |

### 6.2 Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| **Marketing** | Inspiring, benefit-focused | "Find talent, hire smart, grow your business." |
| **Onboarding** | Welcoming, supportive | "Welcome to OFFER-HUB! Let's get you set up." |
| **Help/Support** | Patient, empathetic | "We understand. Let's fix this together." |
| **Error Messages** | Calm, clear, actionable | "Something went wrong. Try again?" |
| **Success Messages** | Celebratory, brief | "Done! Payment sent." |
| **Legal/Terms** | Clear, direct, transparent | "We collect your email for account updates." |

### 6.3 Writing Guidelines

**Do:**
- Use active voice ("We protect your payment")
- Address users directly ("you", "your")
- Lead with benefits, not features
- Be concise — every word should earn its place
- Use sentence case for headings

**Don't:**
- Use passive voice unnecessarily
- Use industry jargon or buzzwords
- Over-promise or exaggerate
- Use negative framing when positive works
- Use ALL CAPS except for acronyms

### 6.4 Word Choice

| Instead of... | Write... |
|---------------|----------|
| Submit | Send |
| Terminate | End |
| Utilize | Use |
| Commence | Start |
| Initiate | Begin |
| Purchase | Buy |
| Execute | Run |
| Leverage | Use |
| Seamless | Easy |
| Robust | Strong |

### 6.5 UI Text Patterns

**Buttons:**
| Action | Label |
|--------|-------|
| Primary CTA | "Get Started" |
| Sign up | "Create Account" |
| Log in | "Sign In" |
| Submit form | "Send" or "Save" |
| Continue flow | "Continue" |
| Destructive | "Delete" (with confirmation) |

**Empty States:**
> [What's missing] + [What to do]
>
> "No projects yet. Create your first project to get started."

**Error States:**
> [What happened] + [What to do]
>
> "Email already in use. Try signing in instead."

**Success States:**
> Brief and celebratory
>
> "Saved!" / "Payment sent!" / "You're all set."

---

## 7. Messaging Framework

### 7.1 Primary Tagline

> **"Find talent, hire smart, grow your business."**

### 7.2 Brand Descriptor (Short)

> **"Connect with skilled freelancers worldwide. Simple hiring, secure payments, and powerful tools to manage your projects."**

### 7.3 Positioning Statement

> **"OFFER-HUB is the premier blockchain-powered marketplace for freelancing. We connect businesses with global talent through secure, transparent, and efficient solutions powered by Stellar blockchain."**

### 7.4 Brand Promise

> **"Empowering freelancers and businesses with secure, blockchain-powered solutions — making work easier to find, manage, and pay."**

### 7.5 Elevator Pitch (30 seconds)

> "OFFER-HUB is a freelance marketplace built on blockchain. We connect businesses with talented freelancers worldwide, and use Stellar blockchain to ensure every payment is secure, instant, and fee-free. Whether you're hiring or freelancing, we make work simple."

### 7.6 Key Messages by Audience

**For Clients:**
- Access global talent instantly
- Pay securely with escrow protection
- Manage projects effortlessly
- Resolve disputes fairly

**For Freelancers:**
- Get paid on time, every time
- Build your global reputation
- Zero-fee international payments
- Grow your business with powerful tools

### 7.7 Feature Headlines

| Feature | Headline | Supporting Copy |
|---------|----------|-----------------|
| **Payments** | "Free Transfers" | Zero-fee international payments powered by Stellar |
| **Security** | "Escrow Protection" | Funds held securely until work is approved |
| **Trust** | "Blockchain-Verified" | Every transaction recorded transparently |
| **Global** | "Worldwide Talent" | Connect with professionals from 150+ countries |

### 7.8 SEO & Social

| Property | Value |
|----------|-------|
| **Site Name** | OFFER HUB |
| **Meta Description** | "Connect with top freelancers and clients on OFFER HUB - the premier marketplace for professional services. Find talent, post projects, and grow your business." |
| **Twitter Handle** | @offerhub |
| **URL** | https://offer-hub.org |

---

## 8. Digital Applications

### 8.1 Website Structure

**Landing Page Sections:**
1. **Navbar** — Logo, navigation, auth buttons (sticky)
2. **Hero Section** — Headline, description, CTA, visual showcase
3. **Powered By** — Trust indicators (Stellar, GitHub)
4. **Experience/Why** — 3 key differentiators
5. **Features Section** — Bento grid of capabilities
6. **How It Works** — 3-step process
7. **CTA Section** — Gradient background, dual CTAs
8. **Footer** — Links, social, legal, "Powered by Stellar"

### 8.2 Component Library

#### Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| **Primary** | Teal bg, neumorphic shadow | Main actions |
| **Secondary** | Dark bg, neumorphic shadow | Alternative actions |
| **Outline** | Teal border, transparent bg | Tertiary actions |
| **Ghost** | Text only, no bg | Subtle/inline actions |

**Sizes:**
- Small: `px-4 py-2 text-sm rounded-xl`
- Medium: `px-6 py-3 text-base rounded-xl`
- Large: `px-8 py-4 text-lg rounded-xl`

#### Cards

| Variant | Style | Usage |
|---------|-------|-------|
| **Neumorphic** | Raised shadow | Primary content cards |
| **Neumorphic Inset** | Inset shadow | Nested content, wells |
| **Flat** | No shadow | Subtle containers |
| **Outlined** | Border only | List items, selections |

#### Inputs

- Neumorphic inset style by default
- Primary color focus ring
- Error state with red ring
- Icon support (left/right positions)

### 8.3 Animation System

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `fade-in` | 0.2s | ease-out | Element appearance |
| `fade-in-up` | 0.4s | ease-out | Section reveals |
| `scale-in` | 0.2s | ease-out | Modal/popup entrance |
| `slide-in-right` | 0.3s | ease-out | Sidebars, drawers |
| `pulse-soft` | 2s | ease-in-out | Loading indicators (loop) |

**Stagger Classes:** `.stagger-1` through `.stagger-6` (50ms increments)

### 8.4 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Default | < 640px | Mobile-first base styles |
| `sm:` | ≥ 640px | Large phones, small tablets |
| `md:` | ≥ 768px | Tablets |
| `lg:` | ≥ 1024px | Laptops, small desktops |
| `xl:` | ≥ 1280px | Desktops |
| `2xl:` | ≥ 1536px | Large screens |

---

## 9. Accessibility

### 9.1 Color Contrast Requirements

All color combinations must meet WCAG 2.1 standards:

| Content Type | Minimum Ratio | Level |
|--------------|---------------|-------|
| Normal text (< 18px) | 4.5:1 | AA |
| Large text (≥ 18px bold, ≥ 24px) | 3:1 | AA |
| UI components & graphics | 3:1 | AA |
| Decorative elements | None | — |

### 9.2 Focus States

All interactive elements must have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid #149A9B;
  outline-offset: 2px;
}
```

### 9.3 Screen Reader Support

- Use `.sr-only` class for visually hidden but accessible content
- All images must have descriptive `alt` text
- Form inputs must have associated `<label>` elements
- Use ARIA attributes for dynamic content
- Announce state changes to assistive technology

### 9.4 Keyboard Navigation

- All interactive elements must be focusable
- Tab order must be logical and predictable
- Provide skip links for main content
- Escape key closes modals and popups
- Enter/Space activates buttons and links

### 9.5 Inclusive Language

| Instead of... | Use... |
|---------------|--------|
| He/she | They |
| Guys | Folks, team, everyone |
| Click here | Select, Choose |
| See below | Read more below |

---

## 10. Brand Assets

### 10.1 Logo Files

| File | Location | Purpose |
|------|----------|---------|
| `OFFER-HUB-logo.png` | `/public/` | Primary logo (1000x1000px) |
| `favicon.ico` | `/public/` | Browser tab icon |
| `og-image.png` | `/public/` | Social sharing preview (1200x630) |

### 10.2 Partner Assets

| Asset | Location | Usage |
|-------|----------|-------|
| `stellar-icon.png` | `/public/` | "Powered by Stellar" section |

### 10.3 Implementation Files

| Resource | Repository | Path |
|----------|------------|------|
| Global CSS | Frontend | `/src/app/globals.css` |
| SEO Config | Frontend | `/src/lib/seo.ts` |
| Style Guide (dev) | Frontend | `/docs/style-guide.md` |
| This Brand Book | All repos | `/docs/BRAND-BOOK.md` |

### 10.4 Social Media Profiles

| Platform | Handle | Status |
|----------|--------|--------|
| X (Twitter) | @offerhub | Active |
| GitHub | OFFER-HUB | Active |
| Instagram | TBD | Planned |
| LinkedIn | TBD | Planned |

---

## Quick Reference Card

### Colors
```
Primary:    #149A9B
Secondary:  #002333
Accent:     #15949C
Success:    #16A34A
Warning:    #D97706
Error:      #FF0000
```

### Typography
```
Font:       System UI stack
Headings:   Bold (700) / Semibold (600)
Body:       Regular (400)
```

### Spacing
```
Border Radius:  Cards 16px, Buttons 12px, Inputs 8px
Grid Gap:       16px (gap-4) or 24px (gap-6)
Card Padding:   16-32px (p-4 to p-8)
```

### Voice
```
Professional · Empowering · Clear · Confident · Approachable
```

### Tagline
```
"Find talent, hire smart, grow your business."
```

---

## Document Info

| Property | Value |
|----------|-------|
| **Version** | 1.0 |
| **Last Updated** | March 2026 |
| **Maintainer** | OFFER-HUB Design Team |
| **Canonical Location** | `OFFER-HUB-Orchestrator/docs/BRAND-BOOK.md` |

---

*This document is the single source of truth for OFFER-HUB brand guidelines. All repositories should reference this version.*
