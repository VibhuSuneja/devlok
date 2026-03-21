# Design System: Editorial Specification

## 1. Overview & Creative North Star: "The Celestial Archive"
This design system is not a utility; it is a ritual. We are building a "Celestial Archive"—a digital bridge between the ancient, sacred geometry of Indian mythology and the expansive mystery of the cosmos. 

To break the "template" look of modern SaaS, we abandon soft corners and sterile white space in favor of **Sacred Asymmetry** and **Tonal Depth**. The layout should feel like a rediscovered constellation map: intentional, high-contrast, and intellectually demanding. We use "Void" space not as empty room, but as a gravitational force that pulls the user toward the "Amber-Glow" of knowledge.

---

## 2. Colors: The Cosmic Palette
Our color strategy relies on the contrast between the infinite `surface` and the divine `primary` glow. 

### Surface Hierarchy & Nesting
Forget flat grids. We use **Tonal Layering** to create a physical sense of "receding" into the cosmos.
*   **The Void (`surface` / `#04020f`):** The absolute foundation. All global layouts begin here.
*   **The Inner Sanctum (`surface-container` / `#080520`):** Use this for primary panels. 
*   **The Nested Scroll (`surface-container-high`):** For cards or nested data modules.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Boundaries must be felt, not seen. 
*   Define sections through background shifts (e.g., a `surface-container-low` panel sitting on a `surface` background).
*   Use a **20px Backdrop Blur** on all floating panels to allow the underlying "starfield" textures to bleed through, creating an integrated, ethereal atmosphere.

### Signature Textures
Main CTAs and Hero headers should utilize a **Subtle Radial Gradient** transitioning from `primary` (#f6bd4f) to `primary-container` (#ce9a2e). This mimics the flickering of a diya (oil lamp) rather than a static digital fill.

---

## 3. Typography: The Script of Deities
The typography system is built on a sharp hierarchy that separates the "Divine" (Headings) from the "Scholarly" (Body).

*   **Display & Headline (Cinzel Decorative):** These are our "Gold" tokens. Use `primary` (#f6bd4f). These must feel architectural. Never use sans-serif for titles.
*   **Body & Labels (Cormorant Garamond):** Use `on-surface` (Parchment #e8d5a3). This typeface provides an editorial, manuscript-like quality.
*   **The Label Rule:** All `label-sm` and `label-md` elements must be **ALL CAPS** with a letter-spacing of `0.3em`. This creates an authoritative, "museum-tag" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "software-ish" for this archive. We use light and opacity to define height.

*   **The Layering Principle:** Instead of shadows, stack tiers. A `surface-container-lowest` card placed atop a `surface-container-low` section creates a natural "sunken" or "lifted" effect through sheer value difference.
*   **The "Ghost Border":** If accessibility requires a container edge, use the `outline-variant` token at **15% opacity**. It must be a "Ghost Border"—perceivable only upon focus, never distracting from the content.
*   **Hard Edges:** We reject the modern "pill" shape. Every container, button, and input must follow a **2px max radius**. Sharp corners communicate the precision of ancient architecture.

---

## 5. Components: Primatives & Rituals

### Buttons (The Talismans)
*   **Primary:** Solid `primary` background, `on-primary` text (All Caps), 2px radius. No rounded pills.
*   **Secondary:** Ghost Border (`outline-variant` @ 20%) with `primary` text.
*   **State:** On hover, apply a `primary-fixed` outer glow (4px blur, 10% opacity) to simulate a "radiant aura."

### Input Fields (The Scribe's Entry)
*   **Field:** Background `surface-container-highest`, bottom-border only (`outline-variant`).
*   **Focus:** Transition the bottom border to `primary` (Amber).
*   **Typography:** Labels must be `label-sm` (Parchment, All Caps, 0.4em spacing).

### Cards & Knowledge Graphs
*   **Forbid Dividers:** Do not use lines to separate list items. Use **Vertical Spacing Scale 4 (1.4rem)** or a subtle shift to `surface-container-low`.
*   **Nodes:** Use `tertiary` (Lotus Pink) and `secondary` (Dharma Blue) to categorize entities. Nodes should have a subtle backdrop blur to appear as if floating in the starfield.

### Custom Component: The "Mandala Nav"
A non-linear navigation component using `outline` tokens and 45-degree rotated squares (2px radius) instead of standard circles or icons.

---

## 6. Do's and Don'ts

### Do
*   **Use Intentional Asymmetry:** Align text to the left while placing a decorative Amber element on the far right.
*   **Embrace the Dark:** Ensure the `background` remains deep and "heavy" to make the Amber text pop.
*   **Use Large Typography Scales:** A `display-lg` title should be significantly larger than the body to feel like a monumental inscription.

### Don't
*   **No Rounded Pills:** Never use `border-radius: 999px`. It breaks the sacred, architectural feel.
*   **No Pure White:** White (#ffffff) is forbidden. Use `on-surface` (Parchment) for all "light" needs.
*   **No Divider Overuse:** If you find yourself reaching for a `<hr>` or a 1px line, use a spacing increment from the `1.5` to `3` scale instead.