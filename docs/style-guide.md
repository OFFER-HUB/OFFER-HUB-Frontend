# Style Guide

## Design Philosophy

OFFER-HUB uses a **dark-first** design with **Bento grids** and **Neumorphism** for a modern, premium feel.

## Color Palette

### Primary Colors (Teal)

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#149A9B` | Main brand color, CTAs |
| Primary Alt | `#159A9C` | Alternative primary |
| Primary Hover | `#0d7377` | Hover states |
| Primary Hover Alt | `#0d6e6e` | Alternative hover |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Secondary | `#002333` | Dark backgrounds, headers |
| Accent | `#15949C` | Accent elements, highlights |

### Neutrals

| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#19213D` | Main text (light mode) |
| Text Secondary | `#6D758F` | Secondary text, captions |
| Border | `#B4B9C9` | Standard borders |
| Border Light | `#E1E4ED` | Subtle borders |
| Background | `#F1F3F7` | Page backgrounds (light) |
| Input | `#DEEFE7` | Input field backgrounds |

### State Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#16a34a` | Success messages, confirmations |
| Warning | `#d97706` | Warnings, cautions |
| Error | `#FF0000` | Errors, destructive actions |

### Gradients

| Name | Value | Usage |
|------|-------|-------|
| Hero Gradient | `linear-gradient(to right, #002333, #15949C)` | Hero sections, headers |

## CSS Variables

All colors are available as CSS variables via Tailwind's `@theme`:

```css
@theme {
  --color-primary: #149A9B;
  --color-secondary: #002333;
  /* ... */
}
```

Usage in Tailwind classes:
```html
<div class="bg-primary text-secondary border-border">
```

## Bento Grid Rules

Bento grids create visually interesting layouts with varying card sizes.

### Grid Structure

```html
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-2 row-span-2">Large card</div>
  <div class="col-span-1">Small card</div>
  <div class="col-span-1">Small card</div>
  <div class="col-span-2">Wide card</div>
</div>
```

### Spacing Rules

| Element | Spacing |
|---------|---------|
| Grid gap | `gap-4` (16px) or `gap-6` (24px) |
| Card padding | `p-4` (16px) to `p-6` (24px) |
| Section margin | `my-8` (32px) to `my-12` (48px) |

### Card Sizes

| Size | Columns | Rows |
|------|---------|------|
| Small | 1 | 1 |
| Medium | 2 | 1 |
| Large | 2 | 2 |
| Wide | 3-4 | 1 |
| Tall | 1 | 2 |

### Responsive Breakpoints

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

## Neumorphism Rules

Neumorphism creates soft, extruded UI elements using subtle shadows.

### Surface Types

#### Raised (Default)

```css
.neumorphic-raised {
  box-shadow: var(--shadow-neumorphic-dark);
  border-radius: 16px;
}
```

#### Inset (Pressed)

```css
.neumorphic-inset {
  box-shadow: var(--shadow-neumorphic-inset-dark);
  border-radius: 16px;
}
```

### Shadow Variables

| Variable | Value |
|----------|-------|
| `--shadow-neumorphic-light` | `6px 6px 12px #d1d5db, -6px -6px 12px #ffffff` |
| `--shadow-neumorphic-dark` | `6px 6px 12px #0a0f1a, -6px -6px 12px #1e2a4a` |
| `--shadow-neumorphic-inset-light` | `inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff` |
| `--shadow-neumorphic-inset-dark` | `inset 4px 4px 8px #0a0f1a, inset -4px -4px 8px #1e2a4a` |

### Border Radius

| Element | Radius |
|---------|--------|
| Cards | `rounded-2xl` (16px) |
| Buttons | `rounded-xl` (12px) |
| Inputs | `rounded-lg` (8px) |
| Pills/Tags | `rounded-full` |

### Do's and Don'ts

**Do:**
- Use on distinct, interactive elements
- Maintain consistent shadow direction
- Use subtle, low-contrast shadows
- Apply to elevated surfaces

**Don't:**
- Apply to flat lists or text
- Use different shadow angles on the same page
- Use high-contrast or colored shadows
- Nest multiple neumorphic elements

## Focus States

### Accessibility Requirements

All interactive elements must have visible focus states:

```css
.interactive-element:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Focus Ring Utility

```html
<button class="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
  Click me
</button>
```

## Dark Mode

The app defaults to dark mode with `.dark` class on `<html>`:

```html
<html lang="en" class="dark">
```

### Color Contrast

Ensure minimum contrast ratios:
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

### Dark Mode Variables

Colors automatically adapt in dark mode:
- Use `bg-secondary` for dark backgrounds
- Use `text-background` for light text on dark
- Use `border-border` for visible borders

## Typography

### Font Stack

```css
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

### Scale

| Element | Class |
|---------|-------|
| H1 | `text-4xl font-bold` |
| H2 | `text-3xl font-semibold` |
| H3 | `text-2xl font-semibold` |
| H4 | `text-xl font-medium` |
| Body | `text-base` |
| Small | `text-sm` |
| Caption | `text-xs text-text-secondary` |

## Example Component

```tsx
function BentoCard({ title, children, size = "medium" }: BentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 bg-secondary",
        "shadow-[var(--shadow-neumorphic-dark)]",
        size === "large" && "col-span-2 row-span-2",
        size === "wide" && "col-span-2",
        size === "tall" && "row-span-2"
      )}
    >
      <h3 className="text-xl font-semibold text-background mb-4">{title}</h3>
      <div className="text-text-secondary">{children}</div>
    </div>
  );
}
```
