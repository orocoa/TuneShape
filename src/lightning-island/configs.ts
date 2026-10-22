import eventButton from '../../configs/lightning-island/event-button.json'
import liveDrawer from '../../configs/lightning-island/live-drawer.json'
import updateBoard from '../../configs/lightning-island/update-board.json'
import { serializeConfig, validateConfig } from '../model'
import type { ComponentKind } from '../model'

function readConfig(value: unknown, component: ComponentKind) {
  const config = validateConfig(value)
  if (config.component !== component) throw new Error(`Lightning Island expects a ${component} configuration.`)
  return config
}

export const eventButtonConfig = readConfig(eventButton, 'button')
// "modal" selects the upstream hidden/visible pose mapping, not the DOM role.
export const liveDrawerConfig = readConfig(liveDrawer, 'modal')
export const updateBoardConfig = readConfig(updateBoard, 'modal')

export const islandExamples = [
  { id: 'event-button', title: '01 / 今日小事', description: '按住 → 松开 · 120 ms', config: eventButtonConfig },
  { id: 'live-drawer', title: '02 / LIVE 动态', description: '左侧进入 / 退出 · 180 ms', config: liveDrawerConfig },
  { id: 'update-board', title: '03 / 更新弹窗', description: '上浮与淡入 / 退出 · 160 ms', config: updateBoardConfig },
].map(example => ({ ...example, json: serializeConfig(example.config) }))
