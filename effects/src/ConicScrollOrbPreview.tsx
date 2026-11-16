import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import type {KeyboardEvent} from 'react';
import {animate, motion, useMotionValueEvent, useSpring, useTransform} from 'motion/react';
import {motionEasing} from './easing';
import {useLanguage} from './i18n';
import type {HistoryPreviewProps} from './preview-types';
import {usePreviewClock} from './useDetailPlayback';
import type {PlaybackControl} from './useDetailPlayback';
import {
  clampConicProgress, conicOrbDemo, conicOrbGeometry, conicOrbReading, conicOrbSpring,
} from './conic-scroll-orb';
import './conic-scroll-orb.css';

const sections = [
  ['Conic Scroll Orb', 'Scroll this reading area to reveal the progress orb.',
    '环形渐变滚动球', '在阅读区内向下滚动，即可看到进度球。'],
  ['Track your progress', 'The ring and percentage follow the same reading position.',
    '查看进度', '圆环和百分比同步跟随阅读位置。'],
  ['Return to top', 'Click the orb, or focus it and press Enter or Space, to return to the top of this reading area.',
    '返回顶部', '点击球体，或聚焦后按 Enter 或空格，即可返回阅读区顶部。'],
  ['Keep reading', 'Scroll again at any time to take over.',
    '继续阅读', '返回顶部途中仍可随时手动滚动。'],
] as const;

const upwardKeys = new Set(['ArrowUp', 'PageUp', 'Home']);
const downwardKeys = new Set(['ArrowDown', 'PageDown', 'End']);

function readPane(viewport: HTMLElement) {
  return conicOrbReading(viewport.scrollTop, viewport.scrollHeight, viewport.clientHeight);
}

export default function ConicScrollOrbPreview({
  config, speed, reduced, command, side, enabled = true, interactive = true, paused = false,
  thumbnail = false, onRunningChange,
}: HistoryPreviewProps) {
  const zh = useLanguage() === 'zh';
  const available = enabled && interactive;
  const pane = useRef<HTMLDivElement>(null);
  const article = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const returning = useRef(false);
  const lastCommand = useRef(0);
  const controls = useRef<PlaybackControl[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const report = useRef(onRunningChange);
  report.current = onRunningChange;
  const {register, clear, forget} = usePreviewClock(controls, speed, available, paused);

  const actualProgress = useRef(0);
  const progress = useSpring(0, conicOrbSpring);
  const bounded = useTransform(progress, clampConicProgress);
  const ringProgress = useTransform(bounded, value => `${value}%`);
  const label = useTransform(bounded, value => `${Math.round(value)}%`);
  const orbStyle = {width: conicOrbGeometry.size, height: conicOrbGeometry.size, '--conic-orb-progress': ringProgress};
  const [labelText, setLabelText] = useState('0%');
  useMotionValueEvent(label, 'change', setLabelText);
  const [visible, setVisible] = useState(false);
  const show = available && visible;

  const stopDemo = useCallback(() => {
    if (!controls.current.length) return;
    clear();
    report.current?.(side, false);
  }, [clear, side]);

  const stopReturn = useCallback(() => {
    if (!returning.current) return;
    returning.current = false;
    const viewport = pane.current!;
    viewport.scrollTo({top: viewport.scrollTop, behavior: 'instant'});
  }, []);

  const takeOver = useCallback(() => {
    stopDemo();
    stopReturn();
  }, [stopDemo, stopReturn]);

  const measure = useCallback(() => {
    const viewport = pane.current;
    if (!viewport) return;
    const next = readPane(viewport);
    if (viewport.scrollTop <= 0) returning.current = false;
    if (!next.visible && viewport.ownerDocument.activeElement === button.current) {
      viewport.focus({preventScroll: true});
    }
    setVisible(next.visible);

    if (next.percent === actualProgress.current) return;
    actualProgress.current = next.percent;
    if (reduced) progress.jump(next.percent);
    else if (available && !(pausedRef.current && controls.current.length)) progress.set(next.percent);
  }, [available, progress, reduced]);

  useLayoutEffect(() => {
    const viewport = pane.current!;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(article.current!);
    viewport.addEventListener('scroll', measure, {passive: true});
    // Stop programmatic scrolling before the browser applies the wheel delta.
    viewport.addEventListener('wheel', takeOver, {passive: false});
    measure();
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', measure);
      viewport.removeEventListener('wheel', takeOver);
    };
  }, [measure, takeOver]);

  useLayoutEffect(() => () => clear(), [clear]);

  useLayoutEffect(() => {
    if (!available || reduced) stopDemo();
    if (!available) stopReturn();
    else if (reduced && returning.current) {
      returning.current = false;
      pane.current!.scrollTo({top: 0, behavior: 'instant'});
      measure();
    }
  }, [available, measure, reduced, stopDemo, stopReturn]);

  useLayoutEffect(() => {
    if (reduced) progress.jump(actualProgress.current);
    else if (!available || paused) progress.jump(progress.get());
    else progress.set(actualProgress.current);
  }, [available, paused, progress, reduced]);

  useLayoutEffect(() => {
    if (!available || !command.active || command.seq <= lastCommand.current) return;
    lastCommand.current = command.seq;
    takeOver();
    const viewport = pane.current!;
    const {distance} = readPane(viewport);
    const sample = Math.round(conicOrbDemo.fraction * distance);
    if (sample <= 0 || reduced) {
      if (sample > 0) {
        viewport.scrollTo({top: sample, behavior: 'instant'});
        measure();
      }
      report.current?.(side, false);
      return;
    }

    const start = viewport.scrollTop;
    report.current?.(side, true);
    const animation = register(animate(start, [start, sample, 0], {
      duration: config.durationMs * 2 / 1000,
      delay: config.delayMs / 1000,
      ease: motionEasing(config.easing),
      onUpdate: top => {
        if (pausedRef.current || pane.current !== viewport) return;
        viewport.scrollTop = top;
        measure();
      },
      onComplete: () => {
        forget(animation);
        report.current?.(side, false);
      },
    }));
  }, [available, command.active, command.seq, config.delayMs, config.durationMs, config.easing,
    forget, measure, reduced, register, side, takeOver]);

  const onPaneKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const pageWithSpace = event.key === ' ' && event.target === event.currentTarget;
    const up = upwardKeys.has(event.key) || (pageWithSpace && event.shiftKey);
    const down = downwardKeys.has(event.key) || (pageWithSpace && !event.shiftKey);
    if (!up && !down) return;
    event.stopPropagation();
    takeOver();
    const viewport = event.currentTarget;
    const {distance} = readPane(viewport);
    if ((up && viewport.scrollTop <= 0) || (down && viewport.scrollTop >= distance - 1)) {
      event.preventDefault();
    }
  };

  const backToTop = () => {
    const viewport = pane.current!;
    takeOver();
    returning.current = !reduced && viewport.scrollTop > 0;
    viewport.scrollTo({top: 0, behavior: reduced ? 'instant' : 'smooth'});
    if (reduced) measure();
  };

  const action = zh ? '返回顶部' : 'Back to top';

  return (
    <div className="history-demo" data-history-preview={side} data-recipe="conic-scroll-orb" data-trigger="click" data-paused={paused}>
      <div className="history-canvas conic-orb-canvas" style={{height: thumbnail ? '100%' : 400}}>
        <div className="conic-orb-stage" inert={!available} data-reduced={reduced} onClick={event => event.stopPropagation()}>
          <div ref={pane} className="conic-orb-pane" tabIndex={0} role="region"
            aria-label={zh ? '环形渐变滚动球演示阅读区' : 'Conic Scroll Orb reading area'}
            onPointerDown={takeOver} onKeyDown={onPaneKey}>
            <article ref={article} className="conic-orb-content">
              {sections.map(([title, text, titleZh, textZh]) => (
                <section key={title}><h3>{zh ? titleZh : title}</h3><p>{zh ? textZh : text}</p></section>
              ))}
            </article>
            <div className="conic-orb-overlay">
              <motion.button ref={button} type="button" className="conic-scroll-orb" data-visible={show}
                inert={!show} aria-hidden={!show} title={action}
                style={orbStyle}
                aria-label={zh ? `${action}，当前进度 ${labelText}` : `${action}, current progress ${labelText}`}
                onClick={backToTop}>
                <motion.span className="conic-orb-number" aria-hidden="true">{label}</motion.span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
