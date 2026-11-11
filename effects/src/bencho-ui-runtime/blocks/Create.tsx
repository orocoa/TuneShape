// Adapted from Lorenzo Cabra / Bencho, MIT, commit c65992417427bb09e661674ffa800bef29adef49.
import {useUiBench} from "../context";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "../motion";
import { FileText, Folder, Grid2x2, Plus, Table2 } from "../icons";
const LIQUID = {
  type: "spring" as const,
  stiffness: 220,
  damping: 14,
  mass: 0.5,
};
const LIQUID_STILL = { ...LIQUID, stiffness: 420, damping: 30 };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const CRT_CORNER = 20;
const CRT_MAX = 40;
export function Create({ corner = CRT_CORNER }: { corner?: number } = {}) {
  const bench=useUiBench(),clock=bench.clock;


  const ICONS={file:FileText,table:Table2,grid:Grid2x2,folder:Folder},ITEMS=bench.settings.menuItems.map(item=>({...item,icon:ICONS[item.icon]})),panelH=22+ITEMS.length*36;
  const [open, setOpen] = useState(false);
  const [sink, setSink] = useState(false);
  const panel = useRef<HTMLDivElement | null>(null);
  const say = useRef<HTMLSpanElement | null>(null);
  const beat = useRef(0),demo=useRef(0),manualOpen=useRef(false),selected=useRef<string|null>(null);
  const [sayW, setSayW] = useState(96);
  useLayoutEffect(() => {
    const el = say.current;
    if (!el) return;
    let live = true;
    const measure = () => { if (live) setSayW(el.offsetWidth + 1); };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    return () => { live = false; };
  }, [bench.settings.createLabel]);
  useEffect(() => () => {
    clock.clearInterval(beat.current);
  }, []);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!e.isTrusted) return;
      const box = panel.current
        ?.querySelector(".crt-panel")
        ?.getBoundingClientRect();
      const on =
        !!box &&
        e.clientX >= box.left && e.clientX <= box.right &&
        e.clientY >= box.top && e.clientY <= box.bottom;
      if (!on) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  const press = () => {
    if(bench.runtime.reduced){setOpen(true);return}
    setSink(true);
    clock.clearInterval(beat.current);
    beat.current = clock.setTimeout(() => {
      setSink(false);
      setOpen(true);
    }, 60);
  };
  const interrupt=()=>{clock.clearInterval(demo.current);demo.current=0};
  const shut=(focus=false)=>{clock.clearInterval(beat.current);setOpen(false);setSink(false);if(focus)panel.current?.querySelector<HTMLButtonElement>('.crt-pill')?.focus({preventScroll:true})};
  bench.actions={demonstrate(){manualOpen.current=false;press();demo.current=clock.setTimeout(()=>shut(),1350);bench.activity(1800)},settle(){interrupt();shut()},interrupt,getState:()=>({open,sink,selected:selected.current})};
  useEffect(()=>{if(open&&manualOpen.current){const timer=clock.setTimeout(()=>panel.current?.querySelector<HTMLButtonElement>('.crt-item button')?.focus({preventScroll:true}),80);return()=>clock.clearInterval(timer)}},[open]);
  const pillW = 18 + 8 + sayW + 34;
  const panelR = clamp(corner, 0, CRT_MAX);
  const shutR = Math.min(19, panelR * (19 / CRT_CORNER));
  return (
    <motion.div
      className="crt-stage"
      onKeyDown={(e:React.KeyboardEvent<HTMLElement>)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();shut(true)}else if(open&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const items=[...panel.current!.querySelectorAll<HTMLButtonElement>('.crt-item button')],at=items.indexOf(document.activeElement as HTMLButtonElement),next=e.key==='Home'?0:e.key==='End'?items.length-1:(at+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next]?.focus()}}}
      data-open={open || undefined}
      data-sink={sink || undefined}
      ref={panel}
      style={{
        "--pill-w": `${pillW}px`,"--panel-h":`${panelH}px`,
        "--crt-r": `${clamp(corner, 0, CRT_MAX)}px`,
        "--crt-shut-r": `${Math.min(19, clamp(corner, 0, CRT_MAX) * (19 / CRT_CORNER)).toFixed(2)}px`,
        "--crt-row-r": `${Math.min(17, Math.max(0, clamp(corner, 0, CRT_MAX) - 10)).toFixed(2)}px`,
      } as React.CSSProperties}
    >
      <div className="crt-blobs" aria-hidden="true">
        {}
        <motion.div
          className="crt-body"
          animate={{
            width: open ? 212 : pillW,
            height: open ? panelH : 38,
            borderRadius: open ? panelR : shutR,
          }}
          transition={LIQUID_STILL}
        />
      </div>
      <button className="crt-pill" onClick={e=>{manualOpen.current=true;bench.cue('bump',e.nativeEvent);press()}} aria-haspopup="menu" aria-expanded={open}>
        <span className="crt-glyph" aria-hidden="true">
          <Plus size={16} strokeWidth={2} />
        </span>
        <span className="crt-say" style={{ width: sayW || undefined }}>
          <span ref={say}>{bench.settings.createLabel}</span>
        </span>
      </button>
      <div className="crt-panel" inert={!open} aria-hidden={!open}>
        {}
        <ul className="crt-menu" role="menu">
          {ITEMS.map((it, i) => (
            <li
              className="crt-item"
              key={it.id}
              style={{ transitionDelay: open ? `${30 + i * 22}ms` : "0ms" }}
            >
              <button
                role="menuitem" onClick={e=>{selected.current=it.id;bench.cue('tick',e.nativeEvent);shut(true)}}
              >
                <it.icon size={16} strokeWidth={2} />
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
