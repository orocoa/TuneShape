# Lightning Island · 更新弹窗 / Update dialog

Implement with React, TypeScript and Motion, using the reference in src/lightning-island/IslandExamples.tsx and its scoped style.css. Reuse src/Preview.tsx usePose, src/model.ts, src/easing.ts, src/useDetailPlayback.ts and src/usePrefersReducedMotion.ts. See docs/lightning-island.md for scope and provenance.

## Interaction contract

- Render a compact native update button. Use the shared event-button preset for its press feedback; do not add a wooden sign, scenery or image assets.
- Opening the board reveals an in-preview dialog with a name and description. Use aria-modal=false; this is not a full application modal and has no global focus trap. Focus the close control on open.
- Close using the close control, backdrop or Escape. When focus is inside, restore it to the board trigger before exit starts. Use inert and aria-hidden at exit start, but hide visually only after the motion settles.
- The backdrop opacity follows the dialog opacity. The preset uses a smooth 160 ms tween instead of the source game's stepped CSS entrance.
- Show only fictional local notices. Do not fetch the source project's releases or copy real user content.
- One Escape closes only the top open layer, leaving the LIVE drawer state intact. The dialog and backdrop must remain inside the preview and remain usable on narrow screens.

The composition is inside a disclosure that is collapsed by default, beneath the three interaction-effect cards. Its components use fictional data and in-memory state. Preserve the cream, ink, coral and yellow palette, 3 px borders and hard shadows. No external art, account, API or storage is required. The update-board filename is retained for configuration compatibility.

Pause freezes the actual Motion clock and disables new demonstration inputs. Resume continues; reset remains available. Live prefers-reduced-motion changes settle directly to the target with no delay or animation. Never queue repeated inputs. The shared renderer defines the motion; the rules above define the adapted DOM semantics.

## Exact configuration

```json
{
  "schemaVersion": 1,
  "component": "modal",
  "mode": "beginner",
  "animation": "tween",
  "durationMs": 160,
  "delayMs": 0,
  "easing": [
    0.22,
    1,
    0.36,
    1
  ],
  "bounce": 0.25,
  "x": 0,
  "y": 12,
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
  "component": "modal",
  "terminology": {
    "id": "basic-modal",
    "name": "模态对话框开合",
    "englishTerm": "Modal Dialog Transition"
  },
  "states": {
    "rest": {
      "x": 0,
      "y": 12,
      "scale": 0.98,
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
    "duration": 0.16,
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
      "duration": 0.16,
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
