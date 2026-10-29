import {controlTerms,fieldTerms,terminologyInterface} from './terminology';
import {useSyncExternalStore} from 'react';
import {english} from './translations-en';
import {effectTerms} from './effect-terms';
import {catalogParent} from './browse-catalog';

export type Language = 'zh' | 'en';
const key = 'tuneshape-interface-language-v1';
let language: Language = 'zh';
try { if (typeof localStorage !== 'undefined' && localStorage.getItem(key) === 'en') language = 'en'; } catch { /* Storage is optional. */ }
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const termLabels=Object.fromEntries([...Object.values(controlTerms),...Object.values(fieldTerms)].map(term=>[term.zh,term.en]));
const effectLabels = Object.fromEntries(Object.values(effectTerms).map(term => [term.label, term.english]));

export function translate(text: string, locale: Language): string {
 if (locale === 'zh' || !text) return text;
 const [,before,content,after] = text.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
 const result = terminologyInterface[content] ?? termLabels[content] ?? english[content] ?? effectLabels[content];
 if (result !== undefined) return before + result + after;
 // Only controlled interface templates are matched; arbitrary input and JSON are untouched.
 const patterns: [RegExp, (...parts: string[]) => string][] = [
  [/^(\d+) 个锚点 ·$/, (_, count) => `${count} anchors ·`],
  [/^(.+)数值$/, (_, label) => `${translate(label, locale)} value`],
  [/^(调整前|调整后|预览)，(.+)$/, (_, side, label) => `${translate(side, locale)}, ${translate(label, locale)}`],
  [/^(展开|收起)(.+)$/, (_, action, label) => `${action === '展开' ? 'Expand' : 'Collapse'} ${translate(label, locale)}`],
  [/^(停止|预览)(.+)$/, (_, action, label) => `${action === '停止' ? 'Stop' : 'Preview'} ${translate(label, locale)}`],
  [/^(\d+) 个结果 · 共 (\d+) 个$/, (_, count, total) => `${count} results · ${total} total`],
  [/^向(下|上) (.+) px$/, (_, direction, value) => `${value} px ${direction === '下' ? 'down' : 'up'}`],
  [/^从偏移 (.+) px 回到原位$/, (_, value) => `Return from offset ${value} px`],
  [/^(\d+) 个控制点$/, (_, count) => `${count} control points`],
  [/^(控制点|锚点) (\d+)$/, (_, label, index) => `${translate(label, locale)} ${index}`],
  [/^(.+)，x (.+)，y (.+)$/, (_, label, x, y) => `${translate(label, locale)}, x ${x}, y ${y}`],
 ];
 for (const [pattern, format] of patterns) { const match = content.match(pattern); if (match) return before + format(...match) + after; }
 return text;
}

export const t = (text: string) => translate(text, language);
/** Category labels have their own context, preserving generic control labels. */
export const tCategory=(text:string)=>{
 const category=catalogParent(text);
 return category?(language==='en'?category.english:category.label):t(text);
};
export const getLanguage = () => language;
export function setLanguage(next: Language) {
 if (next === language) return;
 language = next;
 if (typeof document !== 'undefined') document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
 try { localStorage.setItem(key, next); } catch { /* Switching still works for this page. */ }
 listeners.forEach(listener => listener());
}
export function useLanguage() { return useSyncExternalStore(subscribe, getLanguage, () => 'zh' as Language); }
export function initializeInterfaceLanguage() { document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN'; }
