import {useCallback, useContext, useLayoutEffect, useRef, useState} from 'react';
import type {KeyboardEvent, PointerEvent} from 'react';
import {animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform} from 'motion/react';
import {motionEasing} from './easing';
import {useLanguage} from './i18n';
import {ScrollPreviewPane} from './scroll-preview-pane';
import type {HistoryPreviewProps} from './preview-types';
import {usePreviewClock} from './useDetailPlayback';
import type {PlaybackControl} from './useDetailPlayback';
import {
  clampGaugeProgress, defaultVerticalGauge, gaugeKeyProgress, gaugeTrackPosition,
  verticalGaugeDemo, verticalGaugeSpringFor,
} from './vertical-scroll-gauge';
import './vertical-scroll-gauge.css';

const sections = [
  ['Vertical Scroll Gauge', 'Scroll this reading area to move the gauge.', '竖向滚动刻度', '在阅读区内滚动，查看刻度上的阅读进度。'],
  ['Use the gauge', 'Click the track to scroll smoothly, or drag to follow the pointer.', '操作刻度', '单击刻度可平滑滚到对应位置，拖动时即时跟手。'],
  ['Use the keyboard', 'Tab to the gauge and use the arrow keys or Page Up and Page Down.', '使用键盘', '按 Tab 聚焦刻度，然后使用方向键或 Page Up、Page Down。'],
  ['End of the reading area', 'Home and End jump to the start and end of the article.', '阅读区末尾', '按 Home 或 End 跳到文章的开头或末尾。'],
] as const;

function scrollTravel(viewport: HTMLElement) {
  return viewport.scrollHeight - viewport.clientHeight;
}

export default function VerticalScrollGaugePreview({
  config, speed, reduced, command, side, enabled = true, interactive = true, paused = false,
  thumbnail = false, onRunningChange,
}: HistoryPreviewProps) {
  const zh = useLanguage() === 'zh';
  const direction = config.verticalScrollGauge?.direction ?? defaultVerticalGauge.direction;
  const available = enabled && interactive;
  const pane = useRef<HTMLDivElement>(null);
  const initializePreview = useContext(ScrollPreviewPane);
  const article = useRef<HTMLElement>(null);
  const track = useRef<HTMLSpanElement>(null);
  const capture = useRef<{dragging: boolean; stop: () => void; dispose: () => void} | null>(null);
  const seekTarget = useRef<number | null>(null);
  const lastCommand = useRef(0);
  const controls = useRef<PlaybackControl[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const report = useRef(onRunningChange);
  report.current = onRunningChange;
  const {register, clear, forget} = usePreviewClock(controls, speed, available, paused);
  const progress = useMotionValue(0);
  const spring = verticalGaugeSpringFor(config.verticalScrollGauge);
  const smooth = useSpring(0, spring);
  const [dragging, setDragging] = useState(false);
  const [percent, setPercent] = useState(0);
  const displayed = reduced || dragging ? progress : smooth;
  const fill = useTransform(displayed, value => `${clampGaugeProgress(value) * 100}%`);
  const label = useTransform(displayed, value => `${gaugeTrackPosition(value, direction) * 100}%`);
  useMotionValueEvent(progress, 'change', value => setPercent(Math.round(value * 100)));

  const measure = useCallback((initializing = false) => {
    const viewport = pane.current!;
    if (seekTarget.current !== null && Math.abs(seekTarget.current - viewport.scrollTop) <= 1) {
      seekTarget.current = null;
    }
    const travel = scrollTravel(viewport);
    const next = travel > 0 ? clampGaugeProgress(viewport.scrollTop / travel) : 0;
    if (next === progress.get()) return;
    progress.set(next);
    if (initializing || reduced || capture.current?.dragging) smooth.jump(next);
    else if (!pausedRef.current || !(initializePreview || controls.current.length)) smooth.set(next);
  }, [initializePreview, progress, reduced, smooth]);

  const stopDemo = useCallback(() => {
    if (!controls.current.length) return;
    clear();
    report.current?.(side, false);
  }, [clear, side]);

  const stopSeek = useCallback(() => {
    if (seekTarget.current === null) return;
    seekTarget.current = null;
    const viewport = pane.current!;
    viewport.scrollTo({top: viewport.scrollTop, behavior: 'instant'});
  }, []);

  const takeOver = useCallback(() => {
    stopDemo();
    stopSeek();
  }, [stopDemo, stopSeek]);

  useLayoutEffect(() => {
    const viewport = pane.current!;
    const sync = () => measure();
    viewport.addEventListener('scroll', sync, {passive: true});
    // Stop programmatic scrolling before the browser applies the first wheel delta.
    viewport.addEventListener('wheel', takeOver, {passive: false});
    const observer = new ResizeObserver(sync);
    observer.observe(viewport);
    observer.observe(article.current!);
    measure(initializePreview?.(viewport));
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', sync);
      viewport.removeEventListener('wheel', takeOver);
    };
  }, [initializePreview, measure, takeOver]);

  useLayoutEffect(() => {
    if (reduced) smooth.jump(progress.get());
    else if (paused || !available) smooth.jump(smooth.get());
    else smooth.set(progress.get());
  }, [available, paused, progress, reduced, smooth, spring.damping]);

  useLayoutEffect(() => () => {
    capture.current?.dispose();
    clear();
  }, [clear]);

  useLayoutEffect(() => {
    if (!available || reduced) stopDemo();
    if (!available) capture.current?.stop();
    if (!available) stopSeek();
  }, [available, reduced, stopDemo, stopSeek]);

  useLayoutEffect(() => {
    if (!available || !command.active || command.seq <= lastCommand.current) return;
    lastCommand.current = command.seq;
    takeOver();
    capture.current?.stop();
    const viewport = pane.current!;
    const top = viewport.scrollTop;
    const sample = Math.round(scrollTravel(viewport) * verticalGaugeDemo.fraction);
    if (sample <= 0 || reduced) {
      if (sample > 0) {
        viewport.scrollTo({top: sample, behavior: 'instant'});
        measure();
      }
      report.current?.(side, false);
      return;
    }
    report.current?.(side, true);
    const animation = register(animate(top, [top, sample, 0], {
      duration: config.durationMs * 2 / 1000,
      delay: config.delayMs / 1000,
      ease: motionEasing(config.easing),
      onUpdate: position => {
        if (pausedRef.current) return;
        viewport.scrollTop = position;
        measure();
      },
      onComplete: () => {
        forget(animation);
        report.current?.(side, false);
      },
    }));
  }, [available, command.active, command.seq, config.delayMs, config.durationMs, config.easing,
    forget, measure, reduced, register, side, takeOver]);

  const scrollToProgress = (value: number, behavior: ScrollBehavior = 'instant') => {
    const viewport = pane.current!;
    const top = value * scrollTravel(viewport);
    seekTarget.current = behavior === 'smooth' && Math.abs(top - viewport.scrollTop) > 1 ? top : null;
    viewport.scrollTo({top, behavior});
    measure();
  };

  const startPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || capture.current) return;
    event.preventDefault();
    event.stopPropagation();
    stopDemo();
    const slider = event.currentTarget;
    const {pointerId: pointer, clientX: startX, clientY: startY} = event;
    slider.focus({preventScroll: true});
    slider.setPointerCapture(pointer);
    const scrollAtPointer = (clientY: number, behavior: ScrollBehavior) => {
      const bounds = track.current?.getBoundingClientRect();
      if (bounds?.height) scrollToProgress(gaugeTrackPosition((clientY - bounds.top) / bounds.height, direction), behavior);
    };
    const moved = (input: globalThis.PointerEvent) => Math.hypot(input.clientX - startX, input.clientY - startY) > 6;
    const controller = new AbortController();
    const dispose = () => {
      controller.abort();
      capture.current = null;
      if (slider.hasPointerCapture(pointer)) slider.releasePointerCapture(pointer);
    };
    const stop = () => {
      dispose();
      if (session.dragging) {
        smooth.jump(progress.get());
        setDragging(false);
      }
    };
    const session = {dragging: false, dispose, stop};
    capture.current = session;

    const scope = {signal: controller.signal};
    const view = slider.ownerDocument.defaultView!;
    const end = (input: globalThis.PointerEvent) => { if (input.pointerId === pointer) stop(); };
    view.addEventListener('pointermove', input => {
      if (input.pointerId !== pointer) return;
      if (input.buttons === 0) {
        stop();
        return;
      }
      if (!session.dragging) {
        if (!moved(input)) return;
        stopSeek();
        session.dragging = true;
        setDragging(true);
      }
      scrollAtPointer(input.clientY, 'instant');
    }, scope);
    view.addEventListener('pointerup', input => {
      if (input.pointerId !== pointer) return;
      stop();
      if (!session.dragging && !moved(input)) scrollAtPointer(input.clientY, reduced ? 'instant' : 'smooth');
    }, scope);
    view.addEventListener('pointercancel', end, scope);
    view.addEventListener('blur', stop, scope);
    slider.addEventListener('lostpointercapture', end, scope);
  };

  // End pointer actions when their direction or motion preference changes.
  useLayoutEffect(() => {
    capture.current?.stop();
    stopSeek();
  }, [direction, measure, stopSeek]);

  const onGaugeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = gaugeKeyProgress(event.key, progress.get());
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    takeOver();
    scrollToProgress(next);
  };

  const onPaneKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
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

  return (
    <div className="history-demo" data-history-preview={side} data-recipe="vertical-scroll-gauge" data-trigger="click" data-paused={paused}>
      <div className="history-canvas vertical-gauge-canvas" style={{height: thumbnail ? '100%' : 400}}>
        <div className="vertical-gauge-stage" inert={!available} onClick={event => event.stopPropagation()}>
          <div ref={pane} className="vertical-gauge-pane" tabIndex={0} role="region"
            aria-label={zh ? '竖向滚动刻度演示阅读区' : 'Vertical Scroll Gauge reading area'}
            onPointerDown={takeOver} onKeyDown={onPaneKey}>
            <article ref={article} className="vertical-gauge-content">
              {sections.map(([title, text, titleZh, textZh]) => (
                <section key={title}><h3>{zh ? titleZh : title}</h3><p>{zh ? textZh : text}</p></section>
              ))}
            </article>
            <div className="vertical-gauge-overlay">
              <div className="vertical-scroll-gauge" role="slider" tabIndex={0}
                aria-label={zh ? '阅读进度' : 'Reading progress'} aria-orientation="vertical"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}%`}
                data-direction={direction} data-dragging={dragging} onPointerDown={startPointer} onKeyDown={onGaugeKey}>
                <span ref={track} className="vertical-gauge-track" aria-hidden="true">
                  <motion.span className="vertical-gauge-fill" style={{height: fill}}/>
                  <motion.span className="vertical-gauge-percent" style={{top: label}}>{percent}%</motion.span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
