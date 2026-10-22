import config from '../../configs/lightning-island/interaction-effects.json'

export interface EffectFrame { offset: number; opacity?: number; transform?: string; filter?: string }
export interface EffectTrack { durationMs: number; delayMs?: number; easing: string; iterations?: 'infinite'; keyframes: EffectFrame[] }
export interface HighlightPreset { id: string; label: string; durationMs: number; easing: string; rest: string; hover: string; focus: string }
export interface InteractionEffectsConfig {
  schemaVersion: 1
  kind: 'lightning-island-effects'
  highlights: HighlightPreset[]
  label: { durationMs: number; fromY: number; steps: number }
  oven: { baking: EffectTrack; ready: EffectTrack; ding: EffectTrack }
  feeding: { bounce: EffectTrack; heart: EffectTrack; sparkles: EffectTrack; bubble: EffectTrack }
  live: EffectTrack
}

/** This extension describes filter/keyframe tracks; it is not a basic TuneShape EffectConfig. */
export function validateInteractionEffects(value: unknown): InteractionEffectsConfig {
  const fail = (message: string): never => { throw new Error(`Island interaction config: ${message}`) }
  const record = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return fail('expected an object')
    return value as Record<string, unknown>
  }
  const numeric = (value: unknown, min: number, max: number) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail('numeric value outside supported range')
  }
  const string = (value: unknown) => { if (typeof value !== 'string' || !value.length) fail('expected a nonempty string') }
  const source = record(value)
  if (source.schemaVersion !== 1 || source.kind !== 'lightning-island-effects') fail('unsupported schema')
  const highlights = source.highlights
  if (!Array.isArray(highlights) || highlights.length !== 3) return fail('expected three highlight presets')
  const ids = new Set<string>()
  for (const item of highlights) {
    const preset = record(item)
    for (const key of ['id', 'label', 'easing', 'rest', 'hover', 'focus']) string(preset[key])
    if (ids.has(preset.id as string)) fail('duplicate highlight id')
    ids.add(preset.id as string)
    numeric(preset.durationMs, 1, 2000)
  }
  const label = record(source.label)
  numeric(label.durationMs, 1, 2000); numeric(label.fromY, 0, 40); numeric(label.steps, 1, 10)
  if (!Number.isInteger(label.steps)) fail('label steps must be an integer')
  const track = (value: unknown) => {
    const item = record(value)
    numeric(item.durationMs, 1, 10000); string(item.easing)
    if (item.delayMs !== undefined) numeric(item.delayMs, 0, 5000)
    if (item.iterations !== undefined && item.iterations !== 'infinite') fail('invalid repeat policy')
    if (!Array.isArray(item.keyframes) || item.keyframes.length < 2) return fail('expected keyframes')
    let previous = -1
    for (const value of item.keyframes) {
      const frame = record(value)
      numeric(frame.offset, 0, 1)
      if ((frame.offset as number) <= previous) fail('keyframe offsets must increase')
      previous = frame.offset as number
      if (Object.keys(frame).some(key => !['offset', 'opacity', 'transform', 'filter'].includes(key))) fail('unsupported animated property')
      if (frame.opacity !== undefined) numeric(frame.opacity, 0, 1)
      for (const key of ['transform', 'filter']) if (frame[key] !== undefined) string(frame[key])
    }
    if (item.keyframes[0].offset !== 0 || previous !== 1) fail('keyframes must include both endpoints')
  }
  const oven = record(source.oven), feeding = record(source.feeding)
  for (const key of ['baking', 'ready', 'ding']) track(oven[key])
  for (const key of ['bounce', 'heart', 'sparkles', 'bubble']) track(feeding[key])
  track(source.live)
  return structuredClone(value) as InteractionEffectsConfig
}

export const interactionEffects = validateInteractionEffects(config)
export const interactionEffectsJSON = JSON.stringify(interactionEffects, null, 2)
