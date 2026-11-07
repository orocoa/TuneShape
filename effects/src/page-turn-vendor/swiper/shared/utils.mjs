function classesToTokens(classes = '') {
    return classes
        .trim()
        .split(' ')
        .filter((c) => !!c.trim());
}

function deleteProps(obj) {
    Object.keys(obj).forEach((key) => {
        try {
            obj[key] = null;
        }
        catch {
            // no getter for object
        }
        try {
            delete obj[key];
        }
        catch {
            // something got wrong
        }
    });
}
function nextTick(callback, delay = 0) {
    return setTimeout(callback, delay);
}
function now() {
    return Date.now();
}
function getComputedStyle(el) {
    return window.getComputedStyle(el, null);
}
function getTranslate(el, axis = 'x') {
    const style = getComputedStyle(el);
    const transform = style.transform || style.webkitTransform;
    if (!transform || transform === 'none')
        return 0;
    const matrix = new DOMMatrixReadOnly(transform);
    return axis === 'x' ? matrix.m41 : matrix.m42;
}
function isObject(o) {
    // `constructor === Object` would be false for a plain object created in another realm
    // (params built in the parent page, Swiper running inside an iframe), which makes extend()
    // replace a nested defaults object instead of merging into it.
    return (typeof o === 'object' &&
        o !== null &&
        !!o.constructor &&
        Object.prototype.toString.call(o).slice(8, -1) === 'Object');
}
function isHTMLElement(el) {
    // A bare `instanceof HTMLElement` is false for an element from another window (same-origin
    // iframe, e.g. the WordPress block editor canvas), so check against the element's own realm.
    if (!el || typeof el !== 'object')
        return false;
    const view = el.ownerDocument?.defaultView;
    const Ctor = view?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : undefined);
    return !!Ctor && el instanceof Ctor;
}
function isNode(node) {
    if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement)
        return true;
    return (!!node &&
        typeof node === 'object' &&
        (node.nodeType === 1 || node.nodeType === 11));
}
function extend(target, ...sources) {
    const to = Object(target);
    for (let i = 0; i < sources.length; i += 1) {
        const nextSource = sources[i];
        if (nextSource === undefined || nextSource === null || isNode(nextSource))
            continue;
        const sourceObj = nextSource;
        const keysArray = Object.keys(Object(sourceObj));
        for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            const nextKey = keysArray[nextIndex];
            if (nextKey === '__proto__' || nextKey === 'constructor' || nextKey === 'prototype') {
                continue;
            }
            const desc = Object.getOwnPropertyDescriptor(sourceObj, nextKey);
            if (!desc || !desc.enumerable)
                continue;
            const sourceVal = sourceObj[nextKey];
            if (isObject(to[nextKey]) && isObject(sourceVal)) {
                if (sourceVal.__swiper__) {
                    to[nextKey] = sourceVal;
                }
                else {
                    extend(to[nextKey], sourceVal);
                }
            }
            else if (!isObject(to[nextKey]) && isObject(sourceVal)) {
                to[nextKey] = {};
                if (sourceVal.__swiper__) {
                    to[nextKey] = sourceVal;
                }
                else {
                    extend(to[nextKey], sourceVal);
                }
            }
            else {
                to[nextKey] = sourceVal;
            }
        }
    }
    return to;
}
function setCSSProperty(el, varName, varValue) {
    el.style.setProperty(varName, varValue);
}
function getSlideTransformEl(slideEl) {
    const direct = slideEl.querySelector('.swiper-slide-transform');
    if (direct)
        return direct;
    if (slideEl.shadowRoot) {
        const shadowed = slideEl.shadowRoot.querySelector('.swiper-slide-transform');
        if (shadowed)
            return shadowed;
    }
    return slideEl;
}
function elementChildren(element, selector = '') {
    const children = [...element.children];
    if (element instanceof HTMLSlotElement) {
        children.push(...element.assignedElements());
    }
    return selector ? children.filter((el) => el.matches(selector)) : children;
}
function elementIsChildOfSlot(el, slot) {
    const queue = [slot];
    while (queue.length > 0) {
        const cur = queue.shift();
        if (el === cur)
            return true;
        queue.push(...cur.children, ...(cur.shadowRoot ? cur.shadowRoot.children : []), ...(cur.assignedElements
            ? cur.assignedElements()
            : []));
    }
    return false;
}
function elementIsChildOf(el, parent) {
    let isChild = parent.contains(el);
    if (!isChild && parent instanceof HTMLSlotElement) {
        const children = [...parent.assignedElements()];
        isChild = children.includes(el);
        if (!isChild)
            isChild = elementIsChildOfSlot(el, parent);
    }
    return isChild;
}
function showWarning(text) {
    try {
        console.warn(text);
    }
    catch {
        // err
    }
}
function createElement(tag, classes = []) {
    const el = document.createElement(tag);
    el.classList.add(...(Array.isArray(classes) ? classes : classesToTokens(classes)));
    return el;
}
// Viewport-relative on purpose: every caller either compares against viewport quantities
// or adds window.scrollX/Y itself, so folding the scroll offset in here double-counts.
function elementOffset(el) {
    const box = el.getBoundingClientRect();
    return {
        top: box.top - (el.clientTop || 0),
        left: box.left - (el.clientLeft || 0),
    };
}
function elementPrevAll(el, selector) {
    const prevEls = [];
    let prev = el.previousElementSibling;
    while (prev) {
        if (!selector || prev.matches(selector))
            prevEls.push(prev);
        prev = prev.previousElementSibling;
    }
    return prevEls;
}
function elementNextAll(el, selector) {
    const nextEls = [];
    let next = el.nextElementSibling;
    while (next) {
        if (!selector || next.matches(selector))
            nextEls.push(next);
        next = next.nextElementSibling;
    }
    return nextEls;
}
function elementStyle(el, prop) {
    return window.getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
    if (!el || !el.parentNode)
        return undefined;
    return [...el.parentNode.children].indexOf(el);
}
function elementParents(el, selector) {
    const parents = [];
    let parent = el.parentElement;
    while (parent) {
        if (!selector || parent.matches(selector))
            parents.push(parent);
        parent = parent.parentElement;
    }
    return parents;
}
function elementTransitionEnd(el, callback) {
    if (!callback)
        return;
    el.addEventListener('transitionend', function fireCallBack(e) {
        if (e.target !== el)
            return;
        el.removeEventListener('transitionend', fireCallBack);
        callback.call(el, e);
    });
}
function elementOuterSize(el, size, includeMargins) {
    {
        const style = window.getComputedStyle(el, null);
        return (el[size === 'width' ? 'offsetWidth' : 'offsetHeight'] +
            parseFloat(style.getPropertyValue(size === 'width' ? 'margin-right' : 'margin-top')) +
            parseFloat(style.getPropertyValue(size === 'width' ? 'margin-left' : 'margin-bottom')));
    }
}
function makeElementsArray(el) {
    return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
}
function getRotateFix(swiper) {
    return (v) => {
        if (Math.abs(v) > 0 && swiper.browser && swiper.browser.need3dFix && Math.abs(v) % 90 === 0) {
            return v + 0.001;
        }
        return v;
    };
}
function setInnerHTML(el, html = '') {
    const tt = globalThis.trustedTypes;
    if (typeof tt !== 'undefined') {
        el.innerHTML = tt.createPolicy('html', { createHTML: (s) => s }).createHTML(html);
    }
    else {
        el.innerHTML = html;
    }
}

export { createElement as a, elementIndex as b, classesToTokens as c, deleteProps as d, elementChildren as e, elementIsChildOf as f, elementNextAll as g, elementOffset as h, elementOuterSize as i, elementParents as j, elementPrevAll as k, elementStyle as l, elementTransitionEnd as m, extend as n, getRotateFix as o, getSlideTransformEl as p, getTranslate as q, isHTMLElement as r, isObject as s, makeElementsArray as t, nextTick as u, now as v, setCSSProperty as w, setInnerHTML as x, showWarning as y };
