import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import type {KeyboardEvent, PointerEvent} from 'react';
import {animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform} from 'motion/react';
import {motionEasing} from './easing';
import {useLanguage} from './i18n';
import type {HistoryPreviewProps} from './preview-types';
import {usePreviewClock} from './useDetailPlayback';
import type {PlaybackControl} from './useDetailPlayback';
import {
  clampGaugeProgress, defaultVerticalGauge, gaugeKeyProgress, gaugeTrackPosition,
  verticalGaugeDemo, verticalGaugeSpring,
} from './vertical-scroll-gauge';
import './vertical-scroll-gauge.css';

const sections = [
  ['Vertical Scroll Gauge', 'Scroll this reading area to move the gauge.', '竖向滚动刻度', '在阅读区内滚动，查看刻度上的阅读进度。'],
  ['Drag the gauge', 'Drag along the track to move through this article.', '拖动刻度', '沿刻度轨道拖动，跳转到文章中的对应位置。'],
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
  const article = useRef<HTMLElement>(null);
  const track = useRef<HTMLSpanElement>(null);
  const drag = useRef<{stop: () => void; dispose: () => void} | null>(null);
  const lastCommand = useRef(0);
  const controls = useRef<PlaybackControl[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const report = useRef(onRunningChange);
  report.current = onRunningChange;
  const {register, clear, forget} = usePreviewClock(controls, speed, available, paused);
  const progress = useMotionValue(0);
  const smooth = useSpring(0, verticalGaugeSpring);
  const [dragging, setDragging] = useState(false);
  const [percent, setPercent] = useState(0);
  const displayed = reduced || dragging ? progress : smooth;
  const fill = useTransform(displayed, value => `${clampGaugeProgress(value) * 100}%`);
  const label = useTransform(displayed, value => `${gaugeTrackPosition(value, direction) * 100}%`);
  useMotionValueEvent(progress, 'change', value => setPercent(Math.round(value * 100)));

  const measure = useCallback(() => {
    const viewport = pane.current!;
    const travel = scrollTravel(viewport);
    const next = travel > 0 ? clampGaugeProgress(viewport.scrollTop / travel) : 0;
    if (next === progress.get()) return;
    progress.set(next);
    if (reduced || drag.current) smooth.jump(next);
    else if (!pausedRef.current || !controls.current.length) smooth.set(next);
  }, [progress, reduced, smooth]);

  const stopDemo = useCallback(() => {
    if (!controls.current.length) return;
    clear();
    report.current?.(side, false);
  }, [clear, side]);

  useLayoutEffect(() => {
    const viewport = pane.current!;
    viewport.addEventListener('scroll', measure, {passive: true});
    // Let the demo release the pane before the browser applies the first wheel delta.
    viewport.addEventListener('wheel', stopDemo, {passive: false});
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(article.current!);
    measure();
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', measure);
      viewport.removeEventListener('wheel', stopDemo);
    };
  }, [measure, stopDemo]);

  useLayoutEffect(() => {
    if (reduced) smooth.jump(progress.get());
    else if (paused || !available) smooth.jump(smooth.get());
    else smooth.set(progress.get());
  }, [available, paused, progress, reduced, smooth]);

  useLayoutEffect(() => () => {
    drag.current?.dispose();
    clear();
  }, [clear]);

  useLayoutEffect(() => {
    if (!available || reduced) stopDemo();
    if (!available) drag.current?.stop();
  }, [available, reduced, stopDemo]);

  useLayoutEffect(() => {
    if (!available || !command.active || command.seq <= lastCommand.current) return;
    lastCommand.current = command.seq;
    stopDemo();
    drag.current?.stop();
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
    forget, measure, reduced, register, side, stopDemo]);

  const scrollToProgress = (value: number) => {
    const viewport = pane.current!;
    viewport.scrollTo({top: value * scrollTravel(viewport), behavior: 'instant'});
    measure();
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || drag.current) return;
    event.preventDefault();
    event.stopPropagation();
    stopDemo();
    const slider = event.currentTarget;
    const pointer = event.pointerId;
    slider.focus({preventScroll: true});
    slider.setPointerCapture(pointer);
    const scrollAtPointer = (clientY: number) => {
      const bounds = track.current?.getBoundingClientRect();
      if (bounds?.height) scrollToProgress(gaugeTrackPosition((clientY - bounds.top) / bounds.height, direction));
    };
    const controller = new AbortController();
    const dispose = () => {
      controller.abort();
      drag.current = null;
      if (slider.hasPointerCapture(pointer)) slider.releasePointerCapture(pointer);
    };
    const stop = () => {
      dispose();
      smooth.jump(progress.get());
      setDragging(false);
    };
    drag.current = {dispose, stop};
    setDragging(true);
    scrollAtPointer(event.clientY);

    const scope = {signal: controller.signal};
    const view = slider.ownerDocument.defaultView!;
    const end = (input: globalThis.PointerEvent) => { if (input.pointerId === pointer) stop(); };
    view.addEventListener('pointermove', input => {
      if (input.pointerId !== pointer) return;
      if (input.buttons === 0) stop();
      else scrollAtPointer(input.clientY);
    }, scope);
    view.addEventListener('pointerup', end, scope);
    view.addEventListener('pointercancel', end, scope);
    view.addEventListener('blur', stop, scope);
    slider.addEventListener('lostpointercapture', end, scope);
  };

  // End capture if a direction change would invalidate the active pointer mapping.
  useLayoutEffect(() => { drag.current?.stop(); }, [direction, measure]);

  const onGaugeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = gaugeKeyProgress(event.key, progress.get());
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    stopDemo();
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
    stopDemo();
    viewport.scrollTo({top: viewport.scrollTop + steps[event.key], behavior: 'instant'});
  };

  return (
    <div className="history-demo" data-history-preview={side} data-recipe="vertical-scroll-gauge" data-trigger="click" data-paused={paused}>
      <div className="history-canvas vertical-gauge-canvas" style={{height: thumbnail ? '100%' : 400}}>
        <div className="vertical-gauge-stage" inert={!available} onClick={event => event.stopPropagation()}>
          <div ref={pane} className="vertical-gauge-pane" tabIndex={0} role="region"
            aria-label={zh ? '竖向滚动刻度演示阅读区' : 'Vertical Scroll Gauge reading area'}
            onPointerDown={stopDemo} onKeyDown={onPaneKey}>
            <article ref={article} className="vertical-gauge-content">
              {sections.map(([title, text, titleZh, textZh]) => (
                <section key={title}><h3>{zh ? titleZh : title}</h3><p>{zh ? textZh : text}</p></section>
              ))}
            </article>
            <div className="vertical-gauge-overlay">
              <div className="vertical-scroll-gauge" role="slider" tabIndex={0}
                aria-label={zh ? '阅读进度' : 'Reading progress'} aria-orientation="vertical"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}%`}
                data-direction={direction} data-dragging={dragging} onPointerDown={startDrag} onKeyDown={onGaugeKey}>
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
