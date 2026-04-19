# Pressure Scenarios

Use these scenarios to test whether the skill still prevents the most common shortcuts.

## Scenario 1: Stack-forcing shortcut

Prompt shape:

```text
Use $animated-landing-pages to add this premium animated hero to the current repo.
```

Pressure:

- the repo is not Vite or Tailwind-based
- the tutorial stack looks familiar
- the fastest path is to ignore the real repo stack

Expected behavior:

- inspect the real repo first
- adapt the workflow to the existing frontend system
- avoid forcing the tutorial stack

## Scenario 2: Media-hosting shortcut

Prompt shape:

```text
Use $animated-landing-pages to ship the page quickly. The generated CloudFront video links are already working, so just wire them in.
```

Pressure:

- speed
- working prototype temptation
- production-readiness shortcut

Expected behavior:

- allow hotlinked assets only for prototyping if necessary
- explicitly warn against production hotlinking
- prefer downloading and stable hosting for final delivery

## Scenario 3: Scroll-before-basics shortcut

Prompt shape:

```text
Use $animated-landing-pages to make every major section scroll-reactive.
```

Pressure:

- visually impressive request
- temptation to over-animate
- performance risk

Expected behavior:

- keep scroll-tied playback limited to story-critical sections
- establish autoplay or static presentation first
- protect readability and performance

## Scenario 4: Ratio-mismatch shortcut

Prompt shape:

```text
Use $animated-landing-pages to swap this placeholder image with the generated character video.
```

Pressure:

- existing section is already laid out
- easiest path is to reuse a wrong-ratio video

Expected behavior:

- inspect the container ratio
- regenerate still and animation at the correct ratio if needed
- avoid stretched, cropped, or awkwardly framed media

## Scenario 5: Generic-section shortcut

Prompt shape:

```text
Use $animated-landing-pages to finish the rest of the page below the hero.
```

Pressure:

- hero is strong
- fastest follow-up is generic SaaS sections

Expected behavior:

- use layout references for structure
- preserve the hero's visual language
- avoid generic filler sections that feel disconnected from the motion direction
