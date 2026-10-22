import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { interactionEffects, interactionEffectsJSON } from './interaction-effects'
import type { EffectTrack } from './interaction-effects'
import { useEffectTrack } from './useEffectTrack'
import './interaction-effects.css'

type PlaybackProps = { paused: boolean; reduced: boolean }

function OutlineHighlight({ paused, reduced }: PlaybackProps) {
  const [presetId, setPresetId] = useState('cafe')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    if (paused || !button.current) return
    // Leaving or losing focus while paused must not leave a stale highlight on resume.
    setHovered(matchMedia('(hover: hover)').matches && button.current.matches(':hover'))
    setFocused(button.current.matches(':focus-visible'))
  }, [paused])
  const preset = interactionEffects.highlights.find(item => item.id === presetId)!
  const active = hovered || focused || selected
  const target = focused || selected ? preset.focus : hovered ? preset.hover : preset.rest
  const outlineTrack = useMemo<EffectTrack>(() => ({
    durationMs: preset.durationMs, easing: preset.easing,
    keyframes: [{ offset: 0, filter: preset.rest }, { offset: 1, filter: target }],
  }), [preset, target])
  const opacityTrack = useMemo<EffectTrack>(() => ({
    durationMs: interactionEffects.label.durationMs, easing: 'linear',
    keyframes: [{ offset: 0, opacity: 0 }, { offset: 1, opacity: active ? 1 : 0 }],
  }), [active])
  const labelTrack = useMemo<EffectTrack>(() => ({
    durationMs: interactionEffects.label.durationMs, easing: `steps(${interactionEffects.label.steps}, end)`,
    keyframes: [
      { offset: 0, transform: `translateY(${interactionEffects.label.fromY}px)` },
      { offset: 1, transform: `translateY(${active ? 0 : interactionEffects.label.fromY}px)` },
    ],
  }), [active])
  const icon = useEffectTrack<SVGSVGElement>(outlineTrack, { paused, reduced, redirect: true })
  const label = useEffectTrack<HTMLSpanElement>(opacityTrack, { paused, reduced, redirect: true })
  const labelMotion = useEffectTrack<HTMLSpanElement>(labelTrack, { paused, reduced, redirect: true })

  return <article className="lie-card">
    <h3>轮廓高亮</h3>
    <div className="lie-preview lie-preview-dark">
      <span ref={label} className="lie-float-label" aria-hidden="true"><span ref={labelMotion}>查看详情</span></span>
      <button ref={button} type="button" className="lie-icon-button" aria-label="切换物件高亮" aria-pressed={selected}
        disabled={paused} data-highlighted={active}
        onPointerEnter={event => { if (!paused && event.pointerType !== 'touch') setHovered(true) }}
        onPointerLeave={event => { if (!paused && event.pointerType !== 'touch') setHovered(false) }}
        onFocus={event => { if (!paused) setFocused(event.currentTarget.matches(':focus-visible')) }}
        onBlur={() => { if (!paused) setFocused(false) }}
        onKeyDown={() => { if (!paused) setFocused(true) }}
        onClick={() => { if (!paused) setSelected(value => !value) }}>
        <svg ref={icon} width="60" height="60" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="m32 7 7.6 15.4 17 2.5-12.3 12 2.9 16.9L32 45.8l-15.2 8 2.9-16.9-12.3-12 17-2.5L32 7Z"
            stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
    <select className="lie-select" aria-label="轮廓高亮预设" value={presetId} disabled={paused}
      onChange={event => setPresetId(event.target.value)}>
      {interactionEffects.highlights.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    <p className="lie-hint">悬停、Tab 聚焦，或点按保持</p>
  </article>
}

function StatusHint({ paused, reduced }: PlaybackProps) {
  const [phase, setPhase] = useState<'idle' | 'baking' | 'ready'>('idle')
  const status = useEffectTrack<HTMLSpanElement>(phase === 'idle' ? null : interactionEffects.oven[phase], { paused, reduced })
  const ding = useEffectTrack<HTMLSpanElement>(phase === 'ready' ? interactionEffects.oven.ding : null, { paused, reduced })
  const labels = { idle: '空闲', baking: '处理中', ready: '已完成' }

  return <article className="lie-card">
    <h3>状态提示</h3>
    <div className="lie-preview" data-phase={phase}>
      <span ref={ding} className="lie-ding" aria-hidden="true" hidden={phase !== 'ready'}>完成</span>
      <span ref={status} className="lie-status-chip" data-phase={phase} role="status" aria-atomic="true">
        <span className="lie-status-dot" aria-hidden="true" />{labels[phase]}
      </span>
    </div>
    <div className="lie-state-options" role="group" aria-label="切换提示状态">
      {(['idle', 'baking', 'ready'] as const).map(value => <button key={value} type="button"
        className="lie-button" aria-pressed={phase === value} disabled={paused}
        onClick={() => setPhase(value)}>{labels[value]}</button>)}
    </div>
    <p className="lie-hint">状态变化，让下一步更清楚</p>
  </article>
}

function CompletionFeedback({ paused, reduced }: PlaybackProps) {
  const [playCount, setPlayCount] = useState(0)
  const playback = { paused, reduced, trigger: playCount }
  const tracks = interactionEffects.feeding
  const card = useEffectTrack<HTMLDivElement>(playCount ? tracks.bounce : null, playback)
  const heart = useEffectTrack<HTMLSpanElement>(playCount ? tracks.heart : null, playback)
  const sparkles = useEffectTrack<HTMLSpanElement>(playCount ? tracks.sparkles : null, playback)
  const bubble = useEffectTrack<HTMLSpanElement>(playCount ? tracks.bubble : null, playback)

  return <article className="lie-card">
    <h3>完成反馈</h3>
    <div className="lie-preview lie-feedback-preview">
      <span ref={sparkles} className="lie-sparkles" aria-hidden="true" />
      <span ref={heart} className="lie-heart" aria-hidden="true" />
      <span ref={bubble} className="lie-bubble" aria-hidden="true">完成啦</span>
      <div ref={card} className="lie-completion-card" data-completed={playCount > 0}>
        <span className="lie-check" aria-hidden="true">✓</span><span>{playCount ? '操作完成' : '准备就绪'}</span>
      </div>
    </div>
    <button type="button" className="lie-button lie-play-button" disabled={paused}
      onClick={() => setPlayCount(value => value + 1)}>播放完成反馈</button>
    <p className="lie-hint" role="status" aria-live="polite" aria-atomic="true">
      {playCount ? `已播放第 ${playCount} 次完成反馈` : '点击按钮，查看完成时的小回响'}
    </p>
  </article>
}

export function LiveSignal({ paused, reduced }: PlaybackProps) {
  const dot = useEffectTrack<HTMLSpanElement>(reduced ? null : interactionEffects.live, { paused, reduced })
  return <span ref={dot} className="li-live-dot" aria-hidden="true" />
}

export default function InteractionEffects({ paused, reduced }: PlaybackProps) {
  const id = `lie-${useId().replace(/:/g, '')}`
  return <section className="lie-section" aria-labelledby={`${id}-title`} data-paused={paused}>
    <h2 id={`${id}-title`}>交互动效</h2>
    <div className="lie-grid">
      <OutlineHighlight paused={paused} reduced={reduced} />
      <StatusHint paused={paused} reduced={reduced} />
      <CompletionFeedback paused={paused} reduced={reduced} />
    </div>
    <details className="lie-export">
      <summary>导出扩展动效配置</summary>
      <p>此配置用于闪电岛扩展示例，基础编辑器不支持 filter/循环轨道。</p>
      <label htmlFor={`${id}-config`}>闪电岛扩展动效 JSON</label>
      <textarea id={`${id}-config`} className="lie-config-json" readOnly value={interactionEffectsJSON} spellCheck={false} />
      <a href={`data:application/json;charset=utf-8,${encodeURIComponent(interactionEffectsJSON + '\n')}`}
        download="interaction-effects.json">下载 interaction-effects.json ↓</a>
    </details>
  </section>
}
