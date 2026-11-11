// Adapted from Lorenzo Cabra / Bencho, MIT, commit c65992417427bb09e661674ffa800bef29adef49.
import {useUiBench} from "../context";
import { useEffect, useRef, useState } from "react";
import { createValueAnimator, motion, useMotionValue, useTransform } from "../motion";
import { ArrowRight, Check } from "../icons";
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const SPAN = 280;
const H = 56;
const PAD = 4;
const GRIP = H - PAD * 2;
const MIN = 220;
const MAX = 380;
const CORNER = H / 2;
const SPEED = 50;
const SWELL = 1.03;
const HOLD = 1500;
export function SlideConfirm({
  corner = CORNER,
  speed = SPEED,
  width = SPAN,
}: {
  corner?: number;
  speed?: number;
  width?: number;
} = {}) {
  const bench=useUiBench(),clock=bench.clock;

  const animate=createValueAnimator(bench);

  const [done, setDone] = useState(false);
  const [held, setHeld] = useState(false);
  const [hot, setHot] = useState(false);
  const track = useRef<HTMLDivElement | null>(null);
  const grip = useRef<{ id: number; grab: number | null; moved: boolean } | null>(null);
  const beat = useRef(0),gripEl=useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const anchor = useMotionValue(0);
  const pulse = useMotionValue(1);
  const shown = useMotionValue(1);
  const span = clamp(Math.round(width), MIN, MAX);
  const TRAVEL = span - PAD * 2 - GRIP;
  const r = clamp(corner, 0, CORNER);
  const gripR = Math.max(0, r - PAD);
  const mark = TRAVEL;
  const stiff = 260 + (clamp(speed, 0, 100) / 100) * 640;
  const spring = {
    type: "spring" as const,
    stiffness: stiff,
    damping: 2 * Math.sqrt(stiff * 0.9),
    mass: 0.9,
  };
  const home = { ...spring, damping: 2 * Math.sqrt(stiff * 0.9) * 0.62 };
  useEffect(() => () => {
    clock.clearInterval(beat.current);
    loose.current?.();
  }, []);
  const loose = useRef<(() => void) | null>(null);
  const live = useRef<{
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
  }>({ move: () => {}, up: () => {} });
  const watch = () => {
    loose.current?.();
    const onMove = (e: PointerEvent) => live.current.move(e);
    const onUp = (e: PointerEvent) => { live.current.up(e); loose.current?.(); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    loose.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      loose.current = null;
    };
  };
  const seen = useTransform(x, (v) => clamp(v, 0, TRAVEL));
  const wide = useTransform([seen, anchor], ([v, a]: number[]) =>
    GRIP + clamp(a - v, 0, TRAVEL));
  const over = useTransform(x, (v) => Math.max(0, -v));
  const squash = useTransform(over, (o) => 1 - Math.min(0.08, o / 110));
  const wash = useTransform(seen, (v) => v + GRIP);
  const say = useTransform(seen, [0, TRAVEL * 0.55], [1, 0]);
  const arrow = useTransform([seen, shown], ([v, on]: number[]) =>
    on * clamp(1 - (v - TRAVEL * 0.55) / (TRAVEL * 0.4), 0, 1));
  const sx = useTransform(squash, (q) => q * (hot && !held && !done ? SWELL : 1));
  const sy = useTransform(squash, (q) => (1 / q) * (hot && !held && !done ? SWELL : 1));
  const local = (clientX: number) => {
    const box = track.current?.getBoundingClientRect();
    if (!box) return 0;
    const k = box.width / span;
    return (clientX - box.left) / (k || 1);
  };
  const finish = () => {
    setDone(true);
    anchor.set(x.get());
    animate(shown, 0, { duration: 0.16 });
    animate(x, 0, spring);
    animate(pulse, [1, 0.974, 1], {
      duration: 0.42,
      times: [0, 0.62, 1],
      ease: [0.33, 0.55, 0.2, 1],
      delay: 0.1,
    });
    beat.current = clock.setTimeout(() => {
      setDone(false);
      animate(shown, 1, { duration: 0.22, delay: 0.12 });
      animate(anchor, 0, { type: "spring", stiffness: 380, damping: 34, mass: 0.9 });
    }, HOLD);
  };
  const down = (e: React.PointerEvent) => {
    bench.cue('glide',e.nativeEvent);x.stop();anchor.stop();
    if (done) return;
    e.stopPropagation();
    grip.current = { id: e.pointerId, grab: null, moved: false };
    setHeld(true);
    try { track.current?.setPointerCapture(e.pointerId); } catch {  }
    watch();
  };
  const move = (e: PointerEvent | React.PointerEvent) => {
    const g = grip.current;
    if (!g || g.id !== e.pointerId) return;
    const at = local(e.clientX);
    if (g.grab === null) { g.grab = at - x.get(); return; }
    const next = clamp(at - g.grab, 0, TRAVEL);
    if (Math.abs(next - x.get()) > 0.5) g.moved = true;
    x.set(next);
  };
  const up = (e: PointerEvent | React.PointerEvent) => {
    const g = grip.current;
    if (!g) return;
    grip.current = null;
    try { track.current?.releasePointerCapture?.(e.pointerId); } catch {  }
    setHeld(false);
    if (e.type!=='pointercancel'&&x.get() >= mark) finish();
    else {
      animate(x, 0, home);
    }
  };
  const settle=()=>{clock.clearInterval(beat.current);loose.current?.();grip.current=null;setDone(false);setHeld(false);setHot(false);[x,anchor,pulse,shown].forEach(v=>v.stop());x.set(0);anchor.set(0);pulse.set(1);shown.set(1)};
  // Confirmation is an explicit user action, never a hover or replay demo.
  bench.actions={demonstrate(){},settle,cancel(){grip.current=null;setHeld(false);loose.current?.()},getState:()=>({done,held,position:x.get(),travel:TRAVEL,handleWidth:wide.get(),rightEdge:4+seen.get()+wide.get()})};
  useEffect(()=>{const update=()=>{const el=gripEl.current;if(el){el.setAttribute('aria-valuenow',String(done?100:Math.round(seen.get()/TRAVEL*100)));el.setAttribute('aria-valuetext',done?bench.settings.confirmedLabel:Math.round(seen.get()/TRAVEL*100)+'%')}};update();return x.onChange(update)},[done,TRAVEL]);
  live.current = { move, up };
  return (
    <div className="sld" data-confirmed={done} style={{ width: span, height: H }}>
      <motion.div
        className="sld-track"
        ref={track}
        style={{ borderRadius: r, scale: pulse }}
        data-held={held || undefined}
        data-done={done || undefined}
        onPointerDown={down}
      >
        {}
        <motion.i
          className="sld-wash"
          aria-hidden="true"
          style={{ width: wash, borderRadius: gripR }}
        />
        <motion.span className="sld-say" style={{ opacity: say }}>
          {bench.settings.confirmLabel}
        </motion.span>
        <motion.button
          type="button"
          className="sld-grip" ref={gripEl} role="slider" aria-valuemin={0} aria-valuemax={100}
          onKeyDown={(e:React.KeyboardEvent<HTMLElement>)=>{if(!['ArrowRight','ArrowUp','ArrowLeft','ArrowDown','Home','End','Enter',' ','Escape'].includes(e.key))return;e.preventDefault();e.stopPropagation();bench.cue('tick',e.nativeEvent);if(e.key==='Home'||e.key==='Escape'){settle();return}if(done)return;x.stop();if(e.key==='End')x.set(TRAVEL);else if(e.key==='Enter'||e.key===' '){if(x.get()>=mark)finish()}else x.set(clamp(x.get()+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1)*TRAVEL*(e.shiftKey?.01:.1),0,TRAVEL))}}
          onPointerEnter={() => setHot(true)}
          onPointerLeave={() => setHot(false)}
          style={{
            x: seen,
            scaleX: sx,
            scaleY: sy,
            width: wide,
            borderRadius: gripR,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.7 }}
          aria-label={done?bench.settings.confirmedLabel:bench.settings.confirmLabel}
        >
          <motion.span className="sld-arrow" style={{ opacity: arrow }} aria-hidden="true">
            <ArrowRight size={20} strokeWidth={2} />
          </motion.span>
          {}
          <motion.span
            className="sld-done"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.7 }}
            transition={{ duration: 0.16, ease: [0.33, 0.55, 0.2, 1] }}
          >
            <Check size={20} strokeWidth={2} />
            {bench.settings.confirmedLabel}
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}
