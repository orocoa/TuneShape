import { p as getSlideTransformEl } from './utils.mjs';

function effectTarget(_effectParams, slideEl) {
    const transformEl = getSlideTransformEl(slideEl);
    if (transformEl !== slideEl) {
        transformEl.style.backfaceVisibility = 'hidden';
        transformEl.style.setProperty('-webkit-backface-visibility', 'hidden');
    }
    return transformEl;
}

export { effectTarget as e };
