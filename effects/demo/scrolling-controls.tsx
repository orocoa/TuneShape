import {useRef, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import {parseHistory, serializeHistory, serializeHistoryMotion} from '../src/history-model';
import type {HistoryConfig} from '../src/history-model';
import type {Language} from '../src/i18n';
import {scrollingPrompt, scrollingSettingsFor} from '../src/scrolling-config';

const labels: Record<string, Record<Language, string>> = {
  revealOffset: {en: 'Reveal threshold (px)', zh: '显示阈值（像素）'},
  particlesEnabled: {en: 'Hover particles', zh: '悬停粒子'},
  stiffness: {en: 'Spring stiffness', zh: '弹簧刚度'},
  damping: {en: 'Spring damping', zh: '弹簧阻尼'},
  maxWidth: {en: 'Maximum bar width (px)', zh: '短条最大长度（像素）'},
  sigma: {en: 'Gaussian sigma', zh: '高斯 sigma'},
};

export default function ScrollingControls({config, initialConfig, setConfig, language}: {
  config: HistoryConfig;
  initialConfig: HistoryConfig;
  setConfig: Dispatch<SetStateAction<HistoryConfig>>;
  language: Language;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const zh = language === 'zh';
  const {key, defaults, bounds} = scrollingSettingsFor(config.recipeId);
  const settings: Record<string, number | boolean | string | undefined> = {...defaults, ...config[key]};
  const ranges: Record<string, readonly [number, number] | undefined> = bounds;

  const change = (field: string, value: number | boolean) => {
    setStatus('');
    setConfig(previous => ({...previous, [key]: {...defaults, ...previous[key], [field]: value}}));
  };

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(zh ? '已复制' : 'Copied');
    } catch {
      setStatus(zh ? '无法写入剪贴板' : 'Could not write to the clipboard');
    }
  }

  async function importConfig(file: File) {
    try {
      const imported = parseHistory(await file.text());
      if (imported.recipeId !== config.recipeId) {
        setStatus(zh ? '请选择此动效的配置文件' : 'Choose a configuration for this effect');
        return;
      }
      setConfig(imported);
      setStatus(zh ? '已导入配置' : 'Configuration imported');
    } catch {
      setStatus(zh ? '配置 JSON 无效' : 'Invalid configuration JSON');
    }
  }

  return (
    <fieldset className="scrolling-settings">
      <legend>{zh ? '参数' : 'Parameters'}</legend>
      <div className="scrolling-settings-fields">
        {Object.entries(settings).map(([field, value]) => {
          const range = ranges[field];
          if (typeof value === 'boolean') return (
            <label key={field}>
              <input type="checkbox" name={field} checked={value}
                onChange={event => change(field, event.currentTarget.checked)}/>
              {labels[field][language]}
            </label>
          );
          if (!range || typeof value !== 'number') return null;
          return (
            <label key={field}>
              <span>{labels[field][language]}</span>
              <input type="range" name={field} min={range[0]} max={range[1]} step="any" value={value}
                onChange={event => change(field, Number(event.currentTarget.valueAsNumber.toFixed(2)))}/>
              <output aria-hidden>{Number(value.toFixed(2))}</output>
            </label>
          );
        })}
      </div>
      <div className="scrolling-settings-actions">
        <button type="button" onClick={() => { setConfig(initialConfig); setStatus(''); }}>
          {zh ? '恢复默认值' : 'Restore defaults'}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>{zh ? '导入 JSON' : 'Import JSON'}</button>
        <input ref={fileInput} hidden type="file" accept="application/json,.json" onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void importConfig(file);
        }}/>
        <button type="button" onClick={() => void copy(serializeHistory(config))}>{zh ? '复制 JSON' : 'Copy JSON'}</button>
        <button type="button" onClick={() => void copy(serializeHistoryMotion(config))}>{zh ? '复制 Motion 规格' : 'Copy Motion spec'}</button>
        <button type="button" onClick={() => void copy(scrollingPrompt(config, language))}>{zh ? '复制 Prompt' : 'Copy prompt'}</button>
        <span role="status">{status}</span>
      </div>
    </fieldset>
  );
}
