import {t,useLanguage} from './i18n';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { animate, motion, useMotionValue } from 'motion/react'
import { statesFor, transitionFor } from './model'
import type { EffectConfig, MotionState } from './model'
import ArrowIcon from './DemoArrow'
import {usePreviewClock} from './useDetailPlayback'
import type {PlaybackControl} from './useDetailPlayback'

interface PreviewProps {
  config: EffectConfig
  speed: number
  reduced: boolean
  replay: number
  label: string
  paused?: boolean
  onRunningChange?: (side:string,running:boolean)=>void
  onPlaybackComplete?: () => void
}

type RunningAnimation = PlaybackControl

/** Each retarget starts at the rendered MotionValues. Observation speed never enters a transition. */
export function usePose(config: EffectConfig, active: boolean, speed: number, reduced: boolean, paused: boolean, onSettled?: (active:boolean)=>void) {
  const settled=useRef(onSettled);settled.current=onSettled
  const initial = statesFor(config)[active ? 'active' : 'rest']
  const x = useMotionValue(initial.x)
  const y = useMotionValue(initial.y)
  const scale = useMotionValue(initial.scale)
  const opacity = useMotionValue(initial.opacity)
  const [visible, setVisible] = useState(active)
  const visibleRef = useRef(active)
  const initialized = useRef(false)
  const controls = useRef<RunningAnimation[]>([])
  const controlClock=usePreviewClock(controls,speed,true,paused)

  useLayoutEffect(() => {
    let current = true
    const values = { x, y, scale, opacity }
    const target = statesFor(config)[active ? 'active' : 'rest']
    const keys = Object.keys(values) as (keyof MotionState)[]
    const show = (next: boolean) => { visibleRef.current = next; setVisible(next) }
    const stop = () => {
      controlClock.clear()
    }
    stop()
    // Initial mounting, reduced motion, and already-hidden layers have no visible transition.
    if (!initialized.current || reduced || (!active && !visibleRef.current)) {
      const mounted=initialized.current
      initialized.current = true
      for (const key of keys) values[key].set(target[key])
      show(active)
      if(mounted)queueMicrotask(()=>{if(current)settled.current?.(active)})
    } else {
      if (active) show(true)
      let remaining = keys.length
      const transition = transitionFor(config)
      keys.forEach(key => {
        const control = animate(values[key], target[key], {
          ...transition,
          onComplete: () => {
            if (!current) return
            remaining -= 1
            if (remaining === 0) { if(!active)show(false);settled.current?.(active) }
          },
        })
        controlClock.register(control)
      })
    }
    return () => { current = false; stop() }
  }, [config, active, reduced, x, y, scale, opacity])

  return { x, y, scale, opacity, visible }
}

function ButtonPreview({ config, speed, reduced, replay, label, paused=false, onRunningChange, onPlaybackComplete }: PreviewProps) {
 useLanguage();
  const [pressed,setPressed]=useState(false),[running,setRunning]=useState(false)
  const demonstrating=useRef(false),lastReplay=useRef(0)
  const targetPressed=useRef(false),held=useRef(false),pendingRelease=useRef(false)
  const move=(next:boolean)=>{targetPressed.current=next;setRunning(true);setPressed(next)}
  useEffect(()=>onRunningChange?.(label,running),[onRunningChange,label,running])
  const pose=usePose(config,pressed,speed,reduced,paused,active=>{
    // An initial rest callback can arrive after replay has requested a press.
    // Only the current target may finish or advance this demonstration.
    if(active!==targetPressed.current)return
    if(active&&demonstrating.current)move(false)
    else{if(!active)demonstrating.current=false;setRunning(false);if(!active)onPlaybackComplete?.()}
  })
  const release=()=>{
    if(!held.current)return
    held.current=false
    if(paused){pendingRelease.current=true;return}
    move(false)
  }
  const releaseRef=useRef(release);releaseRef.current=release
  useEffect(()=>{
    const blur=()=>releaseRef.current(),visibility=()=>{if(document.hidden)releaseRef.current()}
    window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility)
    return()=>{window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility)}
  },[])
  useEffect(()=>{if(!paused&&pendingRelease.current){pendingRelease.current=false;move(false)}},[paused])
  const press=()=>{if(paused)return;held.current=true;pendingRelease.current=false;demonstrating.current=false;move(true)}
  useEffect(()=>{
    if(lastReplay.current===replay)return
    lastReplay.current=replay;held.current=false;pendingRelease.current=false;demonstrating.current=true;move(true)
  },[replay])
  const handleKeyDown=(event:KeyboardEvent<HTMLButtonElement>)=>{
    if(paused||![' ','Enter'].includes(event.key))return
    event.preventDefault();if(event.repeat)return;press()
  }

  return <div className="demo-stage button-stage" data-preview={label} data-state={pressed ? 'active' : 'rest'} data-paused={paused} data-running={running}>
    <div className="demo-orbit" aria-hidden="true"><span /><span /></div>
    <motion.button
      type="button"
      className="demo-button"
      data-demo-button=""
      style={{ x: pose.x, y: pose.y, scale: pose.scale, opacity: pose.opacity }}
      onPointerDown={event => {
        if (event.button !== 0||paused) return
        event.currentTarget.setPointerCapture(event.pointerId)
        press()
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onBlur={release}
      onKeyDown={handleKeyDown}
      onKeyUp={event => {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); release() }
      }}
    >Press &amp; hold <ArrowIcon /></motion.button>
    {label==='library'&&<div className="button-demo-caption"><span className={pressed ? 'demo-status-dot is-active' : 'demo-status-dot'} /><span>Press → release</span><span className="demo-state-label">{t(pressed ? 'Pressed' : 'Rest')}</span></div>}
  </div>
}

const TAB_ITEMS = [
  { label: 'Ideas', number: '01', title: 'Good ideas start here.', detail: 'A little room for every idea.', tag: 'IDEA', progress: '28%' },
  { label: 'In progress', number: '02', title: 'Make your idea real.', detail: 'One step at a time.', tag: 'IN PROGRESS', progress: '64%' },
  { label: 'Done', number: '03', title: 'Ready when you are.', detail: 'Keep what you made. Start something new.', tag: 'DONE', progress: '100%' },
]

function TabPanel({ config, speed, reduced, active, item, id, tabId, paused=false, onSettled }: Pick<PreviewProps, 'config' | 'speed' | 'reduced'> & { active: boolean; item: typeof TAB_ITEMS[number]; id: string; tabId: string; paused?:boolean; onSettled?:(active:boolean)=>void }) {
 useLanguage();
  const pose = usePose(config,active,speed,reduced,paused,onSettled)
  return <motion.div
    className="tab-demo-panel"
    id={id}
    role="tabpanel"
    aria-labelledby={tabId}
    aria-hidden={!active}
    inert={!active}
    data-state={active ? 'active' : 'rest'}
    style={{ x: pose.x, y: pose.y, scale: pose.scale, opacity: pose.opacity, visibility: pose.visible ? 'visible' : 'hidden', pointerEvents: active ? 'auto' : 'none', zIndex: active ? 2 : 1 }}
  >
    <div className="tab-panel-top"><span className="tab-panel-number">{item.number}</span><span className="tab-panel-tag">{item.tag}</span></div>
    <h3>{t(item.title)}</h3>
    <p>{item.detail}</p>
    <div className="tab-progress" aria-hidden="true"><span style={{ width: item.progress }} /></div>
  </motion.div>
}

function TabsPreview({ config, speed, reduced, replay, label, paused=false, onRunningChange, onPlaybackComplete }: PreviewProps) {
 useLanguage();
  const [selected,setSelected]=useState(0),[running,setRunning]=useState(false)
  const lastReplay=useRef(0),demonstrating=useRef(false)
  useEffect(()=>onRunningChange?.(label,running),[onRunningChange,label,running])
  const select=(index:number)=>{if(paused||demonstrating.current||index===selected)return;setRunning(true);setSelected(index)}
  const settled=(index:number,active:boolean)=>{
    if(!active||index!==selected)return
    if(demonstrating.current&&index!==0)setSelected(0)
    else{demonstrating.current=false;setRunning(false);onPlaybackComplete?.()}
  }
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const identity = `${label}-${useId().replace(/:/g, '')}`
  useEffect(() => {
    if (lastReplay.current === replay) return
    lastReplay.current = replay
    demonstrating.current=true;setRunning(true);setSelected(1)
  }, [replay])

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if(paused||demonstrating.current)return
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % TAB_ITEMS.length
    else if (event.key === 'ArrowLeft') next = (index + TAB_ITEMS.length - 1) % TAB_ITEMS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = TAB_ITEMS.length - 1
    else return
    event.preventDefault()
    select(next)
    tabs.current[next]?.focus()
  }

  return <div className="demo-stage tabs-stage" data-preview={label} data-state={selected === 0 ? 'rest' : 'active'} data-active-index={selected} data-paused={paused} data-running={running}>
    <div className="tabs-demo">
      <div className="demo-tablist" role="tablist" aria-label={t("项目阶段演示")}>
        {TAB_ITEMS.map((item, index) => <button
          key={item.label}
          type="button"
          role="tab"
          className={selected === index ? 'demo-tab is-active' : 'demo-tab'}
          id={`${identity}-tab-${index}`}
          aria-controls={`${identity}-panel-${index}`}
          aria-selected={selected === index}
          tabIndex={selected === index ? 0 : -1}
          data-demo-tab={index}
          ref={node => { tabs.current[index] = node }}
          onClick={() => select(index)}
          onKeyDown={event => onTabKeyDown(event, index)}
        >{t(item.label)}</button>)}
      </div>
      <div className="tab-demo-panels">{TAB_ITEMS.map((item, index) => <TabPanel key={item.label} config={config} speed={speed} reduced={reduced} active={selected === index} paused={paused} onSettled={active=>settled(index,active)} item={item} id={`${identity}-panel-${index}`} tabId={`${identity}-tab-${index}`} />)}</div>
    </div>
  </div>
}

function ModalPreview({ config, speed, reduced, replay, label, paused=false, onRunningChange, onPlaybackComplete }: PreviewProps) {
 useLanguage();
  const [open,setOpen]=useState(false),[running,setRunning]=useState(false)
  const demonstrating=useRef(false)
  useEffect(()=>onRunningChange?.(label,running),[onRunningChange,label,running])
  const pose=usePose(config,open,speed,reduced,paused,active=>{
    if(active&&demonstrating.current)setOpen(false)
    else{demonstrating.current=false;setRunning(false);onPlaybackComplete?.()}
  })
  const lastReplay=useRef(0)
  const trigger = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const focusOnOpen = useRef(false)
  const identity = `${label}-${useId().replace(/:/g, '')}`

  const close = () => {
    if(paused||demonstrating.current)return
    setRunning(true)
    if (dialog.current?.contains(document.activeElement)) trigger.current?.focus()
    focusOnOpen.current = false
    setOpen(false)
  }
  useLayoutEffect(() => {
    if (open && pose.visible && focusOnOpen.current) { closeButton.current?.focus(); focusOnOpen.current = false }
  }, [open, pose.visible])
  useEffect(() => {
    if (lastReplay.current === replay) return
    lastReplay.current = replay
    // Synchronized comparison playback must leave focus on the playback control.
    focusOnOpen.current = false
    demonstrating.current=true;setRunning(true);setOpen(true)
  }, [replay])

  useEffect(() => {
    if (!open) return
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        event.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [open])

  return <div className="demo-stage modal-stage" data-preview={label} data-state={open ? 'active' : 'rest'} data-paused={paused} data-running={running}>
    <div className="modal-demo-base">
      <div className="modal-base-glyph" aria-hidden="true"><span /><span /><span /></div>
      <button ref={trigger} className="demo-launch" type="button" data-demo-modal-trigger="" aria-expanded={open} aria-controls={`${identity}-dialog`} onClick={() => { if(paused||demonstrating.current)return;focusOnOpen.current=true;setRunning(true);setOpen(true) }}>Open dialog <ArrowIcon /></button>
      <p>Give your content a moment.</p>
    </div>
    <div className="modal-demo-overlay" style={{ visibility: pose.visible ? 'visible' : 'hidden', pointerEvents: open ? 'auto' : 'none' }}>
      <motion.div className="modal-demo-backdrop" style={{ opacity: pose.opacity }} onClick={close} aria-hidden="true" />
      <motion.div
        ref={dialog}
        id={`${identity}-dialog`}
        className="modal-demo-card"
        role="dialog"
        aria-modal={false}
        aria-labelledby={`${identity}-title`}
        aria-describedby={`${identity}-description`}
        aria-hidden={!open}
        inert={!open}
        data-demo-dialog=""
        data-state={open ? 'active' : 'rest'}
        style={{ x: pose.x, y: pose.y, scale: pose.scale, opacity: pose.opacity }}
      >
        <button ref={closeButton} type="button" className="modal-demo-close" aria-label="Close dialog" onClick={close}><svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m5 5 8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
        <span className="modal-demo-kicker">HELLO, MOTION</span>
        <h3 id={`${identity}-title`}>Take a moment.<br />Feel the change.</h3>
        <p id={`${identity}-description`}>A simple entrance and exit.</p>
        <button type="button" className="modal-demo-confirm" onClick={close}>Got it <ArrowIcon /></button>
      </motion.div>
    </div>
  </div>
}

export default function Preview(props: PreviewProps) {
 useLanguage();
  const previousConfig=useRef(props.config),[editReplay,setEditReplay]=useState(0)
  useLayoutEffect(()=>{
    const changed=previousConfig.current!==props.config;previousConfig.current=props.config
    if(changed&&props.label==='after'&&!props.paused)setEditReplay(value=>value+1)
  },[props.config,props.label,props.paused])
  const replayIdentity=`${props.replay}-${editReplay}`,current={...props,replay:props.replay+editReplay}
  if (props.config.component === 'button') return <ButtonPreview {...current} />
  if (props.config.component === 'tabs') return <TabsPreview key={replayIdentity} {...current} />
  return <ModalPreview key={replayIdentity} {...current} />
}
