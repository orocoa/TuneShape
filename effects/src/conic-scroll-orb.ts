export const conicOrbGeometry = {size: 46, coreInset: 4, startAngle: 220};
export const conicOrbVisibility = {minimumTravel: 320, revealOffset: 72, durationMs: 180, opacity: .78, hoverOpacity: .93};
export const conicOrbSpring = {stiffness: 210, damping: 25, mass: .85};
export const conicOrbDemo = {fraction: .65, legMs: 400};

export const clampConicProgress = (percent: number) => Math.max(0, Math.min(100, percent));

export function conicOrbReading(top: number, scrollHeight: number, clientHeight: number) {
  const distance = Math.max(0, scrollHeight - clientHeight);
  const position = Math.max(0, Math.min(top, distance));
  return {
    distance,
    percent: distance ? position / distance * 100 : 0,
    visible: distance > conicOrbVisibility.minimumTravel && position > conicOrbVisibility.revealOffset,
  };
}
