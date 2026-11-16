export const gradientRailDirections = ['top-to-bottom', 'bottom-to-top'] as const;
export type GradientRailDirection = typeof gradientRailDirections[number];
export type GradientRailSettings = {direction: GradientRailDirection; maxWidth?: number; sigma?: number};

const count = 32;
const barHeight = 3;
const gap = 3;
export const gradientRailGeometry = {
  count, barHeight, gap, pitch: barHeight + gap,
  height: count * barHeight + (count - 1) * gap, restWidth: 8, maxWidth: 36, sigma: 2.5,
};
export const gradientRailPress = {delayMs: 240, tolerance: 6};
export const gradientRailSpring = {stiffness: 280, damping: 30, mass: .65};
export const gradientRailPalette = {surface: 250, pending: 230, start: 201, end: 69};
export const gradientRailDemo = {fraction: .65, legMs: 400};
export const defaultGradientRail = {
  direction: 'top-to-bottom', maxWidth: gradientRailGeometry.maxWidth, sigma: gradientRailGeometry.sigma,
} satisfies GradientRailSettings;
export const gradientRailBounds = {maxWidth: [gradientRailGeometry.restWidth, 72], sigma: [.75, 8]} as const;

const readingSteps: Readonly<Record<string, number>> = {
  ArrowUp: -.025, ArrowLeft: -.025, ArrowDown: .025, ArrowRight: .025, PageUp: -.1, PageDown: .1,
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function gradientRailProgress(top: number, travel: number) {
  return travel > 0 ? clamp(top / travel) : 0;
}

export function gradientRailCenter(localY: number) {
  return (localY - gradientRailGeometry.barHeight / 2) / gradientRailGeometry.pitch;
}

export function gradientRailWidth(index: number, center: number, strength: number,
  maxWidth = defaultGradientRail.maxWidth, sigma = defaultGradientRail.sigma,
) {
  const {restWidth} = gradientRailGeometry;
  const distance = index - center;
  return restWidth + (maxWidth - restWidth) * clamp(strength) * Math.exp(-(distance ** 2) / (2 * sigma ** 2));
}

export function gradientRailGray(index: number, progress: number, direction: GradientRailDirection) {
  const reading = clamp(progress);
  const order = direction === 'top-to-bottom' ? index : count - 1 - index;
  const fill = clamp(reading * count - order);
  const {pending, start, end} = gradientRailPalette;
  const depth = .65 * reading + .35 * order / (count - 1);
  const filled = start + (end - start) * depth;
  return Math.round(pending + (filled - pending) * fill);
}

export function gradientRailPressIntent(deltaX: number, deltaY: number) {
  if (Math.hypot(deltaX, deltaY) <= gradientRailPress.tolerance) return 'pending';
  return Math.abs(deltaY) >= Math.abs(deltaX) ? 'drag' : 'cancel';
}

export function gradientRailDrag(startProgress: number, deltaY: number, direction: GradientRailDirection) {
  const sign = direction === 'top-to-bottom' ? 1 : -1;
  return clamp(startProgress + sign * deltaY / gradientRailGeometry.height);
}

export function gradientRailSeek(position: number, direction: GradientRailDirection) {
  const fraction = clamp(position);
  return direction === 'top-to-bottom' ? fraction : 1 - fraction;
}

export function gradientRailKey(key: string, progress: number) {
  if (key === 'Home') return 0;
  if (key === 'End') return 1;
  return Object.hasOwn(readingSteps, key) ? clamp(progress + readingSteps[key]) : undefined;
}
