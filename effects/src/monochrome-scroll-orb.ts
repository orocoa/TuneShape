export const monochromeOrbGeometry = {
  size: 64, innerDiameter: 36, trackRadius: 22.5, trackWidth: 2, arcWidth: 3,
};
export const monochromeOrbSpring = {stiffness: 210, damping: 25, mass: .85};
export const monochromeOrbVisibility = {minimumTravel: 320, enterOffset: 80, exitOffset: 40, enterMs: 180, exitMs: 150};
export const monochromeOrbDemoMs = 400;

export type MonochromeOrbSettings = {theme: 'light' | 'dark'};
export const defaultMonochromeOrb: MonochromeOrbSettings = {theme: 'light'};

export const clampOrbProgress = (percent: number) => Math.max(0, Math.min(100, percent));

export function monochromeOrbReading(top: number, scrollHeight: number, clientHeight: number, wasVisible: boolean) {
  const distance = Math.max(0, scrollHeight - clientHeight);
  const position = Math.max(0, Math.min(top, distance));
  const {minimumTravel, enterOffset, exitOffset} = monochromeOrbVisibility;
  return {
    percent: distance > 0 ? 100 * position / distance : 0,
    visible: distance > minimumTravel && position > (wasVisible ? exitOffset : enterOffset),
  };
}

const circumference = 2 * Math.PI * monochromeOrbGeometry.trackRadius;
export function monochromeOrbDash(percent: number) {
  const progress = clampOrbProgress(percent);
  // A solid stroke closes the ring at 100% without overlapping rounded caps.
  return progress === 100 ? 'none' : `${circumference * progress / 100} ${circumference}`;
}
