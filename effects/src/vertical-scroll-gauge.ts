export const verticalGaugeDirections = ['top-to-bottom', 'bottom-to-top'] as const;
export type VerticalGaugeDirection = typeof verticalGaugeDirections[number];
export type VerticalGaugeSettings = {direction: VerticalGaugeDirection; damping?: number};
export const verticalGaugeSpring = {stiffness: 300, damping: 36, mass: .6, restDelta: .001, skipInitialAnimation: true};
export const defaultVerticalGauge = {direction: 'top-to-bottom', damping: verticalGaugeSpring.damping} satisfies VerticalGaugeSettings;
export const verticalGaugeBounds = {damping: [12, 65]} as const;

export function verticalGaugeSpringFor(settings?: VerticalGaugeSettings) {
  return {...verticalGaugeSpring, damping: settings?.damping ?? defaultVerticalGauge.damping};
}

export const verticalGaugeDemo = {fraction: .65, legMs: 400};

const scrollSteps: Readonly<Record<string, number | undefined>> = {
  ArrowUp: -.025, ArrowDown: .025, ArrowRight: .025, ArrowLeft: -.025, PageDown: .1, PageUp: -.1,
};

export function clampGaugeProgress(value: number) {
  return Math.max(0, Math.min(value, 1));
}

// The same reflection converts reading progress to a track position and vice versa.
export function gaugeTrackPosition(value: number, direction: VerticalGaugeDirection) {
  const fraction = clampGaugeProgress(value);
  return direction === 'bottom-to-top' ? 1 - fraction : fraction;
}

export function gaugeKeyProgress(key: string, progress: number) {
  if (key === 'Home') return 0;
  if (key === 'End') return 1;
  const step = Object.hasOwn(scrollSteps, key) ? scrollSteps[key] : undefined;
  return step === undefined ? undefined : clampGaugeProgress(progress + step);
}
