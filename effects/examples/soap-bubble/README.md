# Soap Bubble UI · 肥皂泡控件

**English** · [简体中文](README.zh-CN.md)

Interactive controls with a flowing interference film, glass refraction and pointer reflections.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/soap-bubble) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/soap-bubble/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/soap-bubble/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover, focus or Preview runs the gallery film. Leave, offscreen and background stop it. Buttons press, search accepts input, switches toggle, sliders support dragging and arrow keys, and the menu supports arrows, Enter and Escape.

## States and motion

The film waits at its current phase, flows when active, swells while pressed and returns on release.

## Motion notes 3

The menu expands from the round trigger and closes into it; rapid changes preserve the current progress.

## Motion notes 4

Scale 1×; radius 40px; backdrop plain; interactive. View showcase; neutral #f1f1f1 page; button “Continue”; search “Search”; menu “Select chats / Read all”; Volume defaults to 40; switch defaults on.

## Motion notes 5

Jiggle (wobble): 0.4; Speed (speed): 1; Seed (seed): 7; Pop effect (pop): droplets; Paused (paused): false.

## Motion notes 6

See-through (seeThrough): 0.3; Bend (seeThroughBend): 0.3; Refraction (refraction): 0.15; Opacity (opacity): 0; Oil opacity (oilOpacity): 1.

## Motion notes 7

Liquid glass (glass): 0.95; Oil film (iridescence): 0.5; Oil size (filmScale): 4.85; Oil coverage (oilCoverage): 0.73; Oil edge (px) (oilEdge): 18; Oil edge fade (oilEdgeFade): 2.33; Clear centre (clearCenter): 0.57; Film thickness (nm) (thickness): 480; Drainage (drainage): 0.35; Swirl (swirl): 0.5; Reflectivity (reflectivity): 1.3; Dispersion (dispersion): 1; Glass bevel (px) (bevel): 14.

## Motion notes 8

Soap palette (soapPalette): natural; Tint (tint): auto; Soap color (soapColor): auto; Soap shades (soapShadeColor): auto; Soap highlights (soapHighlightColor): auto; Shade colour (bottomShadeColor): #ffffff; Red and pink (soapPaletteRed): #ff6685; Gold (soapPaletteGold): #f6d365; Green (soapPaletteGreen): #83e8a9; Cyan (soapPaletteCyan): #60dce9; Blue (soapPaletteBlue): #7799ff; Violet (soapPaletteViolet): #c084fc.

## Motion notes 9

Mirage (mirage): 0.7; Mirage reach (reach): 2; Pointer parallax (tilt): 1; Top highlight length (topLength): 1; Top highlight fade (topFade): 0.4; Top highlight tail (topTail): 1; Lighting (environment): auto; Inner reflection shape (windowTwinShape): mirror; Inner reflection (windowTwin): false; Key reflection (keyLight): true; Bottom shade (bottomShade): false.

## Motion notes 10

Window size (windowSize): 0.75; Window width (windowWidth): 0.8; Window head (windowHead): 0.7; Window tail (windowTail): 0.6; Window intensity (windowIntensity): 0.85; Window gradient (windowGradient): 0.96; Window length (windowLength): 1.3; Window margin (windowMargin): 0.85; Window bend (windowBend): 0.75; Glint size (glintSize): 1.65; Glint intensity (glintIntensity): 0; Glint distance (glintDistance): -0.45; Glint height (glintHeight): 0.65; Window style (windowStyle): edge; Glint shape (glintShape): auto; Window light (windowLight): false.

## Motion notes 11

Pixel ratio (maxDpr): 2.

## Motion notes 12

Oil opacity is independent of tint opacity. Clear centre clears the middle; oil edge affects large controls. Dispersion needs glass, window and glint controls need window light, and six palette colours need custom mode. Open the menu to inspect see-through and bend.

## Motion notes 13

Menu response basis 500 ms; jiggle 0.4; film speed 1. Film flows continuously. Toolbar pause freezes clocks and resumes at the current phase.

## Repeated input and interruption

Rapid changes retarget current state without a queue. Inspector defaults are saved; live inputs, selections, menus, sliders, focus and observation speed are transient. Preview, descriptions, Motion data, offline HTML and source exports share the settings.

## Reduced motion

Film stays still without automatic wobble or pop animation. Menus settle immediately; native search, switches, sliders and keyboard actions remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
