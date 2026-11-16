export const orbSize = 56;
export const orbDurationMs = 400;
export const orbVisibilityMs = {enter: 180, exit: 160};

// Clockwise from twelve o'clock on the original 28 × 28 pixel grid.
export const orbSegments = [
  [13, 0], [16, 1], [19, 2], [22, 4], [24, 7], [25, 10],
  [26, 13], [25, 16], [24, 19], [22, 22], [19, 24], [16, 25],
  [13, 26], [10, 25], [7, 24], [4, 22], [2, 19], [1, 16],
  [0, 13], [1, 10], [2, 7], [4, 4], [7, 2], [10, 1],
] as const;

export const orbDigits = [
  ['111', '101', '101', '101', '111'],
  ['010', '110', '010', '010', '111'],
  ['111', '001', '111', '100', '111'],
  ['111', '001', '111', '001', '111'],
  ['101', '101', '111', '001', '001'],
  ['111', '100', '111', '001', '111'],
  ['111', '100', '111', '101', '111'],
  ['111', '001', '010', '010', '010'],
  ['111', '101', '111', '101', '111'],
  ['111', '101', '111', '001', '111'],
] as const;

export const orbParticles = [
  {x: -6, y: 47, size: 2, duration: 1800, delay: 0, rise: 14, opacity: .25},
  {x: 60, y: 43, size: 3, duration: 2400, delay: 90, rise: 22, opacity: .5},
  {x: -7, y: 23, size: 4, duration: 2800, delay: 275, rise: 18, opacity: .42},
  {x: 61, y: 18, size: 2, duration: 1900, delay: 440, rise: 16, opacity: .26},
  {x: 10, y: -4, size: 2, duration: 2200, delay: 180, rise: 14, opacity: .35},
  {x: 43, y: -5, size: 3, duration: 2600, delay: 650, rise: 20, opacity: .55},
  {x: -1, y: 61, size: 2, duration: 2100, delay: 520, rise: 16, opacity: .3},
] as const;

export const orbParticleFade = {inMs: 100, outStart: .12};
export const orbMinimumTravel = 320;
export const orbRevealOffset = 72;

export type PixelScrollOrbSettings = {revealOffset?: number; particlesEnabled?: boolean};
export const defaultPixelScrollOrb = {revealOffset: orbRevealOffset, particlesEnabled: true};
export const pixelOrbBounds = {revealOffset: [0, 320]} as const;

type OrbParticle = typeof orbParticles[number];

export function orbParticleSpawn(anchor: OrbParticle, random = Math.random) {
  const centerX = anchor.x + anchor.size / 2;
  const centerY = anchor.y + anchor.size / 2;
  const dx = centerX - orbSize / 2;
  const dy = centerY - orbSize / 2;
  const radius = Math.hypot(dx, dy);
  const along = (random() < .5 ? -1 : 1) * (2 + Math.floor(random() * 3));
  const outward = Math.floor(random() * 3);
  const sizeRoll = random();
  const size = sizeRoll < .55 ? 2 : sizeRoll < .88 ? 3 : 4;
  // Offset the anchor center along the tangent and outward normal.
  return {
    x: Math.round(centerX - size / 2 + (dx * outward - dy * along) / radius),
    y: Math.round(centerY - size / 2 + (dy * outward + dx * along) / radius),
    size,
    drift: Math.sign(dx) * (2 + Math.floor(random() * 2)),
  };
}

export function orbParticleFrame(anchor: OrbParticle, phase: number) {
  const travel = 1 - (1 - phase) ** 2;
  const fadeIn = phase * anchor.duration / orbParticleFade.inMs;
  const fadeOut = (1 - phase) / (1 - orbParticleFade.outStart);
  return {travel, opacity: anchor.opacity * Math.min(fadeIn, 1, fadeOut)};
}

const nonnegative = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;

export function orbScrollMetrics(scrollTop: number, scrollHeight: number, clientHeight: number, revealOffset = defaultPixelScrollOrb.revealOffset) {
  const distance = Math.max(0, nonnegative(scrollHeight) - nonnegative(clientHeight));
  const top = Math.min(nonnegative(scrollTop), distance);
  const percent = distance > 0 ? Math.round(100 * top / distance) : 0;
  return { distance, percent, visible: distance > orbMinimumTravel && top > revealOffset };
}

export function orbFace(percent: number) {
  const digits = String(percent).padStart(2, '0');
  return {
    digits,
    digitX: (orbSize - (digits.length * 12 - 3)) / 2,
    activeSegments: Math.round(percent * orbSegments.length / 100),
  };
}
