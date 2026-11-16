import {useCallback, useId, useLayoutEffect, useRef, useState} from 'react';
import type {KeyboardEvent} from 'react';
import {animate} from 'motion/react';
import {motionEasing} from './easing';
import {useLanguage} from './i18n';
import {
  orbDigits, orbFace, orbParticleFrame, orbParticleSpawn, orbParticles, orbScrollMetrics, orbSegments, orbSize,
} from './pixel-scroll-orb';
import type {HistoryPreviewProps} from './preview-types';
import {usePreviewClock} from './useDetailPlayback';
import type {PlaybackControl} from './useDetailPlayback';
import './pixel-scroll-orb.css';

const hoverQuery = '(hover: hover) and (pointer: fine)';
const sections = [
  ['Pixel Scroll Orb', 'Scroll within this panel. The orb appears after 72 px and shows the current reading progress.',
    '像素滚动球', '在此区域内滚动。超过 72 像素后，球体会显示当前阅读进度。'],
  ['The ring', 'Twenty-four pixels follow the reading position, starting at the top and filling clockwise.',
    '环形进度', '24 段像素从顶部开始，随阅读位置顺时针点亮。'],
  ['The number', 'The center displays two digits until the progress reaches 100%.',
    '像素数字', '中央以两位数字显示进度，到达 100% 时切换为三位。'],
  ['The particles', 'Hover over the orb with a mouse to see seven pixels rise.',
    '悬停粒子', '鼠标悬停在球体上时，七颗像素粒子会向上飘动。'],
  ['Back to top', 'Click the orb, or focus it and press Enter or Space, to return to the top of this panel.',
    '返回顶部', '点按球体，或聚焦后按 Enter 或空格，即可回到此区域顶部。'],
] as const;

export default function PixelScrollOrbPreview({
  config, speed, reduced, command, side, enabled = true, paused = false, thumbnail = false,
  interactive = true, onRunningChange,
}: HistoryPreviewProps) {
  const zh = useLanguage() === 'zh';
  const digitId = useId();
  const pane = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const particleGroup = useRef<SVGGElement>(null);
  const lastCommand = useRef(0);
  const scrollControls = useRef<PlaybackControl[]>([]);
  const particleControls = useRef<PlaybackControl[]>([]);
  const available = enabled && interactive;
  const [{percent, visible}, setProgress] = useState({percent: 0, visible: false});
  const [hovered, setHovered] = useState(false);
  const report = useRef(onRunningChange);
  report.current = onRunningChange;
  const {register: registerScroll, clear: clearScroll} = usePreviewClock(scrollControls, speed, available, paused);
  const {register: registerParticle, clear: clearParticles} = usePreviewClock(particleControls, speed, available, paused);

  const stopScroll = useCallback(() => {
    clearScroll();
    report.current?.(side, false);
  }, [clearScroll, side]);

  useLayoutEffect(() => {
    const viewport = pane.current!;
    let frame: number | undefined;
    const measure = () => {
      frame = undefined;
      const metrics = orbScrollMetrics(viewport.scrollTop, viewport.scrollHeight, viewport.clientHeight);
      const show = available && metrics.visible;
      if (!show) {
        if (viewport.ownerDocument.activeElement === button.current) viewport.focus({preventScroll: true});
        setHovered(false);
      }
      setProgress(previous => previous.percent === metrics.percent && previous.visible === show
        ? previous : {percent: metrics.percent, visible: show});
    };
    const schedule = () => { frame ??= requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    observer.observe(content.current!);
    viewport.addEventListener('scroll', schedule, {passive: true});
    measure();
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [available]);

  const moveScroll = useCallback((demo: boolean) => {
    const viewport = pane.current!;
    const distance = viewport.scrollHeight - viewport.clientHeight;
    stopScroll();
    if (!available || distance <= 0) return;
    const sample = Math.round(distance * .65);
    if (reduced || paused) {
      viewport.scrollTop = demo ? sample : 0;
      return;
    }
    report.current?.(side, true);
    registerScroll(animate(viewport.scrollTop, demo ? [viewport.scrollTop, sample, 0] : 0, {
      duration: config.durationMs / 1000 * (demo ? 2 : 1),
      delay: demo ? config.delayMs / 1000 : 0,
      ease: motionEasing(config.easing),
      onUpdate: top => { viewport.scrollTop = top; },
      onComplete: () => report.current?.(side, false),
    }));
  }, [available, config.durationMs, config.delayMs, config.easing, paused, reduced, registerScroll, side, stopScroll]);

  useLayoutEffect(() => {
    if (!available || reduced) stopScroll();
  }, [available, reduced, stopScroll]);
  useLayoutEffect(() => stopScroll, [stopScroll]);
  useLayoutEffect(() => {
    if (!command.active || command.seq <= lastCommand.current) return;
    lastCommand.current = command.seq;
    moveScroll(true);
  }, [command.active, command.seq, moveScroll]);

  useLayoutEffect(() => {
    if (!visible || !hovered || reduced || !available) return;
    const elements = Array.from(particleGroup.current!.querySelectorAll('rect'));
    elements.forEach((element, index) => {
      const anchor = orbParticles[index];
      const {rise, duration, delay} = anchor;
      const place = () => {
        const spawn = orbParticleSpawn(anchor);
        element.setAttribute('x', String(spawn.x));
        element.setAttribute('y', String(spawn.y));
        element.setAttribute('width', String(spawn.size));
        element.setAttribute('height', String(spawn.size));
        return spawn.drift;
      };
      let drift = place();
      let previousPhase = 0;
      registerParticle(animate(0, 1, {
        duration: duration / 1000,
        delay: delay / 1000,
        ease: 'linear',
        repeat: Infinity,
        onUpdate: phase => {
          // The repeat wraps from the end of the fade to the next invisible start.
          if (phase < previousPhase) drift = place();
          previousPhase = phase;
          const {travel, opacity} = orbParticleFrame(anchor, phase);
          element.style.transform = `translate(${drift * travel}px, ${-rise * travel}px)`;
          element.style.opacity = String(opacity);
        },
      }));
    });
    return () => {
      clearParticles();
      elements.forEach(element => {
        element.style.removeProperty('opacity');
        element.style.removeProperty('transform');
      });
    };
  }, [available, clearParticles, hovered, reduced, registerParticle, visible]);

  const scrollWithKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.altKey) return;
    const viewport = event.currentTarget;
    const scrollStep = viewport.clientHeight * .9;
    const increments: Record<string, number> = {
      ArrowUp: -40, ArrowDown: 40, PageUp: -scrollStep, PageDown: scrollStep,
      ' ': event.shiftKey ? -scrollStep : scrollStep,
      Home: -viewport.scrollHeight, End: viewport.scrollHeight,
    };
    if (!Object.hasOwn(increments, event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    stopScroll();
    viewport.scrollTop += increments[event.key];
  };

  const face = orbFace(percent);
  const label = zh ? '返回顶部，当前滚动进度' : 'Back to top, current scroll progress';
  return (
    <div className="history-demo" data-history-preview={side} data-recipe="pixel-scroll-orb" data-trigger="click" data-paused={paused}>
      <div className="history-canvas pixel-scroll-canvas" style={{height: thumbnail ? '100%' : 400}}>
        <div className="pixel-scroll-stage" inert={!available} onClick={event => event.stopPropagation()}>
          <div ref={pane} className="pixel-scroll-pane" tabIndex={0} role="region"
            aria-label={zh ? '像素滚动球演示阅读区' : 'Pixel Scroll Orb reading area'}
            onWheel={stopScroll} onPointerDown={stopScroll} onKeyDown={scrollWithKey}>
            <article ref={content} className="pixel-scroll-content">
              {sections.map(([heading, body, headingZh, bodyZh]) => (
                <section key={heading}><h3>{zh ? headingZh : heading}</h3><p>{zh ? bodyZh : body}</p></section>
              ))}
            </article>
            <div className="pixel-scroll-overlay">
              <button ref={button} type="button" className="pixel-scroll-orb" hidden={!visible} inert={!visible}
                style={{transform: `translate(${config.offsetX}px, ${config.offsetY}px) scale(${config.scale})`}}
                aria-label={`${label} ${percent}%`} onClick={() => moveScroll(false)}
                onPointerEnter={event => {
                  if (event.pointerType === 'mouse' && window.matchMedia(hoverQuery).matches) setHovered(true);
                }}
                onPointerLeave={() => setHovered(false)}>
                <svg viewBox={`0 0 ${orbSize} ${orbSize}`} width={orbSize} height={orbSize}
                  aria-hidden="true" focusable="false" shapeRendering="crispEdges">
                  <defs>{orbDigits.map((rows, digit) => (
                    <g key={digit} id={`${digitId}-${digit}`}>
                      {rows.flatMap((row, y) => [...row].map((pixel, x) => pixel === '1'
                        ? <rect key={`${x}-${y}`} x={x * 3} y={y * 3} width={3} height={3}/> : null))}
                    </g>
                  ))}</defs>
                  {orbSegments.map(([x, y], index) => (
                    <rect key={index} className="pixel-scroll-segment" data-active={index < face.activeSegments || undefined}
                      x={x * 2} y={y * 2} width={4} height={4}/>
                  ))}
                  <g className="pixel-scroll-digits" transform={`translate(${face.digitX} 20.5)`}>
                    {[...face.digits].map((digit, index) => <use key={index} href={`#${digitId}-${digit}`} x={index * 12}/>)}
                  </g>
                  <g ref={particleGroup} className="pixel-scroll-particles">
                    {orbParticles.map(({x, y, size}, index) => <rect key={index} x={x} y={y} width={size} height={size}/>)}
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
