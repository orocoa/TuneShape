import {effectTerms} from './effect-terms';
import {validateEasing,motionEasing,easingDescription,easingCode,curvePoints,curveSegments} from './easing';
import type {EasingCurve} from './easing';
export type {EasingCurve} from './easing';
/** The only persisted source of truth. Playback speed deliberately lives outside this schema. */
export type ComponentKind = 'button' | 'tabs' | 'modal'
export interface EffectConfig {
  schemaVersion: 1
  component: ComponentKind
  mode: 'beginner' | 'physics'
  animation: 'tween' | 'spring'
  durationMs: number
  delayMs: number
  easing: EasingCurve
  bounce: number
  x: number
  y: number
  scale: number
  stiffness: number
  damping: number
  mass: number
  interruption: 'retarget'
  reducedMotion: 'instant'
}
export interface MotionState { x: number; y: number; scale: number; opacity: number }
export interface Description {
  title: string
  summary: string
  sections: { label: string; text: string }[]
}
export const componentLabels: Record<ComponentKind, string> = {
  button: effectTerms['basic-button'].label, tabs: effectTerms['basic-tabs'].label, modal: effectTerms['basic-modal'].label,
}
export const easingPresets: { label: string; value: number[] }[] = [
  { label: '柔和缓出 · 自定义', value: [0.22, 1, 0.36, 1] },
  { label: '平滑进出 · ease-in-out', value: [0.42, 0, 0.58, 1] },
  { label: '快速缓出 · 自定义', value: [0, 0, 0.2, 1] },
  { label: '缓入加速 · 自定义', value: [0.4, 0, 1, 1] },
  { label: '匀速 · linear', value: [0, 0, 1, 1] },
]
const KEYS = [
  'schemaVersion', 'component', 'mode', 'animation', 'durationMs', 'delayMs', 'easing',
  'bounce', 'x', 'y', 'scale', 'stiffness', 'damping', 'mass', 'interruption', 'reducedMotion',
] as const
const identity = (): MotionState => ({ x: 0, y: 0, scale: 1, opacity: 1 })

export function defaultConfig(component: ComponentKind): EffectConfig {
  if (!Object.hasOwn(componentLabels, component)) throw new Error('不支持的组件。')
  const variants = {
    button: { animation: 'spring' as const, durationMs: 420, x: 0, y: 2, scale: 0.92 },
    tabs: { animation: 'tween' as const, durationMs: 320, x: 24, y: 0, scale: 0.98 },
    modal: { animation: 'spring' as const, durationMs: 480, x: 0, y: 24, scale: 0.94 },
  }
  return {
    schemaVersion: 1, component, mode: 'beginner', delayMs: 0,
    easing: [0.22, 1, 0.36, 1], bounce: 0.25,
    stiffness: 260, damping: 24, mass: 1,
    interruption: 'retarget', reducedMotion: 'instant', ...variants[component],
  }
}

/** Reject rather than silently repair incompatible, partial or unrecognized documents. */
export function validateConfig(value: unknown): EffectConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('配置必须是一个 JSON 对象。')
  }
  const proto = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) throw new Error('配置不能包含自定义原型。')
  const source = value as Record<string, unknown>
  const unknown = Reflect.ownKeys(source).filter(key => typeof key !== 'string' || !(KEYS as readonly string[]).includes(key))
  if (unknown.length) throw new Error(`配置含不支持的字段：${unknown.map(String).join('、')}。观察倍速不属于动效配置。`)
  const missing = KEYS.filter(key => !Object.hasOwn(source, key))
  if (missing.length) throw new Error(`配置缺少字段：${missing.join('、')}。`)
  for (const key of KEYS) {
    if (!Object.getOwnPropertyDescriptor(source, key)?.hasOwnProperty('value')) {
      throw new Error(`字段 ${key} 必须是普通数据，不能是访问器。`)
    }
  }
  if (source.schemaVersion !== 1) throw new Error('仅支持 schemaVersion 为 1 的配置。')
  if (!['button', 'tabs', 'modal'].includes(source.component as string)) throw new Error('组件必须是 button、tabs 或 modal。')
  if (!['beginner', 'physics'].includes(source.mode as string)) throw new Error('模式必须是 beginner 或 physics。')
  if (!['tween', 'spring'].includes(source.animation as string)) throw new Error('动画类型必须是 tween 或 spring。')
  if (source.mode === 'physics' && source.animation !== 'spring') throw new Error('高级物理参数模式只支持 spring 弹簧。')
  if (source.interruption !== 'retarget') throw new Error('打断策略必须是 retarget（从当前值转向新目标）。')
  if (source.reducedMotion !== 'instant') throw new Error('减少动态效果策略必须是 instant（直接到达终态）。')
  const range = (key: string, min: number, max: number, candidate = source[key]) => {
    if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate < min || candidate > max) {
      throw new Error(`${key} 必须是 ${min} 到 ${max} 之间的有限数值。`)
    }
  }
  range('durationMs', 80, 2000); range('delayMs', 0, 500); range('bounce', 0, 0.8)
  range('x', -80, 80); range('y', -80, 80); range('scale', 0.7, 1.2)
  range('stiffness', 20, 800); range('damping', 5, 80); range('mass', 0.2, 5)
  const easing=validateEasing(source.easing)
  // Copy own, known fields and the tuple so callers cannot mutate an imported document by alias.
  const result = Object.fromEntries(KEYS.map(key => [key, source[key]])) as unknown as EffectConfig
  result.easing = easing
  return result
}
export function serializeConfig(config: EffectConfig): string {
  return JSON.stringify(validateConfig(config), null, 2)
}
export function parseConfig(text: string): EffectConfig {
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch { throw new Error('JSON 格式有误，请检查括号、引号和逗号。') }
  return validateConfig(parsed)
}

/** Keep every button control editable; editing a driver activates its calculation. */
export function updateButtonConfig(config:EffectConfig,patch:Partial<EffectConfig>):EffectConfig {
  const next={...config,...patch}
  if (['stiffness','damping','mass'].some(key=>Object.hasOwn(patch,key))) {
    next.mode='physics';next.animation='spring'
  } else if (Object.hasOwn(patch,'easing')) {
    next.mode='beginner';next.animation='tween'
  } else if (Object.hasOwn(patch,'bounce') || Object.hasOwn(patch,'durationMs') && next.mode==='physics') {
    next.mode='beginner';next.animation='spring'
  }
  return next
}

/** Motion's duration and delay use seconds; UI and persisted JSON use milliseconds. */
export function transitionFor(config: EffectConfig) {
  const delay = config.delayMs / 1000
  if (config.mode === 'physics') {
    return {
      type: 'spring' as const, stiffness: config.stiffness,
      damping: config.damping, mass: config.mass, velocity: 0, delay,
    }
  }
  if (config.animation === 'spring') {
    return {
      type: 'spring' as const, duration: config.durationMs / 1000,
      bounce: config.bounce, velocity: 0, delay,
    }
  }
  return { type: 'tween' as const, duration: config.durationMs / 1000, ease: motionEasing(config.easing), delay }
}
export function statesFor(config: EffectConfig): { rest: MotionState; active: MotionState } {
  const configured = { x: config.x, y: config.y, scale: config.scale, opacity: config.component === 'button' ? 1 : 0 }
  return config.component === 'button'
    ? { rest: identity(), active: configured }
    : { rest: configured, active: identity() }
}
const stateText = (state: MotionState) => `横向 ${state.x} px、纵向 ${state.y} px、缩放 ${state.scale} 倍（${Number((state.scale * 100).toFixed(4))}%）、不透明度 ${Math.round(state.opacity * 100)}%`
const kindName = (c: EffectConfig) => c.mode === 'physics' ? '物理型弹簧' : c.animation === 'spring' ? '时长型弹簧' : '缓动动画'

export function describe(config: EffectConfig): Description {
  const states = statesFor(config)
  const physical = config.mode === 'physics'
  const spring = physical || config.animation === 'spring'
  const triggers = {
    button: '指针、空格键或 Enter 键按下时进入按压态；松开或取消按压时返回静止态。键盘焦点离开时也恢复静止态。',
    tabs: '点击或用键盘激活另一个 Tab 时切换；当前 Tab 再次激活不重播。',
    modal: '点击打开按钮时进入；点击关闭按钮、遮罩或按 Escape 键时退出。',
  }
  const endpoints = config.component === 'button'
    ? `静止态：${stateText(states.rest)}。按压态：${stateText(states.active)}。`
    : `隐藏态：${stateText(states.rest)}。显示态：${stateText(states.active)}。`
  const timeline = physical
    ? `每次转向目标前延迟 ${config.delayMs} ms；使用物理型弹簧（spring），刚度 stiffness = ${config.stiffness}、阻尼 damping = ${config.damping}、质量 mass = ${config.mass}。实际落稳时间由物理参数共同决定，不使用时长、缓动曲线或回弹系数。`
    : spring
      ? `每次转向目标前延迟 ${config.delayMs} ms；使用时长型弹簧（spring），时长参数 duration = ${config.durationMs} ms、回弹 bounce = ${config.bounce}。时长用于控制弹簧节奏，不承诺精确落稳时刻；回弹越大，越容易越过目标后返回。`
      : `每次转向目标前延迟 ${config.delayMs} ms；使用缓动动画（tween），单程时长 duration = ${config.durationMs} ms，${easingDescription(config.easing)}；曲线控制同一段时长内的速度变化。${curvePoints(config.easing).some(([,y])=>y<0||y>1) ? '曲线超出 0–1 范围，可能产生超调（overshoot）。' : ''}`
  const enterExit = {
    button: '按下从静止态转向按压态，释放从当前值返回静止态；两个方向使用相同的动画参数。',
    tabs: '新面板从隐藏态进入显示态，旧面板从当前值退出至隐藏态；新内容与仍在退出的内容层同时交叉淡入淡出（crossfade），使用相同的动画参数。快速连续切换时，可能暂时有多个退出层。旧内容在退出开始时移出可访问树并停止接收操作，退出结束后隐藏。Tab 指示状态即时更新。',
    modal: '打开时弹窗从隐藏态进入显示态，关闭时从当前值反向退出至隐藏态；遮罩同步在不透明度 0 与 1 之间变化，使用相同的动画参数。弹窗在退出开始时移出可访问树并停止接收操作，退出结束后隐藏。',
  }
  const interruption = `重复操作时采用重定向（retarget）：从当前显示值转向最新目标，不排队、不自动重复。${spring ? '每条新弹簧轨迹的初速度 velocity 固定为 0，不继承上一条轨迹的速度。' : ''}${config.component === 'tabs' ? '新面板从隐藏态进入；仍在退出的同一面板被重新选中时，从当前值重新进入。' : ''}`
  return {
    title: `${componentLabels[config.component]} · ${kindName(config)}`,
    summary: `${componentLabels[config.component]}，使用${kindName(config)}；${physical ? `刚度 ${config.stiffness} / 阻尼 ${config.damping} / 质量 ${config.mass}` : `${config.durationMs} ms${spring ? ` / 回弹 ${config.bounce}` : ''}`}。`,
    sections: [
      { label: '组件', text: `${componentLabels[config.component]}（${effectTerms['basic-'+config.component].english}；basic-${config.component}）` },
      { label: '触发方式', text: triggers[config.component]+' 详情页播放按钮演示一次初态到终态再返回初态；暂停保持当前画面，再次播放继续。' },
      { label: '起点与终点', text: endpoints },
      { label: '时序与专业术语', text: timeline },
      { label: '进入与退出', text: enterExit[config.component] },
      { label: '重复操作与打断', text: interruption },
      { label: '减少动态效果', text: '遵循系统 prefers-reduced-motion 时，跳过延迟和动画，立即到达目标终态；不执行位移、缩放或淡变过程。观察倍速只改变观察方式，不修改配置和导出参数。' },
    ],
  }
}

function exportableTransition(config:EffectConfig){const transition=transitionFor(config);return 'ease' in transition&&typeof transition.ease==='function'?{...transition,ease:{type:'function',source:easingCode(config.easing),controlPoints:curveSegments(config.easing).flatMap(s=>s.handles),...(!Array.isArray(config.easing)?{start:curvePoints(config.easing)[0],end:curvePoints(config.easing).at(-1),...('segments' in config.easing?{segments:config.easing.segments}:{})}:{})}}:transition}
export function motionSpec(config: EffectConfig) {
  const transitions = {
    button: { pointerDown: 'active', keyDownSpaceOrEnter: 'active', pointerUpOrCancel: 'rest', keyUpSpaceOrEnter: 'rest', blur: 'rest' },
    tabs: { activateNewTab: { incoming: 'active', outgoing: 'rest', simultaneous: true }, reactivateCurrentTab: 'no-op' },
    modal: { open: 'active', close: 'rest', escape: 'rest', clickBackdrop: 'rest' },
  }
  return {
    component: config.component,
    terminology: { id: 'basic-'+config.component, name: componentLabels[config.component], englishTerm: effectTerms['basic-'+config.component].english },
    states: statesFor(config),
    transition: exportableTransition(config),
    events: transitions[config.component],
    ...(config.component === 'modal' ? { backdrop: { rest: { opacity: 0 }, active: { opacity: 1 }, transition: exportableTransition(config) } } : {}),
    policies: {
      interruption: 'retarget', startFrom: 'currentRenderedValue', queue: false, repeat: 0,
      ...(config.mode === 'physics' || config.animation === 'spring' ? { newSpringVelocity: 0 } : {}),
      ...(config.component === 'tabs' ? { newPanelStartsAt: 'rest', reselectedExitingPanelStartsAt: 'currentRenderedValue', concurrentExitLayers: true } : {}),
      ...(config.component !== 'button' ? { hideAfterExit: true, accessibilityHiddenAt: 'exitStart', interactionDisabledAt: 'exitStart' } : {}),
      reducedMotion: { trigger: 'prefers-reduced-motion', behavior: 'instant', delay: 0, duration: 0, animateTransform: false, animateOpacity: false },
      observationSpeed: 'Preview only; excluded from configuration and animation parameters',
    },
  }
}
