import test from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultConfig, validateConfig, serializeConfig, parseConfig, transitionFor, statesFor,
  describe, motionSpec, type ComponentKind,
} from './model.ts'

const kinds: ComponentKind[] = ['button', 'tabs', 'modal']
for (const component of kinds) {
  for (const variant of ['tween', 'spring', 'physics'] as const) {
    test(`${component}/${variant}: 导出再导入完整重现配置、Motion 参数、状态与中文描述`, () => {
      const config = defaultConfig(component)
      config.mode = variant === 'physics' ? 'physics' : 'beginner'
      config.animation = variant === 'tween' ? 'tween' : 'spring'
      config.durationMs = 673
      config.delayMs = 123
      config.easing = [0.12, -0.4, 0.8, 1.3]
      config.x = -16
      config.y = 37
      config.scale = 0.83
      config.bounce = 0.62
      config.stiffness = 378
      config.damping = 31
      config.mass = 1.7
      const restored = parseConfig(serializeConfig(config))
      assert.deepEqual(restored, config)
      assert.deepEqual(transitionFor(restored), transitionFor(config))
      assert.deepEqual(statesFor(restored), statesFor(config))
      assert.deepEqual(describe(restored), describe(config))
      assert.deepEqual(motionSpec(restored), motionSpec(config))
      assert.equal(serializeConfig(restored), serializeConfig(config))
    })
  }
}

test('Motion 参数使用秒，初学 spring 与物理 spring 参数不混用', () => {
  const c = { ...defaultConfig('button'), durationMs: 420, delayMs: 150, bounce: 0.3 }
  assert.deepEqual(transitionFor(c), { type: 'spring', duration: 0.42, bounce: 0.3, velocity: 0, delay: 0.15 })
  c.mode = 'physics'
  assert.deepEqual(transitionFor(c), { type: 'spring', stiffness: 260, damping: 24, mass: 1, velocity: 0, delay: 0.15 })
  c.mode = 'beginner'; c.animation = 'tween'
  assert.deepEqual(transitionFor(c), { type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.15 })
})

test('无关参数变化不影响当前模式的预览或中文描述', () => {
  const tween = { ...defaultConfig('tabs'), bounce: 0.8, stiffness: 800, mass: 5, damping: 80 }
  assert.deepEqual(transitionFor(tween), transitionFor(defaultConfig('tabs')))
  assert.deepEqual(describe(tween), describe(defaultConfig('tabs')))
  const basePhysics = { ...defaultConfig('button'), mode: 'physics' as const }
  const changedPhysics = { ...basePhysics, durationMs: 2000, bounce: 0, easing: [0, 0, 1, 1] as [number, number, number, number] }
  assert.deepEqual(transitionFor(basePhysics), transitionFor(changedPhysics))
  assert.deepEqual(describe(basePhysics), describe(changedPhysics))
})

test('各组件状态与进入退出方向有明确差异', () => {
  assert.deepEqual(statesFor(defaultConfig('button')), {
    rest: { x: 0, y: 0, scale: 1, opacity: 1 }, active: { x: 0, y: 2, scale: 0.92, opacity: 1 },
  })
  assert.deepEqual(statesFor(defaultConfig('tabs')), {
    rest: { x: 24, y: 0, scale: 0.98, opacity: 0 }, active: { x: 0, y: 0, scale: 1, opacity: 1 },
  })
  assert.deepEqual(statesFor(defaultConfig('modal')), {
    rest: { x: 0, y: 24, scale: 0.94, opacity: 0 }, active: { x: 0, y: 0, scale: 1, opacity: 1 },
  })
})

test('所有范围边界可以导入；越界、非数字与非有限数值全部拒绝', () => {
  const ranges = {
    durationMs: [80, 2000], delayMs: [0, 500], bounce: [0, 0.8], x: [-80, 80], y: [-80, 80],
    scale: [0.7, 1.2], stiffness: [20, 800], damping: [5, 80], mass: [0.2, 5],
  }
  for (const [key, [min, max]] of Object.entries(ranges)) {
    for (const value of [min, max]) assert.doesNotThrow(() => validateConfig({ ...defaultConfig('button'), [key]: value }))
    for (const value of [min - 0.01, max + 0.01, NaN, Infinity, -Infinity, `${min}`, null]) {
      assert.throws(() => validateConfig({ ...defaultConfig('button'), [key]: value }), new RegExp(key))
    }
  }
  assert.doesNotThrow(() => validateConfig({ ...defaultConfig('button'), easing: [0, -1, 1, 2] }))
  for (const easing of [[-0.1, 0, 1, 1], [0, -1.01, 1, 1], [0, 0, 1.1, 1], [0, 0, 1, 2.01], [0, 1, 1], [0, 0, 1, NaN], 'easeOut']) {
    assert.throws(() => validateConfig({ ...defaultConfig('button'), easing }), /easing/)
  }
})

test('未知字段、观察倍速、缺失字段、未知版本和非法模式组合全部拒绝', () => {
  for (const key of ['playbackSpeed', 'speed', 'observationSpeed', 'unknown']) {
    assert.throws(() => validateConfig({ ...defaultConfig('button'), [key]: 2 }), /不支持的字段/)
  }
  for (const key of Object.keys(defaultConfig('button'))) {
    const source = { ...defaultConfig('button') } as Record<string, unknown>
    delete source[key]
    assert.throws(() => validateConfig(source), /缺少字段/)
  }
  for (const invalid of [null, [], 'button', 3, false]) assert.throws(() => validateConfig(invalid), /JSON 对象/)
  assert.throws(() => validateConfig({ ...defaultConfig('button'), schemaVersion: 2 }), /schemaVersion/)
  assert.throws(() => validateConfig({ ...defaultConfig('button'), component: 'toast' }), /组件/)
  assert.throws(() => validateConfig({ ...defaultConfig('button'), mode: 'pro' }), /模式/)
  assert.throws(() => validateConfig({ ...defaultConfig('button'), animation: 'inertia' }), /动画类型/)
  assert.throws(() => validateConfig({ ...defaultConfig('tabs'), mode: 'physics' }), /只支持 spring/)
  assert.throws(() => validateConfig({ ...defaultConfig('button'), interruption: 'queue' }), /打断策略/)
  assert.throws(() => validateConfig({ ...defaultConfig('button'), reducedMotion: 'none' }), /减少动态效果策略/)
})

test('拒绝原型字段、非普通原型与访问器，且校验不执行字段 getter', () => {
  for (const key of ['__proto__', 'constructor', 'prototype']) {
    const json = serializeConfig(defaultConfig('button')).replace(/\}$/, `, "${key}": {"polluted": true}}`)
    assert.throws(() => parseConfig(json), /不支持的字段/)
  }
  const inherited = Object.assign(Object.create({ extra: 1 }), defaultConfig('button'))
  assert.throws(() => validateConfig(inherited), /自定义原型/)
  const getter = { ...defaultConfig('button') }
  let reads = 0
  Object.defineProperty(getter, 'durationMs', { enumerable: true, get() { reads++; return 300 } })
  assert.throws(() => validateConfig(getter), /访问器/)
  assert.equal(reads, 0)
  assert.equal(({} as Record<string, unknown>).polluted, undefined)
  const sparse = [0, 0, 1, 1]
  delete sparse[3]
  Object.defineProperty(sparse, 'unexpected', { value: 1, enumerable: true })
  assert.throws(() => validateConfig({ ...defaultConfig('button'), easing: sparse }), /easing/)
  const curveGetter = [0, 0, 1, 1]
  Object.defineProperty(curveGetter, '0', { enumerable: true, get() { reads++; return 0 } })
  assert.throws(() => validateConfig({ ...defaultConfig('button'), easing: curveGetter }), /easing/)
  assert.equal(reads, 0)
})

test('解析错误为中文且导入配置、曲线 tuple 不与输入共享引用', () => {
  assert.throws(() => parseConfig('{'), /JSON 格式有误/)
  const input = defaultConfig('button')
  const copy = validateConfig(input)
  copy.easing[0] = 0.5
  copy.durationMs = 900
  assert.equal(input.easing[0], 0.22)
  assert.equal(input.durationMs, 420)
})

test('中文导出完整覆盖交互契约、物理时序、打断及减少动态效果', () => {
  for (const kind of kinds) {
    const c = defaultConfig(kind)
    const d = describe(c)
    assert.deepEqual(d.sections.map(s => s.label), ['组件', '触发方式', '起点与终点', '时序与专业术语', '进入与退出', '重复操作与打断', '减少动态效果'])
    const text = d.sections.map(s => s.text).join('\n')
    for (const term of ['retarget', '当前显示值', '不排队', '不自动重复', 'prefers-reduced-motion', '跳过延迟', '终态', '观察倍速']) assert.ok(text.includes(term), `${kind}: ${term}`)
    if (kind !== 'tabs') assert.ok(text.includes('不承诺精确落稳'))
    if (kind === 'button') for (const term of ['指针', '空格', 'Enter', '松开']) assert.ok(text.includes(term))
    if (kind === 'tabs') for (const term of ['crossfade', '新面板', '同时', '再次激活不重播']) assert.ok(text.includes(term))
    if (kind === 'modal') for (const term of ['Escape', '遮罩', '反向退出']) assert.ok(text.includes(term))
    c.mode = 'physics'; c.animation = 'spring'
    const physicsText = describe(c).sections.map(s => s.text).join('\n')
    for (const term of ['stiffness = 260', 'damping = 24', 'mass = 1', 'velocity 固定为 0', '实际落稳时间由物理参数共同决定']) assert.ok(physicsText.includes(term))
  }
})

test('Motion 规格是可序列化纯数据，与源配置计算的参数和状态完全相同', () => {
  for (const kind of kinds) {
    const c = defaultConfig(kind)
    const spec = motionSpec(c)
    assert.deepEqual(JSON.parse(JSON.stringify(spec)), spec)
    assert.deepEqual(spec.transition, transitionFor(c))
    assert.deepEqual(spec.states, statesFor(c))
    assert.equal(spec.policies.queue, false)
    assert.equal(spec.policies.repeat, 0)
    assert.equal(spec.policies.reducedMotion.delay, 0)
    assert.equal(spec.policies.reducedMotion.animateTransform, false)
    assert.equal(spec.policies.reducedMotion.animateOpacity, false)
    if (kind === 'modal') assert.deepEqual(spec.backdrop?.transition, spec.transition)
  }
})


test('退出开始时停用交互与可访问树，视觉隐藏等待退出结束；Tab 允许多个退出层', () => {
  for (const kind of ['tabs', 'modal'] as const) {
    const c = defaultConfig(kind)
    const text = describe(c).sections.find(s => s.label === '进入与退出')?.text ?? ''
    assert.ok(text.includes('退出开始时移出可访问树并停止接收操作'))
    assert.ok(text.includes('退出结束后隐藏'))
    const policies = motionSpec(c).policies
    assert.equal(policies.accessibilityHiddenAt, 'exitStart')
    assert.equal(policies.interactionDisabledAt, 'exitStart')
    assert.equal(policies.hideAfterExit, true)
    assert.equal(Object.hasOwn(policies, 'removeFromAccessibilityTreeAfterExit'), false)
  }
  const tabDescription = describe(defaultConfig('tabs')).sections.map(s => s.text).join('\n')
  assert.ok(tabDescription.includes('可能暂时有多个退出层'))
  assert.ok(!tabDescription.includes('两个内容层'))
  assert.equal(motionSpec(defaultConfig('tabs')).policies.concurrentExitLayers, true)
})
