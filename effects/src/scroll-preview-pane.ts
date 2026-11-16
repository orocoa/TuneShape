import {createContext} from 'react';

// Only standalone scrolling previews register a pane and set its initial reading position.
export const ScrollPreviewPane = createContext<((pane: HTMLDivElement, stopScroll?: () => void) => boolean) | null>(null);
