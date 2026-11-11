export interface AsciiShoalOptions {
  density: number;
  glyphScale: number;
  speed: number;
  sharkCount: number;
  sharkScale: number;
  fishDensity: number;
  backgroundColor: string;
  inkColor: string;
  opacity: number;
  gridOpacity: number;
  wakeOpacity: number;
  /** Hover causes avoidance; click/tap creates a local scattering impulse. */
  interactive: boolean;
  characters: string;
  seed: number;
}

export interface AsciiShoalRuntime {
  enabled?: boolean;
  paused?: boolean;
  reduced?: boolean;
  speed?: number;
  durationMs?: number;
  delayMs?: number;
  loop?: boolean;
  /** Logical playback session; temporary pause or invisibility keeps it active. */
  onRunning?: (running: boolean) => void;
}

export interface AsciiShoalLayout {
  width: number;
  height: number;
  columns: number;
  rows: number;
  cells: number;
  cellWidth: number;
  cellHeight: number;
  fontSize: number;
  dpr: number;
}

export interface AsciiShoalPointer { x: number; y: number; strength?: number; /** @deprecated */ energy?: number; }

export interface AsciiShoalSharkDescriptor {
  readonly id: number;
  readonly phase: number;
  readonly orbitX: number;
  readonly orbitY: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly drift: number;
  readonly direction: number;
  readonly size: number;
  readonly tailPhase: number;
  readonly tailRate: number;
  readonly tone: number;
}

export interface AsciiShoalSchoolDescriptor {
  readonly id: number;
  readonly phase: number;
  readonly orbitX: number;
  readonly orbitY: number;
  readonly drift: number;
  readonly spread: number;
}

export interface AsciiShoalFishDescriptor {
  readonly id: number;
  readonly school: number;
  readonly localX: number;
  readonly localY: number;
  readonly phase: number;
  readonly size: number;
  readonly pulse: number;
}

export interface AsciiShoalScene {
  readonly seed: number;
  readonly sharks: readonly AsciiShoalSharkDescriptor[];
  readonly schools: readonly AsciiShoalSchoolDescriptor[];
  readonly fish: readonly AsciiShoalFishDescriptor[];
}

export interface AsciiShoalPose {
  id: number;
  kind: 'shark' | 'fish';
  x: number;
  y: number;
  angle: number;
  size: number;
  bend?: number;
  /** Dimensionless curvature used for turning the trailing body. */
  curvature?: number;
  tailPhase: number;
  tone: number;
}

export interface AsciiShoalState {
  /** Animated phase in seconds, after delay and both speed multipliers. */
  time: number;
  /** Active runtime milliseconds, including initial delay. */
  elapsed: number;
  frame: number;
  running: boolean;
  paused: boolean;
  completed: boolean;
  destroyed: boolean;
  inView: boolean;
  reduced: boolean;
  density: number;
  cellWidth: number;
  cellHeight: number;
  columns: number;
  rows: number;
  sharkCount: number;
  fishCount: number;
  pointer: { x: number; y: number; strength: number; active: boolean };
  /** Transient diagnostic state, never part of saved settings. Speed is logical pixels/second. */
  swimmers: Array<{id: number; kind: 'shark' | 'fish'; x: number; y: number; angle: number; speed: number; alarm: number; pointerAlarm: number; tailPhase: number; curvature: number}>;
  /** Transient articulated joints in logical pixels; never serialized as settings. */
  spines: Array<{id: number; points: number[]}>;
  splashes: Array<{x: number; y: number; age: number}>;
  positions: Array<{ x: number; y: number; angle: number; size: number }>;
}

export interface AsciiShoalController {
  update(options?: Partial<AsciiShoalOptions>, runtime?: AsciiShoalRuntime): void;
  play(): void;
  pause(): void;
  restart(): void;
  destroy(): void;
  getState(): AsciiShoalState;
}

export const defaults: Readonly<AsciiShoalOptions>;
export function normalizeOptions(options?: Partial<AsciiShoalOptions>): AsciiShoalOptions;
export function computeLayout(width: number, height: number, density?: number, glyphScale?: number, dpr?: number): AsciiShoalLayout;
export function createScene(seed?: number): AsciiShoalScene;
/** Samples autonomous paths; the legacy pointer argument is ignored. Use the controller for steering. */
export function sampleScene(scene: AsciiShoalScene, time: number, width: number, height: number, options?: Partial<AsciiShoalOptions>, pointer?: AsciiShoalPointer | null): { sharks: AsciiShoalPose[]; fish: AsciiShoalPose[] };
export function sampleSharkMask(x: number, y: number, phase?: number, softness?: number, curvature?: number): number;
/** Local centerline displacement: front-to-tail wave plus inertial turn curvature. */
export function sampleSharkSpine(x: number, phase?: number, curvature?: number): number;
export function createAsciiShoal(host: HTMLElement, options?: Partial<AsciiShoalOptions>, runtime?: AsciiShoalRuntime): AsciiShoalController;
