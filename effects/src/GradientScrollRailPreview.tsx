import {useCallback, useContext, useLayoutEffect, useRef, useState} from 'react';
import type {KeyboardEvent, PointerEvent} from 'react';
import {animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform} from 'motion/react';
import type {MotionValue} from 'motion/react';
import {motionEasing} from './easing';
import {
  defaultGradientRail, gradientRailCenter, gradientRailDemo, gradientRailDrag, gradientRailGeometry,
  gradientRailGray, gradientRailKey, gradientRailPalette, gradientRailPress, gradientRailPressIntent, gradientRailProgress,
  gradientRailSeek, gradientRailSpring, gradientRailWidth,
} from './gradient-scroll-rail';
import type {GradientRailDirection} from './gradient-scroll-rail';
import {useLanguage} from './i18n';
import {ScrollPreviewPane} from './scroll-preview-pane';
import type {HistoryPreviewProps} from './preview-types';
import {usePreviewClock} from './useDetailPlayback';
import type {PlaybackControl} from './useDetailPlayback';
import './gradient-scroll-rail.css';

const {height, count, barHeight, gap} = gradientRailGeometry;
const indices = Array.from({length: count}, (_, index) => index);
const surface = gradientRailPalette.surface;
const backgroundColor = `rgb(${surface} ${surface} ${surface})`;
const sections = [
  ['Gradient Scroll Rail', 'Scroll inside this reading area, or click the rail on the right to scroll to that position.',
    '渐变滚动轨', '在阅读区内滚动，或单击右侧轨道平滑滚到对应位置。'],
  ['Drag the rail', 'Press and drag vertically to move through the article. Hold still to open the arc in place.',
    '拖动轨道', '按住轨道上下拖动可调整阅读位置。原地按住可先展开弧形。'],
  ['Use the keyboard', 'Tab to the rail and use the arrow keys or Page Up and Page Down.',
    '使用键盘', '按 Tab 聚焦轨道，再使用方向键或 Page Up、Page Down 调整阅读进度。'],
  ['End of the reading area', 'Home and End jump to the start and end.',
    '阅读区末尾', '按 Home 或 End 跳到阅读区的开头或末尾。'],
] as const;

type PointerCapture = {id: number; target: HTMLDivElement};
type PendingPress = PointerCapture & {
  phase: 'pending'; x: number; y: number; latestY: number; timer: ReturnType<typeof setTimeout>;
};
type ActivePress = PointerCapture & {phase: 'active' | 'dragging'; startY: number; startProgress: number};
type Press = PendingPress | ActivePress;
type Phase = 'idle' | Press['phase'] | 'release';

function scrollTravel(pane: HTMLElement) {
  return pane.scrollHeight - pane.clientHeight;
}

function RailBar({index, direction, center, strength, progress}: {
  index: number; direction: GradientRailDirection;
  center: MotionValue<number>; strength: MotionValue<number>; progress: MotionValue<number>;
}) {
  const width = useTransform(() => gradientRailWidth(index, center.get(), strength.get()));
  const backgroundColor = useTransform(progress, value => {
    const shade = gradientRailGray(index, value, direction);
    return `rgb(${shade} ${shade} ${shade})`;
  });
  return <motion.span className="gradient-rail-bar" style={{width, height: barHeight, backgroundColor}}/>;
}

export default function GradientScrollRailPreview({
  config, speed, reduced, command, side, enabled = true, interactive = true, paused = false,
  thumbnail = false, onRunningChange,
}: HistoryPreviewProps) {
  const zh = useLanguage() === 'zh';
  const direction = config.gradientScrollRail?.direction ?? defaultGradientRail.direction;
  const available = enabled && interactive;
  const pane = useRef<HTMLDivElement>(null);
  const initializePreview = useContext(ScrollPreviewPane);
  const article = useRef<HTMLElement>(null);
  const bars = useRef<HTMLDivElement>(null);
  const press = useRef<Press | null>(null);
  const seekTarget = useRef<number | null>(null);
  const lastCommand = useRef(0);
  const controls = useRef<PlaybackControl[]>([]);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const report = useRef(onRunningChange);
  report.current = onRunningChange;
  const {register, clear, forget} = usePreviewClock(controls, speed, available, paused);
  const progress = useMotionValue(0);
  const center = useSpring(0, gradientRailSpring);
  const strength = useSpring(0, gradientRailSpring);
  const [phase, setPhase] = useState<Phase>('idle');
  const [percent, setPercent] = useState(0);

  useMotionValueEvent(strength, 'animationComplete', () => {
    if (!press.current && strength.get() === 0) setPhase('idle');
  });

  const measure = useCallback(() => {
    const viewport = pane.current;
    if (!viewport) return;
    if (seekTarget.current !== null && Math.abs(seekTarget.current - viewport.scrollTop) <= 1) {
      seekTarget.current = null;
    }
    const next = gradientRailProgress(viewport.scrollTop, scrollTravel(viewport));
    progress.set(next);
    setPercent(Math.round(next * 100));
  }, [progress]);

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

  const disposePress = useCallback(() => {
    const current = press.current;
    if (!current) return;
    press.current = null;
    if (current.phase === 'pending') clearTimeout(current.timer);
    if (current.target.hasPointerCapture(current.id)) current.target.releasePointerCapture(current.id);
    return current.phase;
  }, []);

  const finishPress = useCallback(() => {
    const ended = disposePress();
    if (!ended) return;
    if (reduced || strength.get() <= 0) {
      strength.jump(0);
      setPhase('idle');
    } else {
      if (ended !== 'pending') strength.set(0);
      setPhase('release');
    }
  }, [disposePress, reduced, strength]);

  const takeOver = useCallback(() => {
    finishPress();
    stopDemo();
    stopSeek();
  }, [finishPress, stopDemo, stopSeek]);

  useLayoutEffect(() => {
    const viewport = pane.current!;
    const view = viewport.ownerDocument.defaultView!;
    initializePreview?.(viewport);
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(article.current!);
    viewport.addEventListener('scroll', measure, {passive: true});
    // Release the animation before the browser applies the first manual wheel delta.
    viewport.addEventListener('wheel', takeOver, {passive: false});
    view.addEventListener('blur', finishPress);
    measure();
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', measure);
      viewport.removeEventListener('wheel', takeOver);
      view.removeEventListener('blur', finishPress);
    };
  }, [finishPress, initializePreview, measure, takeOver]);

  useLayoutEffect(() => () => {
    disposePress();
    clear();
  }, [clear, disposePress]);

  useLayoutEffect(() => {
    finishPress();
    stopSeek();
    if (reduced) {
      strength.jump(0);
      setPhase('idle');
    }
    if (!available || reduced) stopDemo();
  }, [available, direction, finishPress, reduced, stopDemo, stopSeek, strength]);

  useLayoutEffect(() => {
    if (!available || !command.active || command.seq <= lastCommand.current) return;
    lastCommand.current = command.seq;
    takeOver();
    const viewport = pane.current!;
    const sample = Math.round(scrollTravel(viewport) * gradientRailDemo.fraction);
    if (sample <= 0 || reduced) {
      if (sample > 0) {
        viewport.scrollTo({top: sample, behavior: 'instant'});
        measure();
      }
      report.current?.(side, false);
      return;
    }
    const top = viewport.scrollTop;
    report.current?.(side, true);
    const animation = register(animate(top, [top, sample, 0], {
      duration: config.durationMs * 2 / 1000,
      delay: config.delayMs / 1000,
      ease: motionEasing(config.easing),
      onUpdate: value => {
        if (pausedRef.current || pane.current !== viewport) return;
        viewport.scrollTop = value;
        measure();
      },
      onComplete: () => {
        forget(animation);
        report.current?.(side, false);
      },
    }));
  }, [available, command.active, command.seq, config.delayMs, config.durationMs, config.easing,
    forget, measure, reduced, register, side, takeOver]);

  const scrollToReading = (next: number, behavior: ScrollBehavior = 'instant') => {
    const viewport = pane.current!;
    const top = next * scrollTravel(viewport);
    seekTarget.current = behavior === 'smooth' && Math.abs(top - viewport.scrollTop) > 1 ? top : null;
    viewport.scrollTo({top, behavior});
    measure();
  };

  const activatePress = (pending: PendingPress, phase: ActivePress['phase'], startY: number, pointerY: number) => {
    clearTimeout(pending.timer);
    stopDemo();
    stopSeek();
    const viewport = pane.current!;
    const startProgress = gradientRailProgress(viewport.scrollTop, scrollTravel(viewport));
    const current: ActivePress = {phase, id: pending.id, target: pending.target, startY, startProgress};
    press.current = current;
    const bounds = bars.current!.getBoundingClientRect();
    const index = Math.max(0, Math.min(count - 1, gradientRailCenter((pointerY - bounds.top) * height / bounds.height)));
    if (reduced || strength.get() === 0) center.jump(index);
    else center.set(index);
    if (reduced) strength.jump(1);
    else strength.set(1);
    setPhase(phase);
    return current;
  };

  const onRailDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!event.isPrimary || event.button !== 0 || press.current) return;
    event.preventDefault();
    const {pointerId: id, clientX: x, clientY: y, currentTarget: target} = event;
    target.setPointerCapture(id);
    const timer = setTimeout(() => {
      const current = press.current;
      if (current?.phase === 'pending' && current.id === id) {
        activatePress(current, 'active', current.latestY, current.latestY);
      }
    }, gradientRailPress.delayMs);
    press.current = {phase: 'pending', id, target, x, y, latestY: y, timer};
    setPhase('pending');
  };

  const onRailMove = (event: PointerEvent<HTMLDivElement>) => {
    let current = press.current;
    if (!current || current.id !== event.pointerId) return;
    if (event.buttons === 0) {
      finishPress();
      return;
    }
    if (current.phase === 'pending') {
      const intent = gradientRailPressIntent(event.clientX - current.x, event.clientY - current.y);
      if (intent === 'pending') {
        current.latestY = event.clientY;
        return;
      }
      if (intent === 'cancel') {
        finishPress();
        return;
      }
      current = activatePress(current, 'dragging', current.y, event.clientY);
    }
    const delta = event.clientY - current.startY;
    if (current.phase === 'active' && delta === 0) return;
    if (current.phase === 'active') {
      current.phase = 'dragging';
      setPhase('dragging');
    }
    const bounds = bars.current!.getBoundingClientRect();
    const scale = height / bounds.height;
    const index = gradientRailCenter((event.clientY - bounds.top) * scale);
    if (reduced) center.jump(index);
    else center.set(index);
    scrollToReading(gradientRailDrag(current.startProgress, delta * scale, direction));
  };

  const onRailUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (!current || current.id !== event.pointerId) return;
    finishPress();
    if (current.phase !== 'pending' || gradientRailPressIntent(event.clientX - current.x, event.clientY - current.y) !== 'pending') return;
    const bounds = bars.current!.getBoundingClientRect();
    stopDemo();
    scrollToReading(gradientRailSeek((event.clientY - bounds.top) / bounds.height, direction), reduced ? 'instant' : 'smooth');
  };

  const onRailEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (press.current?.id === event.pointerId) finishPress();
  };

  const onRailKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = gradientRailKey(event.key, progress.get());
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    takeOver();
    scrollToReading(next);
  };

  const onPaneKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.altKey) return;
    const from = progress.get();
    const next = event.key === ' ' ? (event.shiftKey ? 0 : 1) : gradientRailKey(event.key, from);
    if (next === undefined) return;
    event.stopPropagation();
    takeOver();
    if (next === from) event.preventDefault();
  };

  return (
    <div className="history-demo" data-history-preview={side} data-recipe="gradient-scroll-rail" data-trigger="click" data-paused={paused}>
      <div className="history-canvas gradient-rail-canvas" style={{height: thumbnail ? '100%' : 400}}>
        <div className="gradient-rail-stage" style={{backgroundColor}}
          data-reduced={reduced} inert={!available} onClick={event => event.stopPropagation()}>
          <div ref={pane} className="gradient-rail-pane" tabIndex={0} role="region"
            aria-label={zh ? '渐变滚动轨演示阅读区' : 'Gradient Scroll Rail reading area'}
            onPointerDown={takeOver} onKeyDown={onPaneKey}>
            <div className="gradient-rail-overlay">
              <div className="gradient-scroll-rail" data-direction={direction} data-phase={phase}
                tabIndex={0} role="slider" aria-label={zh ? '阅读进度' : 'Reading progress'} aria-orientation="vertical"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}%`}
                onKeyDown={onRailKey} onBlur={finishPress} onPointerDown={onRailDown} onPointerMove={onRailMove}
                onPointerUp={onRailUp} onPointerCancel={onRailEnd} onLostPointerCapture={onRailEnd}>
                <div ref={bars} className="gradient-rail-bars" aria-hidden="true" style={{gap}}>
                  {indices.map(index => <RailBar key={index} {...{index, center, strength, direction, progress}}/>)}
                </div>
              </div>
            </div>
            <article ref={article} className="gradient-rail-content">
              {sections.map(([title, text, titleZh, textZh]) => (
                <section key={title}><h3>{zh ? titleZh : title}</h3><p>{zh ? textZh : text}</p></section>
              ))}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
