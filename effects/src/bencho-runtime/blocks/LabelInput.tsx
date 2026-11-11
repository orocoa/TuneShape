import {useBench} from '../context';
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";


/* ══ Label input ══════════════════════════════════════════
   A field whose label is its placeholder until you are in it.
   On focus the label lifts into the top edge with a small hop
   running along its letters, the outline darkens in place, and
   the top line parts under the label from its middle outward.

   ── ONE THING MOVES ─────────────────────────────────────
   It used to DRAW its outline out of the notch, both ways
   round the field — and that was the field performing, which
   is too much for a thing you focus forty times a day. Now the
   outline is always whole; focus only changes its ink and
   opens the gap. The label is the event, and the line makes
   room for it.

   The gap is two short paths across the notch, each from the
   middle to one side, retracted from the middle outward by a
   negative dash offset. */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const W = 280;
const H = 52;
/* the lifted label's size, against its resting one */
const S = 0.78;
/* the stroke sits half a stroke inside the box so none of it
   is clipped by the svg's own edge */
const IN = 0.75;

export function LabelInput({
  field = "Email",
  /* the field's corner, px — at half the height it is a pill */
  corner = 20,
  /* a showcase, not a form: on a touch screen, keep the device's
     keyboard down. Off by default — a real field wants its
     keyboard — and the bench turns it on for its feed */
  showcase = false,
}: {
  field?: string;
  corner?: number;
  showcase?: boolean;
} = {}) {
  const bench=useBench();
  const r = clamp(corner, 0, H / 2);
  const secret = field === "Password";
  const label = bench.settings.fieldLabel;
  const id = `lbi-${useId().replace(/:/g, "")}`;

  const [focused, setFocused] = useState(false);
  const [demoFocus, setDemoFocus] = useState(false);
  const focus = focused || demoFocus;
  const [quiet] = useState(() => showcase && typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [flip, setFlip] = useState(0);
  const input = useRef<HTMLInputElement | null>(null);

  /* the notch is the label's own width, so it is measured */
  const lab = useRef<HTMLLabelElement | null>(null);
  const [lw, setLw] = useState(40);
  useLayoutEffect(() => {
    if (lab.current) setLw(lab.current.offsetWidth);
  }, [label]);

  /* a different kind of field starts empty — an email left in
     a password box would be shown in the clear */
  useEffect(() => {
    setValue("");
    setShow(false);
  }, [field]);

  const up = focus || value.length > 0;

  /* ── where the label sits, and the gap it leaves ─────────
     Never inside the corner's curve: the notch has to open on
     the straight part of the top edge, so a rounder field
     starts its label further in. */
  const lx = Math.max(14, r + 4);
  const x0 = Math.max(r * 0.6, lx - 5);
  const x1 = lx + lw * S + 5;
  const a = r - IN;
  const R = W - IN;
  const B = H - IN;
  const mid = W / 2;
  /* the gap, as two halves from its middle to each side */
  const nm = (x0 + x1) / 2;
  const gapL = `M${nm},${IN} L${x0},${IN}`;
  const gapR = `M${nm},${IN} L${x1},${IN}`;
  /* right: from the notch, clockwise, to the bottom middle */
  const right = r > 0
    ? `M${x1},${IN} L${W - r},${IN} A${a},${a} 0 0 1 ${R},${r} L${R},${H - r} A${a},${a} 0 0 1 ${W - r},${B} L${mid},${B}`
    : `M${x1},${IN} L${R},${IN} L${R},${B} L${mid},${B}`;
  /* left: from the notch, the other way round, to the same point */
  const left = r > 0
    ? `M${x0},${IN} L${r},${IN} A${a},${a} 0 0 0 ${IN},${r} L${IN},${H - r} A${a},${a} 0 0 0 ${r},${B} L${mid},${B}`
    : `M${x0},${IN} L${IN},${IN} L${IN},${B} L${mid},${B}`;

  const reveal = () => {
    bench.clock.activity(260);
    setShow((s) => !s);
    setFlip((f) => f + 1);
  };

  const settle = () => {
    setDemoFocus(false);
    setFocused(document.activeElement === input.current);
  };
  bench.actions={
    demonstrate:()=>{
      // A showcase must not override the label state of a real input.
      if (document.activeElement === input.current || value.length > 0) return;
      setDemoFocus(f=>!f);
      bench.clock.activity(700);
    },
    settle,getState:()=>({focus,filled:!!value,show}),
  };
  return (
    <div className="lbi" data-up={up} data-focus={focus} data-filled={value.length > 0}>
      <div
        className="lbi-box"
        style={{ width: W, height: H, borderRadius: r, "--lbi-x": `${lx}px` } as React.CSSProperties}
      >
        <svg className="lbi-ring" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <path d={right} />
          <path d={left} />
          <path className="lbi-gap" d={gapL} pathLength={1} />
          <path className="lbi-gap" d={gapR} pathLength={1} />
        </svg>

        <label className="lbi-label" htmlFor={id} ref={lab}>
          {[...label].map((ch, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>{ch}</span>
          ))}
        </label>

        <input
          ref={input}
          id={id}
          className="lbi-field"
          data-transient-value="true"
          data-flip={flip % 2}
          /* ── no autofill, when it is only being shown ───────
             An email or password box is an invitation: the browser
             drops its saved addresses under it, a password manager
             pins its badge in it, the phone offers a contact. On
             the bench it is a preview, not a form, so it is a plain
             text field — a hidden password masked by the font
             rather than by the type — named so Safari takes it for
             a search, and marked off for the managers that read
             their own attribute. A real use keeps the real types. */
          type={showcase ? "text" : secret && !show ? "password" : secret ? "text" : "email"}
          name={showcase ? "search-preview" : undefined}
          data-1p-ignore={showcase || undefined}
          data-lpignore={showcase ? "true" : undefined}
          data-bwignore={showcase || undefined}
          data-form-type={showcase ? "other" : undefined}
          autoCorrect="off"
          autoCapitalize="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={e=>{setFocused(true);setDemoFocus(false);bench.clock.activity(700);bench.cue('wisp',e.nativeEvent)}}
          onBlur={() => {setFocused(false);setDemoFocus(false)}}
          autoComplete="off"
          spellCheck={false}
          /* ── no keyboard, when it is only being shown ─────
             In a feed you are scrolling on a phone, a tap that
             lands on the field threw the keyboard up over the
             page. inputMode "none" keeps everything the block is
             about — the focus, the label lifting, the gap
             opening — and only tells the device not to raise its
             keyboard. A mouse and a hardware keyboard are
             untouched, and so is any real use of this field. */
          inputMode={quiet ? "none" : undefined}
          style={{
            paddingRight: secret ? 48 : lx,
            ...(showcase && secret && !show ? { WebkitTextSecurity: "disc" } : {}),
          } as React.CSSProperties}
        />

        {secret && (
          <button
            className="lbi-eye"
            type="button"
            data-show={show}
            /* keep focus in the field: the eye is a toggle on
               what you are typing, not somewhere to go */
            onPointerDown={(e) => e.preventDefault()}
            onClick={e=>{reveal();bench.cue('hush',e.nativeEvent)}}
            aria-label={show ? "Hide password" : "Show password"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 3l18 18M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
