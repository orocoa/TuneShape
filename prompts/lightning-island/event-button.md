# Lightning Island · 今日事件卡 / Daily event card

Implement with React, TypeScript and Motion, using the reference in src/lightning-island/IslandExamples.tsx and its scoped style.css. Reuse src/Preview.tsx usePose, src/model.ts, src/easing.ts, src/useDetailPlayback.ts and src/usePrefersReducedMotion.ts. See docs/lightning-island.md for scope and provenance.

## Interaction contract

- Render a compact cream card with a simple text symbol, fictional task text and a native button. Use the shared event-button preset for button feedback. Do not add a scene illustration or image assets.
- Pointer down and Space/Enter down target active; release targets rest. Pointer cancellation, loss of capture, blur and document hiding release the held state. Releasing outside the button does not complete the task. Keyboard repeat must not duplicate activation.
- A valid activation completes the local event exactly once. Show 1 / 1 and append one fictional entry to the LIVE list. Never grant a real reward or call a service.
- The completed card can collapse to a yellow check button and expand again. Move focus to the corresponding visible control. Hidden content is excluded from keyboard navigation.
- Reset restores the incomplete card, expanded details and initial two activity entries.

The composition is inside a disclosure that is collapsed by default, beneath the three interaction-effect cards. Its components use fictional data and in-memory state. Preserve the cream, ink, coral and yellow palette, 3 px borders and hard shadows. No external art, account, API or storage is required.

Pause freezes the actual Motion clock and disables new demonstration inputs. Resume continues; reset remains available. Live prefers-reduced-motion changes settle directly to the target with no delay or animation. Never queue repeated inputs. The shared renderer defines the motion; the rules above define the adapted DOM semantics.

## Exact configuration

```json
{
  "schemaVersion": 1,
  "component": "button",
  "mode": "beginner",
  "animation": "tween",
  "durationMs": 120,
  "delayMs": 0,
  "easing": [
    0.22,
    1,
    0.36,
    1
  ],
  "bounce": 0.25,
  "x": 0,
  "y": 2,
  "scale": 0.98,
  "stiffness": 260,
  "damping": 24,
  "mass": 1,
  "interruption": "retarget",
  "reducedMotion": "instant"
}
```

## Motion state and transition contract

```json
{
  "component": "button",
  "terminology": {
    "id": "basic-button",
    "name": "按钮按压反馈",
    "englishTerm": "Button Press Feedback"
  },
  "states": {
    "rest": {
      "x": 0,
      "y": 0,
      "scale": 1,
      "opacity": 1
    },
    "active": {
      "x": 0,
      "y": 2,
      "scale": 0.98,
      "opacity": 1
    }
  },
  "transition": {
    "type": "tween",
    "duration": 0.12,
    "ease": [
      0.22,
      1,
      0.36,
      1
    ],
    "delay": 0
  },
  "events": {
    "pointerDown": "active",
    "keyDownSpaceOrEnter": "active",
    "pointerUpOrCancel": "rest",
    "keyUpSpaceOrEnter": "rest",
    "blur": "rest"
  },
  "policies": {
    "interruption": "retarget",
    "startFrom": "currentRenderedValue",
    "queue": false,
    "repeat": 0,
    "reducedMotion": {
      "trigger": "prefers-reduced-motion",
      "behavior": "instant",
      "delay": 0,
      "duration": 0,
      "animateTransform": false,
      "animateOpacity": false
    },
    "observationSpeed": "Preview only; excluded from configuration and animation parameters"
  }
}
```

## Verify

Run pnpm test and pnpm build. Then verify pointer, keyboard, cancellation, interrupted transitions, pause/resume, reduced motion, reset and a narrow viewport in the browser. Applying this JSON to a basic TuneShape example reproduces the motion parameters, not the island layout.
