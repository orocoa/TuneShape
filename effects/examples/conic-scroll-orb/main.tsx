import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import HistoryPreview from '../../src/HistoryPreview';
import {parseHistory} from '../../src/history-model';
import {setLanguage, useLanguage} from '../../src/i18n';
import {useDetailPlayback} from '../../src/useDetailPlayback';
import {usePrefersReducedMotion} from '../../src/usePrefersReducedMotion';
import '../../src/typography.css';
import '../../src/reuse-runtime.css';
import preset from './config.json';

const config = parseHistory(JSON.stringify(preset));

function Preview({replay, onReplay}: {replay: boolean; onReplay: () => void}) {
  const zh = useLanguage() === 'zh';
  const reduced = usePrefersReducedMotion();
  const playback = useDetailPlayback(config.recipeId, replay);
  return (
    <>
      <nav className="reuse-toolbar" aria-label={zh ? '预览控制' : 'Preview controls'} style={{flexWrap: 'wrap'}}>
        <a href="../../">{zh ? '全部动效' : 'All effects'}</a>
        <button type="button" onClick={playback.toggle}>
          {playback.playing ? (zh ? '暂停' : 'Pause') : (zh ? '播放' : 'Play')}
        </button>
        <button type="button" onClick={onReplay}>{zh ? '重播' : 'Replay'}</button>
        <button type="button" lang="zh-CN" aria-pressed={zh} onClick={() => setLanguage('zh')}>中文</button>
        <button type="button" lang="en" aria-pressed={!zh} onClick={() => setLanguage('en')}>English</button>
      </nav>
      <div className="preview-card after">
        <HistoryPreview config={config} side="after" speed={1} reduced={reduced}
          command={playback.command} paused={playback.paused} onRunningChange={(side, running) => {
            // The standalone example mounts a single preview.
            playback.report('before', false);
            playback.report(side, running);
          }}/>
      </div>
    </>
  );
}

function Demo() {
  const [epoch, setEpoch] = useState(0);
  return <main className="reuse-demo" data-public-effect={config.recipeId}>
    <Preview key={epoch} replay={epoch > 0} onReplay={() => setEpoch(value => value + 1)}/>
  </main>;
}

setLanguage('en');
createRoot(document.getElementById('root')!).render(<Demo />);
