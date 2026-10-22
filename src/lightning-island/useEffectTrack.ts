import { useLayoutEffect, useRef } from 'react'
import type { EffectFrame, EffectTrack } from './interaction-effects'

type EffectElement = HTMLElement | SVGElement
type AnimatedProperty = 'filter' | 'opacity' | 'transform'
const properties: AnimatedProperty[] = ['filter', 'opacity', 'transform']

type Playback = { paused: boolean; reduced: boolean }
type TrackState = {
  element: EffectElement
  track: EffectTrack
  animation: Animation | null
  original: Map<AnimatedProperty, string>
  reduced: boolean
}

function restore(state: TrackState) {
  for (const [property, value] of state.original) {
    if (value) state.element.style.setProperty(property, value)
    else state.element.style.removeProperty(property)
  }
}

function showFrame(state: TrackState, frame: EffectFrame) {
  restore(state)
  for (const property of properties) {
    const value = frame[property]
    if (value !== undefined) state.element.style.setProperty(property, String(value))
  }
}

function syncPlayback(state: TrackState, playback: Playback) {
  const animation = state.animation
  if (!animation || animation.playState === 'finished') return
  if (playback.paused || document.hidden) animation.pause()
  else animation.play()
}

function start(state: TrackState, playback: Playback, from?: Record<string, string>) {
  const { track, element } = state
  const frames: Keyframe[] = track.keyframes.map(frame => ({ ...frame, easing: track.easing }))
  // Redirect transitions from the displayed pose, including a half-finished transition.
  if (from) for (const property of properties) {
    if (frames[0][property] !== undefined) frames[0][property] = from[property]
  }
  state.animation = element.animate(frames, {
    duration: track.durationMs,
    delay: track.delayMs ?? 0,
    iterations: track.iterations === 'infinite' ? Infinity : 1,
    // CSS keyframe easing applies to each segment, not to the overall timeline.
    easing: 'linear',
    fill: 'both',
  })
  syncPlayback(state, playback)
}

function staticFrame(track: EffectTrack) {
  return track.iterations === 'infinite'
    ? track.keyframes.reduce((closest, frame) => Math.abs(frame.offset - .5) < Math.abs(closest.offset - .5) ? frame : closest)
    : track.keyframes[track.keyframes.length - 1]
}

/** One native animation per element. Playback changes never recreate an active track. */
export function useEffectTrack<T extends EffectElement>(
  track: EffectTrack | null,
  { paused, reduced, trigger = 0, redirect = false }: Playback & { trigger?: number; redirect?: boolean },
) {
  const ref = useRef<T>(null)
  const current = useRef<TrackState | null>(null)
  const playback = useRef<Playback>({ paused, reduced })
  playback.current = { paused, reduced }

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const previous = current.current
    // getComputedStyle is live: copy values before canceling the previous animation.
    const displayed = redirect ? getComputedStyle(element) : null
    const from = displayed ? Object.fromEntries(properties.map(property => [property, displayed.getPropertyValue(property)])) : null
    if (previous) {
      previous.animation?.cancel()
      restore(previous)
    }
    current.current = null
    if (!track) return
    const original = new Map<AnimatedProperty, string>()
    for (const property of properties) {
      if (track.keyframes.some(frame => frame[property] !== undefined)) original.set(property, element.style.getPropertyValue(property))
    }
    const state: TrackState = { element, track, animation: null, original, reduced: playback.current.reduced }
    current.current = state
    if (state.reduced) showFrame(state, staticFrame(track))
    else start(state, playback.current, from ?? undefined)
  }, [track, trigger, redirect])

  useLayoutEffect(() => {
    const state = current.current
    if (!state) return
    if (reduced !== state.reduced) {
      state.reduced = reduced
      if (reduced) {
        state.animation?.cancel()
        state.animation = null
        showFrame(state, staticFrame(state.track))
      } else if (state.track.iterations === 'infinite') {
        restore(state)
        start(state, playback.current)
      }
    }
    syncPlayback(state, playback.current)
  }, [paused, reduced])

  useLayoutEffect(() => {
    const visibility = () => {
      if (current.current) syncPlayback(current.current, playback.current)
    }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      const state = current.current
      if (state) { state.animation?.cancel(); restore(state) }
      current.current = null
    }
  }, [])

  return ref
}
