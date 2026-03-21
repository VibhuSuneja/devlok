Devlok — Design System
For use with Google Stitch (stitch.withgoogle.com)
Paste this entire file into the Stitch canvas before generating any UI. This is the complete design system for Devlok — Indian Mythology Knowledge Graph. Every new page must match this system exactly.
Brand Identity
Name: DEVLOK (देवलोक) Tagline: "Everything you were told was mythology was actually a knowledge system — and this is the map." Aesthetic: Dark cosmic sacred space. Indian classical meets modern digital. A scripture and a spaceship simultaneously. Mood: Intellectual, reverent, beautiful, slightly mysterious. Never playful. Never corporate. Never generic SaaS.
Audience: Urban Indian 18–35, spiritually curious, English-first, educated. They read Marcus Aurelius and are slowly realising Vedanta said the same thing centuries earlier.
Color Palette
Core Colors
--void: #04020f Background — deep space black. Every page starts here.
--deep: #080520 Panel backgrounds, modals, cards
--amber: #d4973a Primary accent — borders, active states, icons
--amber-glow: #f0b84a Headings, brand name, CTA hover states
--amber-dim: #7a5520 Muted borders, secondary text, inactive states
--text: #e8d5a3 Primary body text — warm parchment, never pure white
--text-dim: #7a6840 Secondary text, labels, captions
--border: rgba(212,151,58,0.22) Subtle gold borders on all containers

Node / Type Colors
These are used for character type badges, dots, and accents throughout the UI.
deva #d4973a amber gold — gods, Trimurti
devi #c45c8a lotus pink — goddesses, Shakti
hero #5c8ac4 dharma blue — heroes, kings, warriors
sage #5cb88a sacred green — sages, rishis
asura #c45c5c destroy red — demons, rakshasas
celestial #9a6ed4 celestial purple — apsaras, divine birds, gandharvas

Yuga / Era Colors
eternal rgba(212,151,58,0.5) gold — Trimurti, timeless beings
satya rgba(92,184,138,0.5) green — Age of Truth
treta rgba(92,138,196,0.5) blue — Age of Ritual (Ramayana era)
dvapara rgba(154,110,212,0.5) purple — Age of Duality (Mahabharata era)
kali rgba(196,92,92,0.5) red — Age of Discord (present)

Usage Rules


Never use white (#ffffff) as a background or surface color

Never use black (#000000) — use --void (#04020f)

Text on dark backgrounds: always --text (#e8d5a3), not white

Links and interactive elements: --amber (#d4973a), hover to --amber-glow (#f0b84a)

Error states: #c45c5c (same as asura/destroy)

Success states: #5cb88a (same as sage/sacred)
Typography
Fonts
Headings: 'Cinzel Decorative', serif
— Brand name, page titles, character names, section headers, yuga names
— Google Fonts: Cinzel Decorative weights 400 and 700

Body: 'Cormorant Garamond', serif
— All body text, descriptions, labels, filter buttons, captions
— Google Fonts: Cormorant Garamond weights 300, 400, 500, italic variants

Both fonts load from Google Fonts. Never substitute with system fonts.
Type Scale
Brand title (DEVLOK): 1.2rem Cinzel Decorative 700 --amber-glow
Page/section headings: 2–3rem Cinzel Decorative 400 --amber-glow
Character Sanskrit names: 1.5rem Cinzel Decorative 400 --amber
Sub-headings: 1.1rem Cinzel Decorative 400 --amber
Body copy: 1rem Cormorant Garamond 400 --text
Italic body (descriptions): 0.9rem Cormorant Garamond italic 300 --text
Small labels/badges: 0.6rem Cormorant Garamond 400 --text-dim
letter-spacing: 0.2–0.4em
text-transform: uppercase
Caption/secondary: 0.7rem Cormorant Garamond 400 --text-dim

Letter Spacing Rules


All uppercase small labels: letter-spacing: 0.2em minimum

Brand title DEVLOK: letter-spacing: 0.1em

Body copy: default (no extra spacing)

Sanskrit text: no extra spacing needed
Line Height


Body text: line-height: 1.8 (generous — this is a reading product)

Headings: line-height: 1.2

Labels: line-height: 1.0
Spacing System
4px xs — tight internal padding (badge padding)
8px sm — small gaps between related elements
12px md — standard component padding
20px lg — section internal padding
24px xl — between major sections
48px 2xl — page section separators

Container Rules


Page max-width: 860px centered for content-heavy pages (concept, profile)

Graph page: full-bleed, no max-width

Panel/sidebar width: 340px

Cards: no fixed height, variable by content
Component Rules
Borders
All containers: 1px solid rgba(212,151,58,0.22) — --border
Active/focus: 1px solid #d4973a — --amber
Hover: 1px solid #7a5520 — --amber-dim
Error: 1px solid #c45c5c

Never use box-shadow for elevation. Use backdrop-filter: blur() instead.
Border Radius
Buttons: 2px — sharp, almost square
Cards/panels: 2px — same as buttons
Badges/tags: 1px — barely rounded
Circular dots: 50% — node indicators only

No pill buttons. No large rounded corners. The aesthetic is angular and deliberate.
Buttons
Primary (CTA):
background: rgba(212,151,58,0.15)
border: 1px solid #d4973a
color: #f0b84a
font-family: Cinzel Decorative
font-size: 0.85rem
letter-spacing: 0.2em
text-transform: uppercase
padding: 12px 32px
border-radius: 2px
hover: background rgba(212,151,58,0.25), box-shadow 0 0 24px rgba(212,151,58,0.25)

Secondary/Ghost:
background: transparent
border: 1px solid rgba(212,151,58,0.22)
color: #7a6840
font-family: Cormorant Garamond
font-size: 0.85rem
letter-spacing: 0.08em
text-transform: uppercase
padding: 7px 18px
border-radius: 2px
hover: border-color #7a5520, color #e8d5a3

Danger:
background: rgba(196,92,92,0.15)
border: 1px solid #c45c5c
color: #c45c5c

Cards / Panels
background: linear-gradient(180deg, rgba(8,5,32,0.97) 0%, rgba(4,2,15,0.97) 100%)
border: 1px solid rgba(212,151,58,0.22)
backdrop-filter: blur(20px)
padding: 18px 22px
border-radius: 2px

Input Fields
background: rgba(212,151,58,0.06)
border: 1px solid rgba(212,151,58,0.22)
border-radius: 2px
padding: 7px 10px
color: #e8d5a3
font-family: Cormorant Garamond
font-size: 0.9rem
focus: border-color rgba(212,151,58,0.5), background rgba(212,151,58,0.10)
placeholder: color #7a6840, font-style italic

Badges / Tags
font-size: 0.62rem
letter-spacing: 0.09em
text-transform: uppercase
padding: 2px 7px
border: 1px solid [type color]44 — type color at 27% opacity
border-radius: 1px
color: [type color]

Example: A "DEVA" badge → color: #d4973a; border: 1px solid rgba(212,151,58,0.27)
Section Title Labels
font-size: 0.57rem
letter-spacing: 0.26em
text-transform: uppercase
color: #d4973a
margin-bottom: 8px
padding-bottom: 4px
border-bottom: 1px solid rgba(212,151,58,0.14)

Layout Patterns
Fixed Header
position: fixed
top: 0, left: 0, right: 0
height: ~52px
padding: 11px 20px
background: linear-gradient(180deg, rgba(4,2,15,0.97) 0%, rgba(4,2,15,0.70) 100%)
border-bottom: 1px solid rgba(212,151,58,0.22)
backdrop-filter: blur(16px)
z-index: 100

Contents: Brand (left) → Search + Filters (center) → Action link (right)
Slide-in Panel (Detail Panel)
position: fixed
right: 0, top: 0, bottom: 0
width: 340px
background: linear-gradient(180deg, rgba(8,5,32,0.97) 0%, rgba(4,2,15,0.97) 100%)
border-left: 1px solid rgba(212,151,58,0.22)
backdrop-filter: blur(20px)
z-index: 150
transform: translateX(100%) — hidden state
transform: translateX(0) — open state
transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1)

Fixed Bottom Bar (Yuga Timeline)
position: fixed
bottom: 0, left: 0, right: 0
background: linear-gradient(0deg, rgba(4,2,15,0.97) 0%, rgba(4,2,15,0.70) 100%)
border-top: 1px solid rgba(212,151,58,0.22)
backdrop-filter: blur(12px)
padding: 10px 24px 12px
z-index: 60

Full-page Reading Layout (for /today, /gurukul)
min-height: 100vh
background: #04020f — with starfield ::before pseudo-element
padding: 80px 24px 80px — top padding clears fixed header
max-width: 700px
margin: 0 auto

Starfield Background (always present)
body::before {
content: '';
position: fixed;
inset: 0;
pointer-events: none;
z-index: 0;
background-image:
radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.55) 0%, transparent 100%),
radial-gradient(1px 1px at 18% 72%, rgba(255,255,255,0.35) 0%, transparent 100%),
radial-gradient(1px 1px at 55% 18%, rgba(255,255,255,0.50) 0%, transparent 100%),
radial-gradient(1px 1px at 78% 28%, rgba(255,255,255,0.55) 0%, transparent 100%),
radial-gradient(1.5px 1.5px at 33% 20%, rgba(212,151,58,0.45) 0%, transparent 100%),
radial-gradient(1.5px 1.5px at 70% 80%, rgba(196,92,138,0.35) 0%, transparent 100%);
}

Animation Standards
Transitions
Standard: all 0.2s ease
Panels: all 0.4–0.5s cubic-bezier(0.16, 1, 0.3, 1) — smooth spring
Opacity: opacity 0.18s ease
Hover glow: box-shadow 0.3s ease

Standard Animations
titleGlow: text-shadow pulses amber, 4s ease-in-out infinite
pulse: opacity 0.6 → 1 → 0.6, 2s infinite — used for loading states
floatIn: translateY(30px) opacity(0) → default, 1s cubic-bezier(0.16,1,0.3,1)
scan: left -50% → 100%, 1.3s infinite — loading bar shimmer

Hover States


Buttons: glow effect, box-shadow: 0 0 24px rgba(212,151,58,0.25)

Nav links: color transitions from --text-dim to --amber

List items: padding-left nudge of 5px, arrow moves right 3px

Yuga segments: translateY(-4px) lift
Iconography
No icon libraries (no FontAwesome, no Lucide, no Material Icons).
Use only:


Unicode symbols: × (close), → (navigate), ↗ (share/external), ☆/★ (bookmark), 🔥 (streak)

Sanskrit/Devanagari characters as decorative elements

Color dots (8px circles) as type indicators
Page-specific Rules
Graph Page (/)


Full viewport, no scroll

D3 SVG fills entire background

All UI elements are fixed overlays with backdrop-filter blur

No content behind the graph — the graph IS the content
Character Page (/character/:id)


Centered layout, max-width 600px

Sanskrit name: font-size: 3.5rem, Cinzel Decorative, amber-glow

English name below: font-size: 1.8rem, uppercase, letter-spacing 2px, --text

Type badges use the character's own type color (not hardcoded amber)

"Explore the Graph →" CTA: amber background, dark text
Concept Page (/today) — NOT YET BUILT


Reading layout, max-width 700px, centered

Concept title: 2.5–3rem Cinzel Decorative

Essay body: generous line-height (1.9), 1rem Cormorant Garamond

Related character cards at bottom: horizontal row, clickable
Login / Signup Pages


Centered card, max-width 360px

Card: --deep background, 1px amber border, backdrop blur

No sidebar, no split-screen, pure centered focus
Admin Panel (/admin)


Fixed header bar (58px)

Full-height content area with overflow-y scroll

Table-based layout for character/relationship management
What NOT To Do
Never:


White or light backgrounds on any surface

Sans-serif fonts for headings (no Inter, Poppins, etc.)

Generic SaaS card patterns with drop shadows and large border-radius

Gradient buttons or pill-shaped CTAs

Bootstrap or Tailwind utility class aesthetics

Material Design patterns (elevated cards, FABs, snackbars)

Dark mode toggles — Devlok is always dark, this is not a setting

Skeleton loaders — use the pulse animation and amber scanline instead

Notification toasts — use inline state changes only

Sidebars with icon navigation — the fixed bottom bar handles navigation
Always:


Test on mobile — the primary audience is on their phone

Keep the starfield background present on every page

Maintain amber as the only accent — do not introduce new accent colors

Use type colors (amber/lotus/blue/green/red/purple) contextually for character types only

Ensure all text meets contrast against --void (#04020f)
Stitch-Specific Instructions
When generating UI in Stitch using this design system:


Set the canvas background to #04020f immediately

Use Cinzel Decorative for all headings — specify this explicitly in your prompt

Use Cormorant Garamond for all body text — specify this explicitly

Never accept a white or light-gray surface — reject and regenerate

The amber color (#d4973a) is the ONLY accent color unless type-specific colors apply

All borders are 1px, amber-tinted, semi-transparent

Buttons are sharp (2px border-radius), uppercase, letter-spaced

If Stitch generates rounded cards or pill buttons, add "no rounded corners, sharp 2px border-radius only" to your prompt

Export as layout reference only — do not use Stitch's HTML/CSS export

Use the layout as a reference to build the actual component in React + index.css
Quick Reference Card
Background: #04020f
Panel background: #080520
Primary accent: #d4973a
Heading color: #f0b84a
Body text: #e8d5a3
Secondary text: #7a6840
Border: rgba(212,151,58,0.22)

Heading font: Cinzel Decorative
Body font: Cormorant Garamond

Button radius: 2px
Card radius: 2px
Badge radius: 1px

Standard transition: 0.2s ease
Panel transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1)

Character types:
deva #d4973a
devi #c45c8a
hero #5c8ac4
sage #5cb88a
asura #c45c5c
celestial #9a6ed4

Devlok Design System v1.0 Last updated: March 2026 Maintained by: Vibhu — Sole Builder Do not alter core color values or font choices without updating index.css simultaneously