# Prompt Library

Use these prompts as starting points. Adapt them to the current product, art direction, and repo constraints.

## Higgfield: background still

```text
Create a background inspired by this reference. Keep it abstract and suitable for a desktop-style landing-page background. Preserve the premium mood and avoid adding distracting focal objects.
```

## Higgfield: character or focal object still

```text
Create a character inspired by this reference. Expand the framing so the full height is visible. Keep the style premium, sculptural, and consistent with the background.
```

## Higgfield: looping background animation

```text
no camera movement, no extra element to be added, no zoom in and no zoom out, looping animation
```

Use this as the baseline when the goal is a seamless landing-page loop.

## Higgfield: simple object animation

```text
animate this
```

Use this only after the still image already matches the required aspect ratio and composition.

## Higgfield: composite footer or closing scene

```text
Combine these two images into one image. Keep the focal subject smaller and preserve an empty center. Put the abstract visual energy on the sides only while keeping the middle clean for layout content.
```

## Code prompt: dark-mode inversion

```text
The original prompt assumes a light theme with dark text. Reverse that. Keep the whole design in dark mode so the text stays white and readable against the dark video palette.
```

## Code prompt: hero edge blending

```text
Add a black-to-transparent overlay from the top of the video and the same fade from the bottom so the video blends smoothly into the page background.
```

## Code prompt: body-section generation

```text
Build the rest of the landing page around 4 to 5 sections inspired by these layout references. Do not copy the exact layouts. Keep the same style language established in the hero.
```

## Code prompt: scroll-tied playback

```text
Tie this video to scroll progress instead of normal playback. Update the video frame only after the browser has completely finished drawing the previous one.
```

Use this to convey intent. The resulting implementation should still be reviewed for performance and browser behavior.

## Code prompt: split one video across three cards

```text
Use this video as the background for each card. Align the first card to the top of the source, the second card to the center, and the third card to the bottom so all three feel synchronized without loading separate videos.
```

## Prompting reminders

- Inject the real video URL or local asset path instead of leaving placeholders.
- Mention theme direction explicitly when the media palette is dark.
- Tell the coding model to preserve the hero's style when extending the page.
- Match prompt detail to the fragility of the task. Layout prompts can stay high-level. Media-loop prompts should stay constrained.
