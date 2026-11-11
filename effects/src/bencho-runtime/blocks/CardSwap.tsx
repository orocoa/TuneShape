import {useBench} from '../context';
import { useEffect, useRef, useState } from "react";

/* ══ Card swap ════════════════════════════════════════════
   A stack of photo cards in depth, each a step further back and up
   to the right, slanted. Press the front card, or drag and fling it,
   and it goes straight to the back while the rest step forward.
   With Auto on it also does that by itself every few seconds,
   pausing while a pointer is on the stack.

   ── A CARD IS ITS SLOT ──────────────────────────────────
   The order is the only state: which card is in front, which is
   behind it. A slot is a fixed transform, so moving a card is
   changing its slot and letting the transition carry it — the card
   sent back takes the back slot's paint order AT ONCE and travels
   there behind the others. That needs the paint order to be the
   z-index and not the depth, so the stage is flat (no preserve-3d)
   and the perspective sits on the stage itself, aimed at the
   block's middle as it was when it sat on .csw. */

const W = 360;
const H = 350;
const CW = 196;
const CH = 246;
export const cardSwapSlot = (k: number, gap = 34) =>
  `translate3d(${k * gap}px, ${-k * 26 * gap / 34}px, ${-k * 70 * gap / 34}px) skewY(6deg)`;

export function CardSwap({
  /* off by default: a stack that reshuffles itself on a timer is a
     thing that keeps moving while you are reading the page */
  auto = false,
  /* seconds between swaps, when it is on */
  every = 4,
}: {
  auto?: boolean;
  every?: number;
} = {}) {
  const bench=useBench(),{clock}=bench,CARDS=bench.settings.images.map(c=>({...c,title:c.label}));
  const slot=(k:number)=>cardSwapSlot(k,bench.settings.stackGap);
  const performance=clock.performance;
  const [order, setOrder] = useState(CARDS.map((c) => c.id));
  const els = useRef<Record<string, HTMLDivElement | null>>({});
  const st = useRef({ hover: false, drag: null as null | { id: string; real: boolean; pid: number; x: number; y: number; dx: number; dy: number; t: number } });

  /* send the front card to the back: it takes the back slot now, from
     wherever it is — the front slot, or where a drag left it */
  /* every card goes back to its slot: no drag survives a swap, so a
     card can never be left holding where a hand once put it */
  const settle = () => {
    for (const el of Object.values(els.current)) if (el) { el.style.transition = ""; el.style.transform = ""; }
  };

  const swap = () => {
    clock.activity(600);
    settle();
    setOrder((o) => [...o.slice(1), o[0]]);
  };

  /* ── the drag ────────────────────────────────────────────
     Only the card that was grabbed moves, and the window hears the
     gesture, so it cannot be lost off the edge of the block or picked
     up by a card the pointer passes over. A real press takes over from
     a scripted one. Past a little way the card is on a rubber band, so
     a long drag cannot carry it out of the block. */
  const unhook = useRef(() => {});
  useEffect(() => () => unhook.current(), []);
  const grab = (e: React.PointerEvent<HTMLDivElement>, id: string, front: boolean) => {
    const s = st.current;
    if (s.drag && e.nativeEvent.isTrusted && !s.drag.real) { unhook.current(); s.drag = null; settle(); }
    if (!front || s.drag || e.button !== 0) return;
    const el = e.currentTarget;
    s.drag = { id, real: e.nativeEvent.isTrusted, pid: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, t: performance.now() };
    el.style.transition = "none";
    const rub = (d: number) => 160 * Math.tanh(d / 160);
    const mine = (ev: PointerEvent) => !!s.drag && ev.pointerId === s.drag.pid && ev.isTrusted === s.drag.real;
    const mv = (ev: PointerEvent) => {
      if (!mine(ev) || !s.drag) return;
      const d = s.drag;
      d.dx = ev.clientX - d.x;
      d.dy = ev.clientY - d.y;
      const x = rub(d.dx), y = rub(d.dy);
      el.style.transform = `${slot(0)} translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(x * 0.05).toFixed(2)}deg)`;
    };
    const up = (ev: PointerEvent) => {
      if (!mine(ev) || !s.drag) return;
      const d = s.drag;
      s.drag = null;
      unhook.current();
      const far = Math.hypot(d.dx, d.dy);
      const quick = far / Math.max(1, performance.now() - d.t) > 0.6;
      /* a press, or a drag far or quick enough: to the back */
      if (ev.type !== "pointercancel" && (far < 6 || far > 70 || (quick && far > 24))) { swap(); return; }
      /* not far enough: it springs back into the front slot */
      settle();
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    unhook.current = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      unhook.current = () => {};
    };
  };

  /* the timer: one swap every few seconds, unless a hand is on it */
  useEffect(() => {
    if (!auto) return;
    const id = clock.setInterval(() => {
      if (!st.current.hover && !st.current.drag && !document.hidden) swap();
    }, Math.max(1.5, every) * 1000, {durationIndependent:true});
    return () => clock.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, every, order]);

  bench.actions={demonstrate:swap,settle:()=>{unhook.current();st.current.drag=null;settle()},cancel:()=>{unhook.current();st.current.drag=null;settle()},getState:()=>({front:order[0],order})};
  return (
    <div
      className="csw"
      style={{ width: W, height: H }}
      onPointerEnter={() => { st.current.hover = true; }}
      onPointerLeave={() => { st.current.hover = false; }}
    >
      <div className="csw-stage" style={{ width: CW, height: CH }}>
        {CARDS.map((c) => {
          const k = order.indexOf(c.id);
          const front = k === 0;
          return (
            <div
              key={c.id}
              ref={(el) => { els.current[c.id] = el; }}
              className="csw-card"
              data-front={front || undefined}
              /* the slot is a variable the stylesheet turns into the
                 transform; the drag writes the transform itself, which
                 wins until it is cleared */
              style={{
                zIndex: CARDS.length - k,
                ["--t" as string]: slot(k),
              }}
              role="button" tabIndex={front?0:-1} aria-label={c.title} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();swap();bench.cue('bump',e.nativeEvent)}}}
              onPointerDown={(e) => {if(front)bench.cue('bump',e.nativeEvent);grab(e,c.id,front)}}
            >
              <img className="csw-photo" src={c.src} alt="" draggable={false} />
              <div className="csw-tag">{c.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
