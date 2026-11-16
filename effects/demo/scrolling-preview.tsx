import {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {animate} from 'motion/react';
import HistoryPreview from '../src/HistoryPreview';
import {parseHistory} from '../src/history-model';
import type {HistoryConfig} from '../src/history-model';
import {setLanguage, useLanguage} from '../src/i18n';
import {ScrollPreviewPane} from '../src/scroll-preview-pane';
import {useDetailPlayback, usePreviewClock} from '../src/useDetailPlayback';
import type {PlaybackControl} from '../src/useDetailPlayback';
import {usePrefersReducedMotion} from '../src/usePrefersReducedMotion';
import '../src/typography.css';
import '../src/reuse-runtime.css';
import './scrolling-preview.css';
import ScrollingControls from './scrolling-controls';

const startProgress = .30;
const restingCommand = {seq: 0, active: false};
const scrollKeys = new Set(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End', 'Enter', ' ']);

function scrollToProgress(pane: HTMLDivElement, progress: number) {
  const travel = pane.scrollHeight - pane.clientHeight;
  pane.scrollTo({top: Math.round(travel * progress), behavior: 'instant'});
  return pane.scrollTop;
}

type PreviewOption = {
  label: {zh: string; en: string};
  selected: (config: HistoryConfig) => boolean;
  select: (config: HistoryConfig) => HistoryConfig;
};

function ScrollingPreview({initialConfig, options}: {initialConfig: HistoryConfig; options: readonly PreviewOption[]}) {
  const [config, setConfig] = useState(initialConfig);
  const [preparing, setPreparing] = useState(true);
  const language = useLanguage();
  const zh = language === 'zh';
  const reduced = usePrefersReducedMotion();
  const {command, paused, playing, toggle, restart, cancel} = useDetailPlayback(config.recipeId, false, 'after');
  const pane = useRef<HTMLDivElement>(null);
  const stopPaneScroll = useRef<(() => void) | undefined>(undefined);
  const scriptedTop = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const lastCommand = useRef(0);
  const runVersion = useRef(0);
  const controls = useRef<PlaybackControl[]>([]);
  const {register, clear, forget} = usePreviewClock(controls, 1, true, paused);
  const stopPlayback = useCallback(() => {
    runVersion.current++;
    clear();
  }, [clear]);

  const attachPane = useCallback((node: HTMLDivElement, stopScroll?: () => void) => {
    stopPaneScroll.current = stopScroll;
    if (pane.current === node) return false;
    pane.current = node;
    scriptedTop.current = scrollToProgress(node, startProgress);
    return true;
  }, []);

  useLayoutEffect(() => {
    const viewport = pane.current!;
    const interrupt = () => {
      if (!controls.current.length) return;
      stopPlayback();
      cancel();
    };
    const onKey = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key)) interrupt();
    };
    const onScroll = () => {
      if (viewport.scrollTop !== scriptedTop.current) interrupt();
    };
    // Stop writing scrollTop before the browser applies the wheel delta.
    viewport.addEventListener('wheel', interrupt, {capture: true, passive: false});
    viewport.addEventListener('pointerdown', interrupt, true);
    viewport.addEventListener('click', interrupt, true);
    viewport.addEventListener('keydown', onKey, true);
    viewport.addEventListener('scroll', onScroll, {passive: true});

    // Let the initial measured progress paint before restoring the normal CSS transitions.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setPreparing(false));
    });
    return () => {
      cancelAnimationFrame(frame);
      stopPlayback();
      viewport.removeEventListener('wheel', interrupt, true);
      viewport.removeEventListener('pointerdown', interrupt, true);
      viewport.removeEventListener('click', interrupt, true);
      viewport.removeEventListener('keydown', onKey, true);
      viewport.removeEventListener('scroll', onScroll);
    };
  }, [cancel, stopPlayback]);

  useLayoutEffect(() => {
    const viewport = pane.current!;
    const fresh = command.seq !== lastCommand.current;
    if (!fresh && !(reduced && controls.current.length)) return;
    lastCommand.current = command.seq;
    stopPlayback();
    stopPaneScroll.current?.();
    scriptedTop.current = scrollToProgress(viewport, startProgress);
    if (reduced) {
      cancel();
      return;
    }
    const version = runVersion.current;
    const control = animate(startProgress, [startProgress, .75, .75, startProgress], {
      duration: 3,
      times: [0, .4, .6, 1],
      ease: ['easeInOut', 'linear', 'easeInOut'],
      onUpdate: value => {
        if (!pausedRef.current && version === runVersion.current) {
          scriptedTop.current = scrollToProgress(viewport, value);
        }
      },
      onComplete: () => {
        if (version !== runVersion.current) return;
        forget(control);
        cancel();
      },
    });
    register(control);
  }, [cancel, command.seq, forget, reduced, register, stopPlayback]);

  return (
    <main className="reuse-demo" data-public-effect={config.recipeId}>
      <nav className="reuse-toolbar" aria-label={zh ? '预览控制' : 'Preview controls'} style={{flexWrap: 'wrap'}}>
        <a href="../../">{zh ? '全部动效' : 'All effects'}</a>
        <button type="button" onClick={toggle}>
          {playing ? (zh ? '暂停' : 'Pause') : paused ? (zh ? '继续' : 'Resume') : (zh ? '播放' : 'Play')}
        </button>
        <button type="button" onClick={restart}>{zh ? '重播' : 'Replay'}</button>
        {options.map(option => (
          <button key={option.label.en} type="button" aria-pressed={option.selected(config)}
            onClick={() => setConfig(option.select)}>{option.label[language]}</button>
        ))}
        <button type="button" lang="zh-CN" aria-pressed={zh} onClick={() => setLanguage('zh')}>中文</button>
        <button type="button" lang="en" aria-pressed={!zh} onClick={() => setLanguage('en')}>English</button>
      </nav>
      <div className="preview-card after" data-scroll-preview-preparing={preparing || undefined}>
        <ScrollPreviewPane.Provider value={attachPane}>
          <HistoryPreview config={config} side="after" speed={1} reduced={reduced} command={restingCommand} paused={paused}/>
        </ScrollPreviewPane.Provider>
      </div>
      <ScrollingControls config={config} initialConfig={initialConfig} setConfig={setConfig} language={language}/>
    </main>
  );
}

export function mountScrollingPreview(preset: unknown, options: readonly PreviewOption[] = []) {
  setLanguage('en');
  const config = parseHistory(JSON.stringify(preset));
  const root = createRoot(document.getElementById('root')!);
  root.render(<ScrollingPreview initialConfig={config} options={options}/>);
  return root;
}
