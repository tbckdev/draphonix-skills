# Animated Landing Pages Workflow

Use this file when you need the detailed end-to-end process behind the skill.

## Goal

Build a high-end animated landing page by combining:

- inspiration gathering
- AI-generated stills
- looped AI-generated video
- AI-assisted layout generation
- frontend implementation and verification

The source tutorial centered on a "Crypto Portfolio" landing page, but the workflow is reusable for any premium motion-first site.

## Tool Roles

- `Pinterest`: visual inspiration for 3D characters, avatars, and abstract forms
- `Higgfield.ai`: still-image and looped-video generation
- `Nano Banana 2`: still-image generation model used in the tutorial
- `Seedance 2.0`: preferred looping video model from the tutorial
- `Google AI Studio`: code prompting and layout generation
- `Motionsites.ai`: source for structured hero prompts
- `Land-book.com`: section-layout inspiration

## Suggested Build Sequence

### 1. Gather references

Collect:

- one hero-style reference
- one or more structural references for follow-on sections
- optional references for inline media blocks or footer scenes

Separate inspiration by purpose:

- hero mood
- body layout
- media composition

Do not use a single reference to dictate the entire page.

### 2. Generate hero stills

Create:

- abstract background still for the hero
- character or focal-object still if the page needs one

Use the stills as the canonical media source before you animate anything.

### 3. Animate the background

The tutorial preferred `Seedance 2.0` because it looped better than `Kling 3.0`.

Key pattern:

- keep camera movement locked
- avoid extra objects appearing mid-loop
- avoid zoom drift
- request looping animation explicitly

### 4. Generate the first hero implementation

Start from a strong hero prompt. The tutorial copied a "Crypto Wealth Hero Section" prompt from Motionsites and then replaced the placeholder video URL with a generated `.mp4`.

Durable prompt lessons:

- inject the actual media URL or local asset path
- specify theme direction explicitly
- mention typography color when the media is dark

### 5. Blend the hero video into the page

If the video edges look too sharp, ask for top and bottom fades or overlays. A clean loop can still look amateur if it sits in a hard-edged rectangle.

### 6. Build the rest of the page from structural references

Use screenshots from design galleries to inspire the section layout. Ask for:

- 4 to 5 follow-on sections
- matching visual language with the hero
- inspiration from the reference layout without copying it exactly

Keep the existing design system consistent:

- spacing
- palette
- type scale
- card styles
- interaction tone

### 7. Generate inline motion blocks

For sections that need a character or product loop:

1. pick the final container ratio first
2. regenerate the still image at that ratio if needed
3. animate the ratio-correct still
4. replace the placeholder image with the video

The tutorial called out a `3:4` ratio fix for an inline content block. Treat that as a general rule: media ratio must match the slot.

### 8. Add scroll-tied motion carefully

Use scroll-tied playback only where the motion adds narrative value. The source tutorial applied it to a section like "Where wealth takes shape."

Implementation intent:

- update video progress from scroll position
- drive frame changes through the browser render loop
- avoid issuing new frame updates before the previous draw is complete

This is an enhancement. Do not begin here.

### 9. Build composite footer scenes before animation

If you need a footer or closing section with empty center space and visual energy on the sides, build that composition as a still first, then animate it.

The tutorial pattern was:

- combine multiple source images
- keep the center open
- concentrate abstract details on the sides
- animate the composite

### 10. Use the split-video card trick when appropriate

A single video can feel like three synchronized videos across stacked or repeated cards by changing `background-position`:

- card 1: `top`
- card 2: `center`
- card 3: `bottom`

This is a performance optimization and a design trick. Use it when the cards are meant to feel connected.

## Core Implementation Notes

### Theme

If the main video is dark:

- make text light
- deepen backgrounds
- use overlays to blend media edges

### Hosting

The tutorial hotlinked raw Higgfield-hosted `.mp4` files. That is acceptable for experimentation, but production should use downloaded assets hosted on your own infrastructure.

### Performance

Prefer:

- a few strong loops
- static contrast sections
- shared media where possible

Avoid:

- many simultaneous videos
- redundant card videos
- scroll-tied playback on weak narrative sections

### Frontend stack

The tutorial used:

- React with TypeScript
- Vite
- Tailwind CSS
- Inter
- Google Material Icons

Treat that stack as a reference only. Keep the local repo's stack when it already has a frontend system in place.
