import {useBench} from '../context';
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* ══ Wake slider ══════════════════════════════════════════
   A range with no thumb: a row of thin bars, solid up to the
   value and faint after it, with the reading beside them. Drag
   anywhere along it. Drag slowly and the bars simply fill; drag
   fast and every bar the value sweeps past springs up, taller the
   faster you went, and settles back — a wake left behind the hand.

   ── EACH BAR HOLDS A LITTLE ENERGY ──────────────────────
   When the value crosses a bar, that bar takes energy from the
   speed of the drag. Every frame all of it decays at the same
   rate, so the bars crossed longest ago have fallen furthest: the
   tallest ones are always at the hand and the run tails off
   behind it. That falloff IS the wake; nothing draws it.

   ── WRITTEN, NOT RENDERED ───────────────────────────────
   The heights change every frame, so they go straight onto each
   bar's transform from a ref. React renders when the value
   changes, which is what the reading and the colours need, and
   the loop runs only while some bar still has energy. */

const H = 20; // a bar at rest, px
const GAP = 4; // bar pitch minus its width
const BAR = 3;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function WakeSlider({
  /* how many bars make the track */
  bars = 36,
  /* how high the wake rises, 0..100 */
  wake = 60,
}: {
  bars?: number;
  wake?: number;
} = {}) {
  const bench=useBench(),{clock}=bench;const requestAnimationFrame=clock.request,cancelAnimationFrame=clock.cancel,performance=clock.performance;
  const n = Math.round(clamp(bars, 12, 64));
  const [value, setValue] = useState(bench.settings.initialValue);
  const track = useRef<HTMLDivElement | null>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const st = useRef({
    energy: new Float32Array(n),
    down: false,
    pointerId: null as number | null,
    lastX: 0,
    lastT: 0,
    speed: 0,
    raf: 0,
    at: bench.settings.initialValue/100, // the value as a fraction, without React in the way
    lastBar: -1,
  });
  const knob = useRef(wake);
  knob.current = wake;

  /* a new bar count is a new row */
  useEffect(() => {
    st.current.energy = new Float32Array(n);
  }, [n]);

  const loop = () => {
    const s = st.current;
    if (s.raf) return;
    let prev = performance.now();
    const run = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      let live = false;
      const fall = Math.exp(-dt * 6.5);
      for (let i = 0; i < s.energy.length; i++) {
        s.energy[i] *= fall;
        if (s.energy[i] < 0.002) s.energy[i] = 0;
        else live = true;
        const b = els.current[i];
        /* up to 2.6 times as tall at the very top of the knob */
        if (b) b.style.transform = `scaleY(${(1 + s.energy[i] * 1.6).toFixed(3)})`;
      }
      s.raf = live ? requestAnimationFrame(run) : 0;
    };
    s.raf = requestAnimationFrame(run);
  };

  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  const cancelDrag = () => {
    st.current.down = false;
    st.current.pointerId = null;
    st.current.speed = 0;
    st.current.lastT = 0;
  };
  const settle = () => {
    const s = st.current;
    cancelDrag();
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    s.energy.fill(0);
    els.current.forEach(el => { if (el) el.style.transform = 'scaleY(1)'; });
  };
  // Reduced motion must never freeze a raised bar or leave a stale RAF handle.
  useLayoutEffect(() => { if (bench.runtime.reduced) settle(); }, [bench.runtime.reduced]);

  /* move the value to a fraction, waking every bar it passes */
  const to = (f: number, speed: number) => {
    const s = st.current;
    f = clamp(f, 0, 1);
    const from = s.at;
    s.at = f;
    const a = Math.round(from * (n - 1)), b = Math.round(f * (n - 1));
    /* how hard: the drag's speed in bars per second, through a
       curve that saturates, scaled by the knob */
    const push = (bench.runtime.reduced||f===from?0:1 - Math.exp(-speed / 900)) * (knob.current / 60);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    for (let i = lo; i <= hi; i++) s.energy[i] = Math.max(s.energy[i], push);
    if (b !== s.lastBar) {
      s.lastBar = b;
    }
    setValue(Math.round(f * 100));
    if (!bench.runtime.reduced && s.energy.some(energy => energy > 0)) loop();
  };

  const frac = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return (clientX - r.left) / r.width;
  };

  const lit = Math.round((value / 100) * (n - 1));

  bench.actions={demonstrate(){},settle,cancel:cancelDrag,getState:()=>({value,energy:[...st.current.energy],dragging:st.current.down,pendingFrame:st.current.raf!==0})};
  return (
    <div className="wks">
      <div
        ref={track}
        className="wks-track"
        role="slider"
        tabIndex={0}
        aria-label="Value"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        style={{ width: n * (BAR + GAP) - GAP, height: H * 2.6 }}
        onPointerDown={(e) => {
          const s = st.current;
          if (e.button !== 0 || s.down) return;
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* a scripted pointer */ }
          s.down = true;
          s.pointerId = e.pointerId;
          s.lastX = e.clientX;
          s.lastT = e.timeStamp;
          s.speed = 0;
          to(frac(e.clientX), 0);
        }}
        onPointerMove={(e) => {
          const s = st.current;
          if (!s.down || s.pointerId !== e.pointerId) return;
          // Pointer velocity uses event time. The animation clock is idle at
          // rest and changes rate with playback controls; neither is input time.
          const now = e.timeStamp;
          const dt = Math.max(0.008, (now - s.lastT) / 1000);
          /* speed in px per second, smoothed so one jittery frame
             cannot fake a fling */
          const v = Math.abs(e.clientX - s.lastX) / dt;
          const memory = Math.exp(-dt * 60 * Math.LN2);
          s.speed = s.speed * memory + v * (1 - memory);
          s.lastX = e.clientX;
          s.lastT = now;
          to(frac(e.clientX),s.speed);bench.cue('tick',e.nativeEvent);
        }}
        onPointerUp={(e) => {
          if (st.current.pointerId !== e.pointerId) return;
          cancelDrag();
          try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* never captured */ }
        }}
        onPointerCancel={(e) => { if (st.current.pointerId === e.pointerId) cancelDrag(); }}
        onLostPointerCapture={(e) => { if (st.current.pointerId === e.pointerId) cancelDrag(); }}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 1;
          let next: number | null = null;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") next = value + step;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = value - step;
          if (e.key === "Home") next = 0;
          if (e.key === "End") next = 100;
          if (next === null) return;
          e.preventDefault();
          to(clamp(next,0,100)/100,0);bench.cue('tick',e.nativeEvent);
        }}
      >
        {Array.from({ length: n }, (_, i) => (
          <span
            key={i}
            ref={(b) => { els.current[i] = b; }}
            className="wks-bar"
            data-on={(value > 0 && i <= lit) || undefined}
            style={{ height: H }}
          />
        ))}
      </div>
      <span className="wks-value">{value}</span>
    </div>
  );
}
