import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { AriaAttributes, ReactNode, Ref } from 'react'
import { motion } from 'motion/react'
import { usePose } from '../Preview'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { eventButtonConfig, islandExamples, liveDrawerConfig, updateBoardConfig } from './configs'
import InteractionEffects, { LiveSignal } from './InteractionEffects'
import './style.css'

type PixelButtonProps = AriaAttributes & {
  children: ReactNode
  className?: string
  id?: string
  ref?: Ref<HTMLButtonElement>
  paused: boolean
  reduced: boolean
  onActivate: () => void
}

/** Native click activation; keyboard hold/release is explicit so key repeat never activates twice. */
function PixelButton({ children, className = '', paused, reduced, onActivate, ...attributes }: PixelButtonProps) {
  const [pressed, setPressed] = useState(false)
  const held = useRef<string | number | null>(null)
  const pressBounds = useRef<DOMRect | null>(null)
  const pendingRelease = useRef(false)
  const allowPointerClick = useRef(false)
  const pose = usePose(eventButtonConfig, pressed, 1, reduced, paused)

  const release = () => {
    held.current = null
    pressBounds.current = null
    if (paused) pendingRelease.current = true
    else setPressed(false)
  }
  const cancel = () => {
    if (held.current === null) return
    allowPointerClick.current = false
    release()
  }
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel
  useEffect(() => {
    const blur = () => cancelRef.current()
    const visibility = () => { if (document.hidden) cancelRef.current() }
    window.addEventListener('blur', blur)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('blur', blur)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])
  useEffect(() => {
    if (paused) cancelRef.current()
    else if (pendingRelease.current) {
      pendingRelease.current = false
      setPressed(false)
    }
  }, [paused])

  return <motion.button
    {...attributes}
    type="button"
    className={`li-button ${className}`}
    disabled={paused}
    data-state={pressed ? 'pressed' : 'rest'}
    style={{ x: pose.x, y: pose.y, scale: pose.scale, opacity: pose.opacity }}
    onPointerDown={event => {
      if (event.button !== 0 || paused || held.current !== null) return
      allowPointerClick.current = false
      held.current = event.pointerId
      // Keep the hit area from pointer-down; the press animation moves the button.
      pressBounds.current = event.currentTarget.getBoundingClientRect()
      event.currentTarget.setPointerCapture(event.pointerId)
      setPressed(true)
    }}
    onPointerUp={event => {
      if (held.current !== event.pointerId) return
      const bounds = pressBounds.current ?? event.currentTarget.getBoundingClientRect()
      allowPointerClick.current = !paused && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom
      release()
    }}
    onPointerCancel={cancel}
    onLostPointerCapture={cancel}
    onBlur={cancel}
    onKeyDown={event => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      event.preventDefault()
      if (paused || event.repeat || held.current !== null) return
      held.current = event.key
      setPressed(true)
    }}
    onKeyUp={event => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      event.preventDefault()
      if (held.current !== event.key) return
      release()
      if (!paused) onActivate()
    }}
    onClick={event => {
      if (paused || (event.detail > 0 && !allowPointerClick.current)) return
      allowPointerClick.current = false
      onActivate()
    }}
  >{children}</motion.button>
}

const INITIAL_ACTIVITY = [
  { id: 'sample-2', time: '09:10', title: '码头挂起一串小灯', detail: '虚构场景里，多了一处暖黄色的光。' },
  { id: 'sample-1', time: '09:00', title: '小岛开始新的一天', detail: '今天的演示任务：给花园浇一壶水。' },
]
const COMPLETED_ACTIVITY = { id: 'sample-completed', time: '刚刚', title: '花园喝到水啦', detail: '你完成了今日小事。此条仅记录本次页面内的演示。' }

function IslandPlayground({ paused, reduced }: { paused: boolean; reduced: boolean }) {
  const [completed, setCompleted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [boardOpen, setBoardOpen] = useState(false)
  const completedRef = useRef(false)
  const identity = `li-${useId().replace(/:/g, '')}`
  const liveTrigger = useRef<HTMLButtonElement>(null)
  const drawer = useRef<HTMLDivElement>(null)
  const boardTrigger = useRef<HTMLButtonElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const boardClose = useRef<HTMLButtonElement>(null)
  const eventAction = useRef<HTMLButtonElement>(null)
  const focusEventAction = useRef(false)
  const focusBoardOnOpen = useRef(false)
  const drawerPose = usePose(liveDrawerConfig, drawerOpen, 1, reduced, paused)
  const boardPose = usePose(updateBoardConfig, boardOpen, 1, reduced, paused)
  const activities = completed ? [COMPLETED_ACTIVITY, ...INITIAL_ACTIVITY] : INITIAL_ACTIVITY

  const closeDrawer = () => {
    if (paused) return
    if (drawer.current?.contains(document.activeElement)) liveTrigger.current?.focus()
    setDrawerOpen(false)
  }
  const closeBoard = () => {
    if (paused) return
    if (board.current?.contains(document.activeElement)) boardTrigger.current?.focus()
    focusBoardOnOpen.current = false
    setBoardOpen(false)
  }
  const escapeRef = useRef({ boardOpen, drawerOpen, closeBoard, closeDrawer })
  escapeRef.current = { boardOpen, drawerOpen, closeBoard, closeDrawer }
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      const current = escapeRef.current
      // One listener and one branch: a single Escape only dismisses the top layer.
      if (current.boardOpen) { event.preventDefault(); current.closeBoard() }
      else if (current.drawerOpen) { event.preventDefault(); current.closeDrawer() }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])
  useLayoutEffect(() => {
    if (boardOpen && boardPose.visible && focusBoardOnOpen.current) {
      boardClose.current?.focus()
      focusBoardOnOpen.current = false
    }
  }, [boardOpen, boardPose.visible])
  useLayoutEffect(() => {
    if (focusEventAction.current) {
      eventAction.current?.focus()
      focusEventAction.current = false
    }
  }, [collapsed])

  const completeEvent = () => {
    if (paused || completedRef.current) return
    completedRef.current = true
    setCompleted(true)
  }
  const toggleEvent = () => {
    if (paused) return
    focusEventAction.current = true
    setCollapsed(value => !value)
  }

  return <section className={`li-scene${drawerOpen ? ' li-scene-live-open' : ''}`} aria-label="闪电岛 UI 交互预览" data-paused={paused}>
    <div className="li-scene-actions">
    <span className="li-scene-badge">组件组合 · 演示数据</span>
    <PixelButton ref={liveTrigger} className="li-live-trigger" paused={paused} reduced={reduced}
      aria-expanded={drawerOpen} aria-controls={`${identity}-live`} aria-label="岛上动态 LIVE"
      onActivate={() => drawerOpen ? closeDrawer() : setDrawerOpen(true)}>
      <LiveSignal paused={paused} reduced={reduced} /> LIVE <span className="li-live-count">{activities.length}</span>
    </PixelButton>

    <PixelButton ref={boardTrigger} className="li-board-trigger" paused={paused} reduced={reduced}
      aria-haspopup="dialog" aria-expanded={boardOpen} aria-controls={`${identity}-board`} aria-label="打开岛屿更新看板"
      onActivate={() => { focusBoardOnOpen.current = true; setBoardOpen(true) }}>
      查看更新
    </PixelButton>
    </div>
    <div className="li-component-panels">
    <section className={`li-event ${collapsed ? 'li-event-collapsed' : 'li-panel'}`} aria-label="今日小事" data-completed={completed}>
      {collapsed ? <PixelButton ref={eventAction} className="li-event-check" paused={paused} reduced={reduced}
        aria-label="展开今日事件详情" aria-expanded={false} aria-controls={`${identity}-event`} onActivate={toggleEvent}>✓</PixelButton> : null}
      <div id={`${identity}-event`} className="li-event-content" hidden={collapsed}>
        <div className="li-event-glyph" aria-hidden="true">{completed ? '✓' : '✦'}</div>
        <div className="li-event-copy">
          <span className="li-kicker">{completed ? '今日已完成' : '今日小事'}</span>
          <h2>{completed ? '花园喝到水啦' : '给花园浇一壶水'}</h2>
          <p>{completed ? '新的动态已经写进 LIVE。收起卡片，留一点空间给小岛。' : '按住按钮感受反馈，松开完成这件小事。花朵正等着你的帮助。'}</p>
          <div className="li-event-actions">
            <PixelButton ref={collapsed ? undefined : eventAction} className={completed ? '' : 'li-button-coral'} paused={paused} reduced={reduced}
              aria-expanded={completed ? true : undefined} aria-controls={completed ? `${identity}-event` : undefined}
              onActivate={completed ? toggleEvent : completeEvent}>{completed ? '收起详情' : '帮忙浇水'}</PixelButton>
            <span className="li-reward">今日完成 <strong>{completed ? 1 : 0}</strong> / 1</span>
          </div>
        </div>
      </div>
    </section>

    <motion.div ref={drawer} id={`${identity}-live`} className="li-drawer li-panel" role="region"
      aria-labelledby={`${identity}-live-title`} aria-hidden={!drawerOpen} inert={!drawerOpen}
      data-state={drawerOpen ? 'open' : 'closed'}
      style={{ x: drawerPose.x, y: drawerPose.y, scale: drawerPose.scale, opacity: drawerPose.opacity, display: drawerPose.visible ? 'block' : 'none', pointerEvents: drawerOpen ? 'auto' : 'none' }}>
      <div className="li-panel-heading">
        <div><span className="li-eyebrow">LIVE LOG / 演示数据</span><h2 id={`${identity}-live-title`}>岛上动态</h2></div>
        <PixelButton paused={paused} reduced={reduced} className="li-small-button" onActivate={closeDrawer} aria-label="关闭岛上动态">关闭</PixelButton>
      </div>
      <p className="li-drawer-note">只记录这一页的小小变化。</p>
      <ol className="li-activity-list">{activities.map(activity => <li key={activity.id}>
        <span className="li-activity-time">{activity.time}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p></div>
      </li>)}</ol>
    </motion.div>
    </div>
    <div className="li-board-overlay" style={{ visibility: boardPose.visible ? 'visible' : 'hidden', pointerEvents: boardOpen ? 'auto' : 'none' }}>
      <motion.div className="li-board-backdrop" aria-hidden="true" style={{ opacity: boardPose.opacity }} onClick={closeBoard} />
      <motion.div ref={board} id={`${identity}-board`} className="li-board-dialog li-panel" role="dialog" aria-modal={false}
        aria-labelledby={`${identity}-board-title`} aria-describedby={`${identity}-board-description`} aria-hidden={!boardOpen} inert={!boardOpen}
        data-state={boardOpen ? 'open' : 'closed'} style={{ x: boardPose.x, y: boardPose.y, scale: boardPose.scale, opacity: boardPose.opacity }}>
        <div className="li-panel-heading">
          <div><span className="li-eyebrow">WHAT'S NEW / 演示数据</span><h2 id={`${identity}-board-title`}>岛屿更新看板</h2></div>
          <PixelButton ref={boardClose} paused={paused} reduced={reduced} className="li-small-button" onActivate={closeBoard} aria-label="关闭更新看板">×</PixelButton>
        </div>
        <p id={`${identity}-board-description`} className="li-board-description">示例公告；打开、关闭与焦点恢复。</p>
        <ol className="li-update-list">
          <li><span>DEMO 03</span><h3>给今日小事一个小小回响</h3><p>完成一次浇水，新增一条本地动态；已完成卡片可收起、再展开。</p></li>
          <li><span>DEMO 02</span><h3>把动态藏进左侧抽屉</h3><p>点一下 LIVE，看看这个虚构小岛发生了什么。</p></li>
        </ol>
        <p className="li-board-footnote">以上均为虚构演示内容，无真实玩家数据。</p>
      </motion.div>
    </div>
    <p className="li-scene-status" role="status">{completed ? '今日完成 1 / 1；LIVE 已新增 1 条演示动态。' : '今日完成 0 / 1；所有内容均为虚构演示。'}</p>
  </section>
}

export default function IslandExamples() {
  const [paused, setPaused] = useState(false)
  const [reset, setReset] = useState(0)
  const reduced = usePrefersReducedMotion()

  return <main className="li-page">
    <header className="li-header">
      <p className="li-eyebrow">LIGHTNING ISLAND × TUNESHAPE</p>
      <h1>闪电岛 · UI 动效</h1>
      <p className="li-intro">轮廓高亮、状态提示、完成反馈。看效果，也能带走源码与配置。</p>
    </header>
    <div className="li-toolbar" role="group" aria-label="预览播放控制">
      <button className="li-button" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? '继续动效' : '暂停动效'}</button>
      <button className="li-button li-button-quiet" type="button" onClick={() => { setPaused(false); setReset(value => value + 1) }}>重置演示</button>
      <p className="li-playback-status" role="status">{paused ? '已暂停：动画时钟冻结，示例输入暂时停用。' : reduced ? '系统已减少动态效果：直接显示最终状态。' : '试试按住、快速切换，或用 Tab / 空格 / Enter 操作。'}</p>
    </div>
    <InteractionEffects key={`effects-${reset}`} paused={paused} reduced={reduced} />
    <details className="li-composition">
      <summary>组合示例：事件卡、动态抽屉、更新弹窗</summary>
      <IslandPlayground key={reset} paused={paused} reduced={reduced} />
    <section className="li-config-section" aria-labelledby="li-config-title">
      <div className="li-config-heading"><h2 id="li-config-title">基础交互配置</h2><p>这三份 schema v1 JSON 可导入 TuneShape 基础编辑器。</p></div>
      <div className="li-config-grid">{islandExamples.map(example => <details className="li-config-card" key={example.id}>
        <summary><strong>{example.title}</strong><span>{example.description}</span></summary>
        <label className="li-config-label" htmlFor={`li-config-${example.id}`}>完整动效配置</label>
        <textarea id={`li-config-${example.id}`} className="li-config-json" readOnly value={example.json} spellCheck={false} />
        <a className="li-download" href={`data:application/json;charset=utf-8,${encodeURIComponent(example.json + '\n')}`} download={`${example.id}.json`}>下载 {example.id}.json ↓</a>
      </details>)}</div>
      <p className="li-config-note">抽屉与弹窗复用上游 modal 的显隐姿态。JSON 描述动效参数；布局、交互语义及演示状态由源码与配套 Prompt 定义。</p>
    </section>
    </details>
    <footer className="li-footer">源自闪电岛 UI · Source + JSON + Prompt · 全部为本地演示</footer>
  </main>
}
