import {useCallback, useContext, useLayoutEffect, useRef, useState} from 'react';
import type {KeyboardEvent} from 'react';
import {animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform} from 'motion/react';
import {motionEasing} from './easing';
import {useLanguage} from './i18n';
import {
  clampOrbProgress, defaultMonochromeOrb, monochromeOrbDash, monochromeOrbGeometry,
  monochromeOrbReading, monochromeOrbSpring, monochromeOrbVisibility,
} from './monochrome-scroll-orb';
import {ScrollPreviewPane} from './scroll-preview-pane';
import type {HistoryPreviewProps} from './preview-types';
import {usePreviewClock} from './useDetailPlayback';
import type {PlaybackControl} from './useDetailPlayback';
import './monochrome-scroll-orb.css';

const {size, innerDiameter, trackRadius, trackWidth, arcWidth} = monochromeOrbGeometry;
const center = size / 2;
const sections = [
  ['Monochrome Scroll Orb', 'Scroll inside this reading pane to see your progress.',
   '单色滚动球', '在阅读区内滚动，查看当前阅读进度。'],
  ['Scroll down', 'The arc fills clockwise and the number tracks the same position.',
   '向下滚动', '圆弧顺时针填充，数字同步跟随阅读位置。'],
  ['Change direction', 'Scroll upward to rewind the ring as the number counts down.',
   '改变方向', '向上滚动时，圆弧和数字一起回退。'],
  ['Return to top', 'Click the orb, or focus it and press Enter or Space.',
   '返回顶部', '点按球体，或聚焦后按 Enter 或空格。'],
] as const;

export default function MonochromeScrollOrbPreview({
  config, speed, reduced, command, side, enabled = true, interactive = true, paused = false, thumbnail = false,
  onRunningChange,
}: HistoryPreviewProps) {
  const zh = useLanguage() === 'zh';
  const theme = config.monochromeScrollOrb?.theme ?? defaultMonochromeOrb.theme;
  const available = enabled && interactive;
  const pane = useRef<HTMLDivElement>(null);
  const initializePreview = useContext(ScrollPreviewPane);
  const article = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const lastCommand = useRef(0);
  const returning = useRef(false);
  const reading = useRef({percent: 0, visible: false});
  const demoRunning = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const report = useRef(onRunningChange);
  report.current = onRunningChange;
  const demoControls = useRef<PlaybackControl[]>([]);
  const {register, clear} = usePreviewClock(demoControls, speed, available, paused);
  const progress = useSpring(0, monochromeOrbSpring);
  const dash = useTransform(progress, monochromeOrbDash);
  const arcOpacity = useTransform(progress, value => value > 0 ? 1 : 0);
  const [number, setNumber] = useState(0);
  useMotionValueEvent(progress, 'change', value => setNumber(Math.round(clampOrbProgress(value))));

  const [visible, setVisible] = useState(false);
  const initialReveal = useRef(false);
  const [painted, setPainted] = useState(false);
  const opacity = useMotionValue(0);
  const show = available && visible;

  useLayoutEffect(() => {
    const viewport = pane.current!;
    let firstMeasurement = initializePreview?.(viewport) ?? false;
    let frame: number | undefined;
    const measure = () => {
      frame = undefined;
      if (viewport.scrollTop <= 0) returning.current = false;
      const previous = reading.current;
      const next = monochromeOrbReading(viewport.scrollTop, viewport.scrollHeight, viewport.clientHeight, previous.visible);
      reading.current = {...next, visible: available && next.visible};
      if (firstMeasurement) initialReveal.current = reading.current.visible;
      if (firstMeasurement || reduced) progress.jump(next.percent);
      else if (available && !(pausedRef.current && (initializePreview || demoRunning.current)) && previous.percent !== next.percent) {
        progress.set(next.percent);
      }
      firstMeasurement = false;
      if (previous.visible !== reading.current.visible) {
        if (!reading.current.visible && viewport.ownerDocument.activeElement === button.current) {
          viewport.focus({preventScroll: true});
        }
        setVisible(reading.current.visible);
      }
    };
    const schedule = () => { frame ??= requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    observer.observe(article.current!);
    viewport.addEventListener('scroll', schedule, {passive: true});
    measure();
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [available, initializePreview, progress, reduced]);

  useLayoutEffect(() => {
    if (paused || !available) progress.stop();
    else if (!reduced) progress.set(reading.current.percent);
  }, [available, paused, progress, reduced]);

  useLayoutEffect(() => {
    const target = Number(show);
    if ((initialReveal.current && show) || reduced || !available || opacity.get() === target) {
      if (show) initialReveal.current = false;
      opacity.jump(target);
      setPainted(show);
      return;
    }
    if (show) setPainted(true);
    const fade = animate(opacity, target, {
      duration: (show ? monochromeOrbVisibility.enterMs : monochromeOrbVisibility.exitMs) / 1000,
      ease: show ? 'easeOut' : 'easeIn',
      onComplete: () => { if (!show) setPainted(false); },
    });
    return () => fade.stop();
  }, [available, opacity, reduced, show]);

  const stopDemo = useCallback(() => {
    demoRunning.current = false;
    clear();
    report.current?.(side, false);
  }, [clear, side]);

  const cancelReturn = useCallback(() => {
    if (!returning.current) return;
    returning.current = false;
    const viewport = pane.current!;
    viewport.scrollTo({top: viewport.scrollTop, behavior: 'instant'});
  }, []);

  const takeOver = () => {
    stopDemo();
    cancelReturn();
  };

  useLayoutEffect(() => stopDemo, [stopDemo]);

  useLayoutEffect(() => {
    if (!available || reduced) stopDemo();
    if (!available) cancelReturn();
    else if (reduced && returning.current) {
      returning.current = false;
      pane.current!.scrollTo({top: 0, behavior: 'instant'});
    }
  }, [available, cancelReturn, reduced, stopDemo]);

  useLayoutEffect(() => {
    if (!available || !command.active || command.seq <= lastCommand.current) return;
    lastCommand.current = command.seq;
    const viewport = pane.current!;
    const top = viewport.scrollTop;
    const sample = Math.round((viewport.scrollHeight - viewport.clientHeight) * .65);
    stopDemo();
    cancelReturn();
    if (sample <= 0) return;
    if (reduced) {
      viewport.scrollTo({top: sample, behavior: 'instant'});
      return;
    }
    demoRunning.current = true;
    report.current?.(side, true);
    register(animate(top, [top, sample, 0], {
      duration: config.durationMs * 2 / 1000,
      delay: config.delayMs / 1000,
      ease: motionEasing(config.easing),
      onUpdate: position => { viewport.scrollTop = position; },
      onComplete: () => {
        demoRunning.current = false;
        report.current?.(side, false);
      },
    }));
  }, [available, cancelReturn, command.active, command.seq, config.delayMs, config.durationMs, config.easing, reduced, register, side, stopDemo]);

  const scrollWithKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.altKey) return;
    const viewport = event.currentTarget;
    const page = viewport.clientHeight * .9;
    const steps: Record<string, number> = {
      ArrowUp: -40, ArrowDown: 40, PageUp: -page, PageDown: page,
      ' ': event.shiftKey ? -page : page, Home: -viewport.scrollHeight, End: viewport.scrollHeight,
    };
    if (!Object.hasOwn(steps, event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    takeOver();
    viewport.scrollTo({top: viewport.scrollTop + steps[event.key], behavior: 'instant'});
  };

  const backToTop = () => {
    stopDemo();
    const viewport = pane.current!;
    returning.current = !reduced && viewport.scrollTop > 0;
    viewport.scrollTo({top: 0, behavior: reduced ? 'instant' : 'smooth'});
  };

  return (
    <div className="history-demo" data-history-preview={side} data-recipe="monochrome-scroll-orb" data-trigger="click" data-paused={paused}>
      <div className="history-canvas monochrome-orb-canvas" style={{height: thumbnail ? '100%' : 400}}>
        <div className="monochrome-orb-stage" data-theme={theme} data-reduced={reduced} inert={!available}
          onClick={event => event.stopPropagation()}>
          <div ref={pane} className="monochrome-orb-pane" tabIndex={0} role="region"
            aria-label={zh ? '单色滚动球演示阅读区' : 'Monochrome Scroll Orb reading area'}
            onWheel={takeOver} onPointerDown={takeOver} onKeyDown={scrollWithKey}>
            <article ref={article} className="monochrome-orb-content">
              {sections.map(([title, text, titleZh, textZh]) => (
                <section key={title}><h3>{zh ? titleZh : title}</h3><p>{zh ? textZh : text}</p></section>
              ))}
            </article>
            <div className="monochrome-orb-overlay">
              <motion.button ref={button} type="button" className="monochrome-orb"
                hidden={!show && (!painted || reduced || !available)} inert={!show} aria-hidden={!show}
                style={{opacity}}
                aria-label={zh ? `返回顶部，当前进度 ${number}%` : `Back to top, current progress ${number}%`}
                onClick={backToTop}>
                <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true" focusable="false">
                  <circle className="monochrome-orb-disc" cx={center} cy={center} r={innerDiameter / 2}/>
                  <circle className="monochrome-orb-track" cx={center} cy={center} r={trackRadius} strokeWidth={trackWidth} fill="none"/>
                  <g transform={`rotate(-90 ${center} ${center})`}>
                    <motion.circle className="monochrome-orb-arc" cx={center} cy={center} r={trackRadius}
                      strokeWidth={arcWidth} strokeLinecap="round" fill="none" strokeDasharray={dash} strokeOpacity={arcOpacity}/>
                  </g>
                </svg>
                <span className="monochrome-orb-number" aria-hidden="true">{number}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
