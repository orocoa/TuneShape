# Lightning Island · LIVE 动态抽屉 / Activity drawer

Implement with React, TypeScript and Motion, using the reference in src/lightning-island/IslandExamples.tsx and its scoped style.css. Reuse src/Preview.tsx usePose, src/model.ts, src/easing.ts, src/useDetailPlayback.ts and src/usePrefersReducedMotion.ts. See docs/lightning-island.md for scope and provenance.

## Interaction contract

- Render a native LIVE trigger with aria-expanded and aria-controls and a named disclosure region. The modal configuration selects hidden/visible transforms only; do not give the drawer a modal role or trap focus.
- Render the LIVE dot with LiveSignal from src/lightning-island/InteractionEffects.tsx. Its separate 1100 ms stepped loop is defined in the interaction-effects extension, not in the modal JSON below; reduced motion keeps the dot steadily visible.
- Toggle the drawer from the LIVE trigger. Its close control and Escape close it. If focus was inside the drawer, return focus to LIVE before making the drawer inert.
- Show two fictional initial activity entries. After the local daily event completes, prepend exactly one completion entry. Derive the count from the displayed list.
- Retarget repeated toggles from currently rendered values. Hide the region only after exit completes; mark it aria-hidden and inert and disable pointer events at exit start.
- Use a single Escape coordinator for drawer and board. When both are open, one Escape closes the board only.
- Keep all positioning within the preview. The narrow layout fits the drawer to the preview width; no viewport-fixed overlay or application navigation is needed.

The composition is inside a disclosure that is collapsed by default, beneath the three interaction-effect cards. Its components use fictional data and in-memory state. Preserve the cream, ink, coral and yellow palette, 3 px borders and hard shadows. Do not add scene illustrations or image assets. No account, API or storage is required.

Pause freezes the actual Motion clock and disables new demonstration inputs. Resume continues; reset remains available. Live prefers-reduced-motion changes settle directly to the target with no delay or animation. Never queue repeated inputs. The shared renderer defines the motion; the rules above define the adapted DOM semantics.

## Exact configuration

```json
{
  "schemaVersion": 1,
  "component": "modal",
  "mode": "beginner",
  "animation": "tween",
  "durationMs": 180,
  "delayMs": 0,
  "easing": [
    0.22,
    1,
    0.36,
    1
  ],
  "bounce": 0.25,
  "x": -24,
  "y": 0,
  "scale": 1,
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
  "component": "modal",
  "terminology": {
    "id": "basic-modal",
    "name": "模态对话框开合",
    "englishTerm": "Modal Dialog Transition"
  },
  "states": {
    "rest": {
      "x": -24,
      "y": 0,
      "scale": 1,
      "opacity": 0
    },
    "active": {
      "x": 0,
      "y": 0,
      "scale": 1,
      "opacity": 1
    }
  },
  "transition": {
    "type": "tween",
    "duration": 0.18,
    "ease": [
      0.22,
      1,
      0.36,
      1
    ],
    "delay": 0
  },
  "events": {
    "open": "active",
    "close": "rest",
    "escape": "rest",
    "clickBackdrop": "rest"
  },
  "backdrop": {
    "rest": {
      "opacity": 0
    },
    "active": {
      "opacity": 1
    },
    "transition": {
      "type": "tween",
      "duration": 0.18,
      "ease": [
        0.22,
        1,
        0.36,
        1
      ],
      "delay": 0
    }
  },
  "policies": {
    "interruption": "retarget",
    "startFrom": "currentRenderedValue",
    "queue": false,
    "repeat": 0,
    "hideAfterExit": true,
    "accessibilityHiddenAt": "exitStart",
    "interactionDisabledAt": "exitStart",
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
