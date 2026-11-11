// Adapted from Lorenzo Cabra / Bencho, MIT, commit c65992417427bb09e661674ffa800bef29adef49.
import {useUiBench} from "../context";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "../motion";
import { Check, Upload as UpIcon } from "../icons";
const SNARK = [
  "The file is still too large.",
  "Pushing harder won't help",
  "Have you tried compressing it?",
  "The box is full of excuses now",
  "No.",
];
type F = { id: string; name: string; ext: string; size: number; tint: string };
const fmt = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
function Page({ f, size = 40 }: { f: F; size?: number }) {
  return (
    <svg className="upl-page" width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        className="upl-page-line"
        d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z"
      />
      <path className="upl-page-line" d="M27 .5V8a4 4 0 0 0 4 4h7.5" />
      <rect width="29" height="16" x="1" y="18" rx="8" fill={f.tint} />
      {}
      <text x="15.5" y="29.1" textAnchor="middle" fontSize="9" className="upl-page-ext">{f.ext}</text>
    </svg>
  );
}
function Roll({ value }: { value: number }) {
  const s = String(Math.round(value));
  return (
    <span className="upl-roll" aria-label={`${s}%`}>
      {s.split("").map((d, i) => (
        <span key={s.length - i} className="upl-roll-col">
          <span className="upl-roll-strip" style={{ transform: `translateY(${-Number(d)}em)` }}>
            {"0123456789".split("").map((n) => <span key={n}>{n}</span>)}
          </span>
        </span>
      ))}
      %
    </span>
  );
}
type Phase = { kind: "idle" } | { kind: "up"; f: F; p: number } | { kind: "done"; f: F };
export function Upload({
  speed = 50,
  bounce = 40,
  corner = 20,
}: {
  speed?: number;
  bounce?: number;
  corner?: number;
} = {}) {
  const bench=useUiBench(),clock=bench.clock;
  const requestAnimationFrame=clock.request,cancelAnimationFrame=clock.cancel,clearTimeout=clock.clearInterval;

  const still = bench.runtime.reduced,MAX=bench.settings.maxMb,FILES=bench.settings.files;
  const fileInput=useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [inBox, setInBox] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [refuse, setRefuse] = useState<string | null>(null);
  const tries = useRef(0);
  const cool = useRef(0);
  const [gulp, setGulp] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  const now = useRef<HTMLSpanElement>(null);
  const tiles = useRef<Record<string, HTMLDivElement | null>>({});
  const shake = useAnimationControls();
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const knobs = useRef({ speed });
  knobs.current = { speed };
  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    timers.current.forEach(clearTimeout);
    clearTimeout(cool.current);
  }, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(clock.setTimeout(fn, ms)); };
  const send = (f: F) => {
    setInBox(f.id);
    if (still) { finish(f); return; }
    setPhase({ kind: "up", f, p: 0 });
    let p = 0;
    let prev = 0;
    const secs = (4 - (clamp(knobs.current.speed, 0, 100) / 100) * 3.2) * (0.7 + Math.min(1, f.size / 5e6) * 0.6);
    const tick = (t: number) => {
      const dt = prev ? Math.min(0.05, (t - prev) / 1000) : 0;
      prev = t;
      p = Math.min(1, p + (dt / secs) * (0.4 + Math.random() * 1.2));
      if (p >= 1) { raf.current = 0; finish(f); return; }
      setPhase({ kind: "up", f, p });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const finish = (f: F) => {
    tries.current = 0;
    setPhase({ kind: "done", f });bench.activity(1600);
    later(() => { setPhase({ kind: "idle" }); setInBox(null); }, 1500);
  };
  const refuseIt = () => {
    bench.activity(1900);
    const n = tries.current++;
    setRefuse(n === 0 ? `Too big — up to ${MAX} MB` : SNARK[Math.min(n - 1, SNARK.length - 1)]);
    shake.start({ x: [0, -7, 6, -4, 2, 0], transition: { duration: 0.42 } });
    later(() => setRefuse(null), 1800);
    clearTimeout(cool.current);
    cool.current = clock.setTimeout(() => { tries.current = 0; }, 8000);
  };
  const drag = useRef<null | { id: string; x0: number; y0: number; k: number }>(null);
  const place = (id: string, dx: number, dy: number, lift: boolean) => {
    const el = tiles.current[id];
    if (!el) return;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${lift ? 1.08 : 1}) rotate(${lift ? clamp(dx * 0.04, -6, 6) : 0}deg)`;
  };
  const hits = (e: React.PointerEvent) => {
    const r = zone.current?.getBoundingClientRect();
    return !!r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
  };
  const onDown = (f: F) => (e: React.PointerEvent<HTMLDivElement>) => {
    bench.cue('glide',e.nativeEvent);
    if (inBox === f.id) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {  }
    const k = e.currentTarget.getBoundingClientRect().width / e.currentTarget.offsetWidth || 1;
    drag.current = { id: f.id, x0: e.clientX, y0: e.clientY, k };
    setHeld(f.id);
    place(f.id, 0, 0, true);
  };
  const onMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g) return;
    place(g.id, (e.clientX - g.x0) / g.k, (e.clientY - g.y0) / g.k, true);
    const on = hits(e) && phase.kind === "idle";
    if (on !== over) {
      setOver(on);
    }
  };
  const onUp = (f: F) => (e: React.PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    drag.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {  }
    setHeld(null);
    setOver(false);
    if (!g) return;
    const inside = hits(e);
    if (inside && phase.kind === "idle") {
      if (f.size > MAX * 1e6) refuseIt();
      else {
        suck(f, (e.clientX - g.x0) / g.k, (e.clientY - g.y0) / g.k, g.k);
        return;
      }
    }
    place(f.id, 0, 0, false);
  };
  const onCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    drag.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { }
    setHeld(null);
    setOver(false);
    if (g) place(g.id, 0, 0, false);
  };
  const suck = (f: F, dx: number, dy: number, k: number) => {
    const el = tiles.current[f.id];
    const z = zone.current;
    if (!el || !z || still) { place(f.id, 0, 0, false); send(f); return; }
    const a = el.getBoundingClientRect();
    const b = z.getBoundingClientRect();
    const tx = dx + (b.left + b.width / 2 - (a.left + a.width / 2)) / k;
    const ty = dy + (b.top + b.height / 2 - (a.top + a.height / 2)) / k;
    const ux = Math.abs(tx - dx);
    const uy = Math.abs(ty - dy);
    const squeeze = Math.hypot(ux, uy) < 24 ? "scale(0.16)" : uy >= ux ? "scale(0.14, 0.34)" : "scale(0.34, 0.14)";
    el.style.transition = "transform 380ms cubic-bezier(0.55, 0, 0.85, 0.3), opacity 300ms ease-in 80ms";
    el.style.transform = `translate(${tx}px, ${ty}px) ${squeeze}`;
    el.style.opacity = "0";
    later(() => { setGulp(true); later(() => setGulp(false), 460); }, 200);
    later(() => send(f), 220);
    later(() => {
      el.style.transition = "none";
      el.style.transform = "";
      el.style.opacity = "";
    }, 390);
  };
  useLayoutEffect(() => {
    const z = zone.current;
    const n = now.current;
    if (!z) return;
    if (phase.kind === "idle" || !n) {
      z.style.width = "";
      z.style.height = "";
      return;
    }
    z.style.width = `${n.offsetWidth + 32}px`;
    z.style.height = `${n.offsetHeight + 28}px`;
  }, [phase.kind]);
  const clearTimers=()=>{timers.current.forEach(clock.clearInterval);timers.current=[];clock.clearInterval(cool.current)};
  const settle=()=>{clearTimers();cancelAnimationFrame(raf.current);raf.current=0;drag.current=null;setHeld(null);setOver(false);setRefuse(null);setInBox(null);setGulp(false);setPhase({kind:"idle"});for(const id of Object.keys(tiles.current)){const el=tiles.current[id];if(el){el.style.transition="";el.style.opacity="";el.style.transform=""}}};
  const accept=(file:File)=>{if(!bench.runtime.enabled||bench.runtime.paused||document.hidden)return;if(file.size>MAX*1e6){refuseIt();return}settle();bench.runtime.onFile?.(file);send({id:'local-file',name:file.name.slice(0,120),ext:(file.name.split('.').at(-1)||'FILE').slice(0,4).toUpperCase(),size:file.size,tint:'#079455'})};
  // Hover, focus and replay requests must never submit a sample file.
  bench.actions={demonstrate(){},settle,cancel(){if(drag.current)place(drag.current.id,0,0,false);drag.current=null;setHeld(null);setOver(false)},getState:()=>({phase:phase.kind,progress:phase.kind==='up'?phase.p:phase.kind==='done'?1:0,held,refuse,file:phase.kind==='idle'?null:phase.f.name})};
  const r = Math.max(0, corner);
  const up = phase.kind !== "idle";
  const f = phase.kind !== "idle" ? phase.f : null;
  return (
    <div
      className="upl"
      data-phase={phase.kind} data-progress={phase.kind==='up'?phase.p:phase.kind==='done'?1:0}
      onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();settle()}}}
      data-held={held ? true : undefined}
      style={{ "--upl-r": `${r}px`, "--upl-spring": `cubic-bezier(0.3, ${1 + (bounce / 100) * 0.9}, 0.4, 1)` } as React.CSSProperties}
    >
      <motion.div animate={shake} className="upl-zone-wrap">
        <div
          ref={zone}
          className="upl-zone"
          role="button" tabIndex={0} aria-label={bench.settings.uploadLabel+'; choose a file'}
          onClick={()=>{if(phase.kind==='idle')fileInput.current?.click()}}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(phase.kind==='idle')fileInput.current?.click()}}}
          onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)}
          onDrop={e=>{e.preventDefault();setOver(false);const file=e.dataTransfer.files[0];if(file)accept(file)}}
          data-over={over || undefined}
          data-refuse={refuse ? true : undefined}
          data-busy={up || undefined}
          data-gulp={gulp || undefined}
          aria-live="polite"
        >
          {!f ? (
            <>
              <span className="upl-icon"><UpIcon size={18} strokeWidth={2} /></span>
              <span className="upl-say">
                <b>{refuse ?? (over ? "Drop to upload" : bench.settings.uploadLabel)}</b>
                <span>Up to {MAX} MB</span>
              </span>
            </>
          ) : (
            <span className="upl-now" key={f.id} ref={now}>
              <Page f={f} size={36} />
              <span className="upl-text">
                <span className="upl-name">{f.name}</span>
                <span className="upl-meta">
                  {fmt(f.size)} · {phase.kind === "done" ? "Ready" : <Roll value={phase.kind === "up" ? phase.p * 100 : 0} />}
                </span>
                <span className="upl-track">
                  <span className="upl-bar" style={{ transform: `scaleX(${phase.kind === "up" ? phase.p : 1})` }} />
                </span>
              </span>
              {}
              <span className="upl-end">
                {phase.kind === "done" && <span className="upl-tick"><Check size={14} strokeWidth={2} /></span>}
              </span>
            </span>
          )}
        </div>
      </motion.div>
      <input ref={fileInput} type="file" aria-label="Choose a local file" hidden onChange={e=>{const f=e.target.files?.[0];if(f)accept(f);e.target.value=''}}/>
      <div className="upl-tray">
        {FILES.map((file) => (
          <div key={file.id} className="upl-slot" data-empty={inBox === file.id || undefined}>
            <div
              ref={(el) => { tiles.current[file.id] = el; }}
              className="upl-file"
              data-held={held === file.id || undefined}
              data-gone={inBox === file.id || undefined}
              role="button"
              tabIndex={0}
              aria-label={`${file.name}, ${fmt(file.size)}. Drag into the box to upload, or press Enter.`}
              onPointerDown={onDown(file)}
              onPointerMove={onMove}
              onPointerUp={onUp(file)}
              onPointerCancel={onCancel}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && phase.kind === "idle" && inBox !== file.id) {
                  e.preventDefault();
                  if (file.size > MAX * 1e6) refuseIt();
                  else send(file);bench.cue('tick',e.nativeEvent);
                }
              }}
            >
              <Page f={file} />
              <span className="upl-label">{file.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
