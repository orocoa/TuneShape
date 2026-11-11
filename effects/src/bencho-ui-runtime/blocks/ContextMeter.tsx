// Adapted from Lorenzo Cabra / Bencho, MIT, commit c65992417427bb09e661674ffa800bef29adef49.
import {useUiBench} from "../context";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "../motion";
type Kind = { id: string; name: string; k: number; colour:string };
const COLS = 20;
const ROWS = 10;
const DOT_W = 11;
const DOT_H = 11;
const GAP = 3;
export type MeterStyle = "Field" | "Bar";
const fmt = (k: number) => `${k.toFixed(1)}K`;
function Roll({ text, up }: { text: string; up: boolean }) {
  const chars = text.split("");
  return (
    <span className="ctx-roll" aria-hidden="true">
      {chars.map((c, i) => {
        const place = chars.length - 1 - i;
        if (!/[0-9]/.test(c)) return <span key={`s${place}`} className="ctx-sym">{c}</span>;
        return (
          <span key={`p${place}`} className="ctx-wheel">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={c}
                className="ctx-digit"
                initial={{ y: up ? "0.18em" : "-0.18em", opacity: 0, filter: "blur(2px)" }}
                animate={{ y: "0em", opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(2px)", transition: { duration: 0.16 } }}
                transition={{ duration: 0.5, ease: [0.34, 1.45, 0.64, 1], delay: i * 0.07 }}
              >
                {c}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}
const OUTER = 6;
const INNER = 2;
const corners = (first: boolean, last: boolean) => ({
  borderTopLeftRadius: first ? OUTER : INNER,
  borderBottomLeftRadius: first ? OUTER : INNER,
  borderTopRightRadius: last ? OUTER : INNER,
  borderBottomRightRadius: last ? OUTER : INNER,
});
export function ContextMeter({
  style = "Bar",
  colour = "Colour",
}: {
  style?: MeterStyle;
  colour?: "Colour" | "Mono";
} = {}) {
  const bench=useUiBench(),clock=bench.clock;
  const KINDS:Kind[]=bench.settings.segments,WINDOW=bench.settings.capacity,CHAT_COMPACT=Math.min(bench.settings.compactChat,KINDS.find(c=>c.id==="chat")?.k??0);
const ORDER = KINDS.map((_, i) => i).sort((a, b) => KINDS[b].k - KINDS[a].k);
const ownersFor = (sizes: number[]) => {
  const out: (number | null)[] = [];
  ORDER.forEach((ci) => {
    for (let j = 0; j < Math.round(sizes[ci]/WINDOW*200) && out.length < 200; j++) out.push(ci);
  });
  while (out.length < 200) out.push(null);
  return out;
};
const OWNERS = [
  ownersFor(KINDS.map((c) => c.k)),
  ownersFor(KINDS.map((c) => (c.id === "chat" ? CHAT_COMPACT : c.k))),
];
const FIRST = OWNERS[0].findIndex((o, i) => o !== OWNERS[1][i]);
const LAST = OWNERS[0].reduce<number>((l, o, i) => (o !== OWNERS[1][i] ? i : l), FIRST);
const RIPPLE = 220;
const DELAY = OWNERS[0].map((o, i) => (o !== OWNERS[1][i] ? 1 + Math.round(((i - FIRST) / (LAST - FIRST || 1)) * RIPPLE) : 0));



  const demos=useRef<number[]>([]);
  const [compact, setCompact] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const sizes = KINDS.map((c) => (c.id === "chat" && compact ? CHAT_COMPACT : c.k));
  const used = sizes.reduce((a, b) => a + b, 0);
  const owner = OWNERS[compact ? 1 : 0];
  const was = OWNERS[compact ? 0 : 1];
  const [moved, setMoved] = useState(false);
  const hotKind = hot ? KINDS.findIndex((c) => c.id === hot) : -1;
  const target = hotKind >= 0 ? sizes[hotKind] : used;
  const last = useRef(target);
  const up = useRef(true);
  if (target !== last.current) { up.current = target > last.current; last.current = target; }
  const interrupt=()=>{demos.current.forEach(clock.clearInterval);demos.current=[]};
  bench.actions={demonstrate(){interrupt();setMoved(true);setCompact(true);demos.current=[clock.setTimeout(()=>{setCompact(false)},1200)];bench.activity(1900)},settle(){interrupt();setCompact(false);setHot(null);setMoved(false)},interrupt,getState:()=>({compact,hot,used,capacity:WINDOW,display:target,style,colour})};
  return (
    <div
      className="ctx" data-compact={compact} style={Object.fromEntries(KINDS.map((c,i)=>['--k-'+c.id,colour==='Mono'?`color-mix(in srgb,var(--fill-on) ${[100,76,54,36,22,18,14,10][i]}%,var(--fill-slab))`:c.colour])) as React.CSSProperties}
      data-hot={hot || undefined}
      data-mono={colour === "Mono" || undefined}
      onPointerLeave={() => setHot(null)}
    >
      {}
      <div className="ctx-head">
        <span className="ctx-title">Context</span>
        <button type="button" className="ctx-act" disabled={!KINDS.some(c=>c.id==='chat')} data-quiet={compact || undefined} onClick={e=>{interrupt();setMoved(true);setCompact(v=>!v);bench.cue('hush',e.nativeEvent);bench.activity(850)}}>
          {compact ? "Undo" : "Compact"}
        </button>
      </div>
      <div className="ctx-figure" aria-live="polite">
        <span className="ctx-num">
          <span className="ctx-sr">{fmt(target)}</span>
          <Roll text={fmt(target)} up={up.current} />
        </span>
        <span className="ctx-of">{hotKind >= 0 ? KINDS[hotKind].name : `of ${WINDOW}K`}</span>
      </div>
      {style === "Bar" ? (
        <div
          className="ctx-bar"
          aria-hidden="true"
          data-wave={moved ? (compact ? "a" : "b") : undefined}
          onPointerLeave={() => setHot(null)}
        >
          {ORDER.map((ci, n) => {
            const c = KINDS[ci];
            return (
              <i
                key={c.id}
                className="ctx-seg"
                data-kind={c.id}
                data-dim={hot !== null && c.id !== hot || undefined}
                style={{
                  flexGrow: sizes[ci],"--ctx-colour":`var(--k-${c.id})`,
                  ...corners(n === 0, false),
                  "--ctx-wave": `${n * 55}ms`,
                  "--ctx-give": c.id === "chat" ? 0.78 : 0.93,
                } as React.CSSProperties}
                onPointerEnter={()=>{interrupt();setHot(c.id)}}
              />
            );
          })}
          <i
            className="ctx-seg ctx-seg-room"
            style={{ flexGrow: Math.max(0,WINDOW - used), ...corners(false, true) }}
            data-dim={hot !== null || undefined}
            onPointerEnter={() => setHot(null)}
          />
        </div>
      ) : (
        <div
          className="ctx-grid"
          data-wave={moved ? (compact ? "a" : "b") : undefined}
          style={{
            gridTemplateRows: `repeat(${ROWS}, ${DOT_H}px)`,
            gridTemplateColumns: `repeat(${COLS}, ${DOT_W}px)`,
            gap: GAP,
          }}
          aria-hidden="true"
          onPointerLeave={() => setHot(null)}
        >
          {owner.map((o, i) => (
            <i
              key={moved && DELAY[i] ? `${i}${compact ? "+" : "-"}` : i}
              className="ctx-dot"
              data-kind={o === null ? undefined : KINDS[o].id}
              data-swap={moved && DELAY[i] ? (o === null ? "drain" : "fill") : undefined}
              data-dim={hot !== null && (o === null || KINDS[o].id !== hot) || undefined}
              style={({background:o===null?"var(--ctx-empty)":moved&&DELAY[i]?(was[i]===null?"var(--ctx-empty)":`var(--k-${KINDS[was[i]!].id})`):`var(--k-${KINDS[o].id})`,...(DELAY[i]?{
                transitionDelay: `${DELAY[i]}ms`,
                animationDelay: `${DELAY[i]}ms`,
                "--was": was[i] === null ? "var(--ctx-empty)" : `var(--k-${KINDS[was[i]!].id})`,
                "--now": o === null ? "var(--ctx-empty)" : `var(--k-${KINDS[o].id})`,
              }:{})} as React.CSSProperties)}
              onPointerEnter={() => setHot(o === null ? null : KINDS[o].id)}
            />
          ))}
        </div>
      )}
      <div className="ctx-chips" onPointerLeave={() => setHot(null)}>
        {ORDER.map((ci) => KINDS[ci]).map((c) => (
          <button
            key={c.id}
            type="button"
            className="ctx-chip"
            data-on={hot === c.id || undefined}
            onPointerEnter={()=>{interrupt();setHot(c.id)}}
            onFocus={() => setHot(c.id)}
            onBlur={() => setHot(null)}
          >
            <i className="ctx-swatch" data-kind={c.id} style={{background:`var(--k-${c.id})`}} />
            <span className="ctx-chip-name">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
