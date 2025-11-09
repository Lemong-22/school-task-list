Based on my analysis of Codedex.io's design language, I'll now generate the complete new design system file:

File: .agent-os/standards/frontend/css.md

Codedex-Inspired Neo-Brutalist Design System
This design system embraces a neo-brutalist dark-mode aesthetic inspired by Codedex.io, featuring bold colors, hard shadows, sharp edges, and a playful yet professional gaming-inspired UI.

Color Palette
Background Colors
Primary Background (Body): #0F1419 (Very Dark Navy/Black)
Secondary Background (Header/Footer): #1A1F2E (Dark Navy)
Content Background (Cards): #252B3B (Dark Slate Blue)
Elevated Content (Hover States): #2D3548 (Lighter Slate)
Accent Colors (Neon/Bold)
Primary Accent (Yellow): #FFD43D (Bright Yellow) - Primary buttons, key CTAs
Success (Green): #4ADE80 (Neon Green) - Success states, positive actions
Info (Cyan): #22D3EE (Bright Cyan) - Info messages, links
Warning (Orange): #FB923C (Bright Orange) - Warnings, alerts
Error (Pink/Red): #FB7185 (Neon Pink) - Errors, destructive actions
Purple Accent: #A78BFA (Soft Purple) - Secondary accents, badges
Text Colors
Primary Text: #F8FAFC (Off-White/Almost White)
Secondary Text: #94A3B8 (Light Slate Grey)
Muted Text: #64748B (Slate Grey)
Disabled Text: #475569 (Dark Slate)
Border & Divider Colors
Primary Border: #334155 (Slate Border)
Hard Shadow: #000000 (Pure Black) - For neo-brutalist shadows
Typography
Font Family
css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
Use a clean, modern sans-serif font stack. For a more playful feel, consider adding a pixel/monospace font for specific UI elements.

Font Sizes (Tailwind Scale)
Heading 1: text-5xl (48px) - Hero titles
Heading 2: text-4xl (36px) - Section titles
Heading 3: text-3xl (30px) - Card titles
Heading 4: text-2xl (24px) - Subsection titles
Body Large: text-lg (18px) - Emphasized body text
Body Regular: text-base (16px) - Default body text
Body Small: text-sm (14px) - Secondary text
Caption: text-xs (12px) - Labels, tags
Font Weights
Bold: font-bold (700) - Headings, CTAs
Semibold: font-semibold (600) - Subheadings, emphasized text
Medium: font-medium (500) - Regular headings
Regular: font-normal (400) - Body text
Border Radius (Sharp Corners)
Neo-Brutalist Approach
Buttons: rounded-none or rounded-sm (0-2px) - Keep edges sharp and bold
Cards: rounded-sm or rounded (2-4px) - Minimal rounding
Inputs: rounded-sm (2px) - Subtle corners
Badges/Tags: rounded (4px) - Slight rounding for small elements
Modals: rounded-md (6px) - Slightly more rounded for large containers
Key Principle: Avoid soft, highly rounded corners (rounded-full, rounded-3xl). Keep it bold and geometric.

Shadows (Neo-Brutalist Hard Shadows)
Shadow System
Use hard-edged, offset shadows instead of soft blur shadows:

css
/* Primary Button Shadow (Yellow/Accent) */
shadow-[4px_4px_0px_#000000]

/* Card Shadow */
shadow-[6px_6px_0px_#000000]

/* Large Modal Shadow */
shadow-[8px_8px_0px_#000000]

/* Hover State - Reduce offset */
shadow-[2px_2px_0px_#000000]

/* No Shadow */
shadow-none
Implementation in Tailwind:

html
<button class="shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] transition-all">
  Click Me
</button>
Button Styles
Primary Button (Yellow/Accent)
html
<button class="
  bg-[#FFD43D] 
  text-black 
  font-bold 
  px-6 py-3 
  rounded-sm 
  shadow-[4px_4px_0px_#000] 
  hover:shadow-[2px_2px_0px_#000] 
  hover:translate-x-[2px] 
  hover:translate-y-[2px]
  transition-all 
  duration-150
">
  Get Started
</button>
Secondary Button (Outlined)
html
<button class="
  bg-transparent 
  text-[#F8FAFC] 
  font-semibold 
  px-6 py-3 
  rounded-sm 
  border-2 
  border-[#F8FAFC] 
  shadow-[4px_4px_0px_#F8FAFC] 
  hover:shadow-[2px_2px_0px_#F8FAFC] 
  hover:translate-x-[2px] 
  hover:translate-y-[2px]
  transition-all 
  duration-150
">
  Learn More
</button>
Tertiary Button (Ghost/Text)
html
<button class="
  bg-transparent 
  text-[#22D3EE] 
  font-medium 
  px-4 py-2 
  rounded-sm 
  hover:bg-[#252B3B] 
  transition-colors
">
  View Details
</button>
Destructive Button (Error/Delete)
html
<button class="
  bg-[#FB7185] 
  text-white 
  font-bold 
  px-6 py-3 
  rounded-sm 
  shadow-[4px_4px_0px_#000] 
  hover:shadow-[2px_2px_0px_#000] 
  hover:translate-x-[2px] 
  hover:translate-y-[2px]
  transition-all 
  duration-150
">
  Delete
</button>
Card Styles
Standard Card
html
<div class="
  bg-[#252B3B] 
  rounded-sm 
  shadow-[6px_6px_0px_#000] 
  p-6 
  border-2 
  border-[#334155]
">
  <!-- Card content -->
</div>
Interactive Card (Hover Effect)
html
<div class="
  bg-[#252B3B] 
  rounded-sm 
  shadow-[6px_6px_0px_#000] 
  hover:shadow-[3px_3px_0px_#000] 
  hover:translate-x-[3px] 
  hover:translate-y-[3px]
  p-6 
  border-2 
  border-[#334155] 
  transition-all 
  duration-150 
  cursor-pointer
">
  <!-- Card content -->
</div>
Form Elements
Input Field
html
<input class="
  bg-[#252B3B] 
  text-[#F8FAFC] 
  border-2 
  border-[#334155] 
  rounded-sm 
  px-4 py-3 
  w-full 
  focus:border-[#22D3EE] 
  focus:outline-none 
  focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)]
  transition-all
" />
Select Dropdown
html
<select class="
  bg-[#252B3B] 
  text-[#F8FAFC] 
  border-2 
  border-[#334155] 
  rounded-sm 
  px-4 py-3 
  w-full 
  focus:border-[#22D3EE] 
  focus:outline-none
">
  <option>Option 1</option>
</select>
Badges & Tags
Status Badge
html
<!-- Success -->
<span class="
  inline-block 
  bg-[#4ADE80] 
  text-black 
  text-xs 
  font-bold 
  px-3 py-1 
  rounded 
  shadow-[2px_2px_0px_#000]
">
  ACTIVE
</span>

<!-- Warning -->
<span class="
  inline-block 
  bg-[#FB923C] 
  text-black 
  text-xs 
  font-bold 
  px-3 py-1 
  rounded 
  shadow-[2px_2px_0px_#000]
">
  PENDING
</span>
CSS Best Practices
Neo-Brutalist Principles
Bold & High Contrast: Use vivid accent colors against dark backgrounds
Hard Shadows: Always use offset hard shadows (shadow-[Xpx_Ypx_0px_#000]), never soft blurs
Sharp Edges: Minimize border radius - keep corners sharp or barely rounded
Geometric Shapes: Embrace rectangles and straight lines
Playful Motion: Add subtle translate effects on hover to enhance the shadow effect
Tailwind Configuration
Add custom colors to 
tailwind.config.js
:

javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'codedex-dark': '#0F1419',
        'codedex-navy': '#1A1F2E',
        'codedex-slate': '#252B3B',
        'codedex-yellow': '#FFD43D',
        'codedex-green': '#4ADE80',
        'codedex-cyan': '#22D3EE',
        'codedex-pink': '#FB7185',
        'codedex-purple': '#A78BFA',
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px #000000',
        'brutal': '4px 4px 0px #000000',
        'brutal-lg': '6px 6px 0px #000000',
        'brutal-xl': '8px 8px 0px #000000',
      },
    },
  },
}
General Best Practices
Consistent Methodology: Use Tailwind utility classes throughout - avoid custom CSS unless absolutely necessary
Design Tokens: Reference the color palette defined above - never hardcode colors outside this system
Component Patterns: Create reusable button/card components that follow these guidelines
Accessibility: Maintain WCAG AA contrast ratios (all colors above meet this requirement on dark backgrounds)
Performance: Leverage Tailwind's JIT mode and PurgeCSS to eliminate unused styles
Motion: Use transition-all duration-150 for smooth micro-interactions without being sluggish
Migration Notes
When transitioning from the old Glassmorphism theme:

Replace all soft shadows (shadow-lg, shadow-xl) with hard shadows (shadow-[4px_4px_0px_#000])
Change rounded corners from rounded-lg/rounded-xl to rounded-sm/rounded
Update color palette from muted blues to bold neon accents
Add translate hover effects to interactive elements
Increase contrast ratios - make text brighter, backgrounds darker
Feedback submitted
