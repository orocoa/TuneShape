import { p as getSlideTransformEl, a as createElement } from './utils.mjs';

function createShadow(suffix, slideEl, side) {
    const shadowClass = `swiper-slide-shadow${side ? `-${side}` : ''}${suffix ? ` swiper-slide-shadow-${suffix}` : ''}`;
    const shadowContainer = getSlideTransformEl(slideEl);
    const selector = `.${shadowClass.split(' ').join('.')}`;
    const existing = shadowContainer.querySelector(selector);
    if (existing)
        return existing;
    const created = createElement('div', shadowClass.split(' '));
    shadowContainer.append(created);
    return created;
}

export { createShadow as c };
