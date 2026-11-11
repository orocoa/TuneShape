// Adapted from Lorenzo Cabra / Bencho, MIT, commit c65992417427bb09e661674ffa800bef29adef49.
import {useUiBench} from "../context";
import { useRef, useState } from "react";
const rate = (speed: number) => 1.6 - (speed / 100) * 1.2;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const W = 276;
const GAP = 16;
const BAR = 36;
const SHAPES = [
  { id: "land", w: 276, h: 207, label: "Landscape, 4 by 3" },
  { id: "square", w: 239, h: 239, label: "Square, 1 by 1" },
  { id: "tall", w: 207, h: 276, label: "Portrait, 3 by 4" },
] as const;
const MARK = {
  land: { x: 1.5, y: 3.38, w: 15, h: 11.25 },
  square: { x: 2.5, y: 2.5, w: 13, h: 13 },
  tall: { x: 3.38, y: 1.5, w: 11.25, h: 15 },
} as const;
const BASE = 520;
export function Aspect({
  corner = 20,
  morph = 50,
}: { corner?: number; morph?: number } = {}) {
  const bench=useUiBench(),clock=bench.clock;


  const [at, setAt] = useState(['land','square','tall'].indexOf(bench.settings.ratio));
  const demos=useRef<number[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const ms = Math.round(BASE * rate(clamp(morph, 0, 100)));
  const shape = SHAPES[at];
  const pick = (i: number, focus = false) => {
    if (i === at) return;
    setAt(i);
    if (focus) tabs.current[i]?.focus();
  };
  const key = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1
      : 0;
    if (!d) return;
    e.preventDefault();
    pick((at + d + SHAPES.length) % SHAPES.length, true);bench.cue('tick',e.nativeEvent);bench.activity(ms);
  };
  const interrupt=()=>{demos.current.forEach(clock.clearInterval);demos.current=[]};
  bench.actions={demonstrate(){interrupt();setAt(0);demos.current=[clock.setTimeout(()=>setAt(2),900),clock.setTimeout(()=>setAt(1),1800)];bench.activity(2500)},settle(){interrupt();setAt(['land','square','tall'].indexOf(bench.settings.ratio))},interrupt,getState:()=>({ratio:shape.id,width:shape.w,height:shape.h,area:shape.w*shape.h})};
  return (
    <div
      className="asp" data-ratio={shape.id}
      style={{ width: W, height: W + GAP + BAR, ["--asp-ms" as string]: `${ms}ms` }}
    >
      {}
      <div className="asp-stage" style={{ height: W }}>
        {}
        <div
          className="asp-pic"
          style={{
            width: shape.w,
            height: shape.h,
            borderRadius: clamp(corner, 0, 40),
            backgroundImage: `url(${bench.settings.image})`,
          }}
        />
      </div>
      <div className="asp-tabs" role="radiogroup" aria-label="Aspect ratio" onKeyDown={key}>
        {}
        <span
          className="asp-thumb"
          aria-hidden="true"
          style={{ transform: `translateX(${at * 100}%)` }}
        />
        {SHAPES.map((s, i) => {
          const m = MARK[s.id];
          return (
            <button
              key={s.id}
              ref={(el) => { tabs.current[i] = el; }}
              className="asp-tab"
              role="radio"
              aria-checked={i === at}
              aria-label={s.label}
              tabIndex={i === at ? 0 : -1}
              onClick={e=>{interrupt();pick(i);bench.cue('glide',e.nativeEvent);bench.activity(ms)}}
            >
              <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
                <rect
                  x={m.x}
                  y={m.y}
                  width={m.w}
                  height={m.h}
                  rx={2}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
