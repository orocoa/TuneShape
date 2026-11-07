import { n as extend, l as elementStyle, v as now, u as nextTick, f as elementIsChildOf, y as showWarning, e as elementChildren, a as createElement, j as elementParents, q as getTranslate, w as setCSSProperty, i as elementOuterSize, g as elementNextAll, k as elementPrevAll, b as elementIndex, r as isHTMLElement, d as deleteProps } from './utils.mjs';

let supportCached;
function calcSupport() {
    if (typeof window === 'undefined')
        return { touch: false };
    return {
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
}
function getSupport() {
    if (!supportCached)
        supportCached = calcSupport();
    return supportCached;
}

let deviceCached;
function calcDevice({ userAgent } = {}) {
    if (typeof window === 'undefined')
        return { ios: false, android: false };
    const support = getSupport();
    const platform = navigator.platform;
    const ua = userAgent || navigator.userAgent;
    const device = { ios: false, android: false };
    const isAndroid = /(Android);?[\s/]+([\d.]+)?/.test(ua);
    const isIPhoneOrIPod = /(iPhone\sOS|iOS|iPod)/.test(ua);
    const isIPadDirect = /iPad/.test(ua);
    // iPad on iPadOS 13+ reports as MacIntel; distinguish from a real Mac by touch capability.
    const isIPadMasquerade = platform === 'MacIntel' && support.touch && navigator.maxTouchPoints > 1;
    const isIPad = isIPadDirect || isIPadMasquerade;
    const isWindows = platform === 'Win32';
    if (isAndroid && !isWindows) {
        device.os = 'android';
        device.android = true;
    }
    if (isIPad || isIPhoneOrIPod) {
        device.os = 'ios';
        device.ios = true;
    }
    return device;
}
function getDevice(overrides = {}) {
    if (!deviceCached)
        deviceCached = calcDevice(overrides);
    return deviceCached;
}

let browserCached;
function calcBrowser() {
    if (typeof window === 'undefined') {
        return { isSafari: false, isWebView: false, need3dFix: false };
    }
    const device = getDevice();
    const ua = navigator.userAgent;
    const uaLower = ua.toLowerCase();
    const isSafari = uaLower.includes('safari') && !uaLower.includes('chrome') && !uaLower.includes('android');
    const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);
    // 3D transform glitches still affect iOS WebView and Safari at the baseline (16.4+).
    const need3dFix = isSafari || (isWebView && device.ios);
    return { isSafari, isWebView, need3dFix };
}
function getBrowser() {
    if (!browserCached)
        browserCached = calcBrowser();
    return browserCached;
}

const processLazyPreloader = (swiper, imageEl) => {
    if (!swiper || swiper.destroyed || !swiper.params || !swiper.params.lazyPreload)
        return;
    const slideSelector = () => (swiper.isElement ? 'swiper-slide' : `.${swiper.params.slideClass}`);
    const slideEl = imageEl.closest(slideSelector());
    if (slideEl) {
        let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
        if (!lazyEl && swiper.isElement) {
            if (slideEl.shadowRoot) {
                lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            }
            else {
                requestAnimationFrame(() => {
                    if (slideEl.shadowRoot) {
                        const innerLazy = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                        if (innerLazy && !innerLazy.lazyPreloaderManaged)
                            innerLazy.remove();
                    }
                });
            }
        }
        if (lazyEl && !lazyEl.lazyPreloaderManaged)
            lazyEl.remove();
    }
};
const unlazy = (swiper, index) => {
    if (!swiper.slides[index])
        return;
    const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
    if (imageEl)
        imageEl.removeAttribute('loading');
};
const preload = (swiper) => {
    if (!swiper || swiper.destroyed || !swiper.params || !swiper.params.lazyPreload)
        return;
    let amount = swiper.params.lazyPreloadPrevNext;
    const len = swiper.slides.length;
    if (!len || !amount || amount < 0)
        return;
    amount = Math.min(amount, len);
    const slidesPerView = swiper.params.slidesPerView === 'auto'
        ? swiper.slidesPerViewDynamic()
        : Math.ceil(swiper.params.slidesPerView);
    const activeIndex = swiper.activeIndex;
    if (swiper.params.grid && (swiper.params.grid.rows ?? 1) > 1) {
        const activeColumn = activeIndex;
        const preloadColumns = [activeColumn - amount];
        preloadColumns.push(...Array.from({ length: amount }).map((_, i) => activeColumn + slidesPerView + i));
        swiper.slides.forEach((slideEl, i) => {
            if (slideEl.column !== undefined && preloadColumns.includes(slideEl.column))
                unlazy(swiper, i);
        });
        return;
    }
    const slideIndexLastInView = activeIndex + slidesPerView - 1;
    if (swiper.params.rewind || swiper.params.loop) {
        for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
            const realIndex = ((i % len) + len) % len;
            if (realIndex < activeIndex || realIndex > slideIndexLastInView)
                unlazy(swiper, realIndex);
        }
    }
    else {
        for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
            if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
                unlazy(swiper, i);
            }
        }
    }
};

function getBreakpoint(breakpoints, base = 'window', containerEl) {
    if (!breakpoints || (base === 'container' && !containerEl))
        return undefined;
    let breakpoint = false;
    const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
    const points = Object.keys(breakpoints).map((point) => {
        if (typeof point === 'string' && point.indexOf('@') === 0) {
            const minRatio = parseFloat(point.substr(1));
            const value = currentHeight * minRatio;
            return { value, point };
        }
        return { value: point, point };
    });
    points.sort((a, b) => parseInt(String(a.value), 10) - parseInt(String(b.value), 10));
    for (let i = 0; i < points.length; i += 1) {
        const { point, value } = points[i];
        if (base === 'window') {
            if (window.matchMedia(`(min-width: ${value}px)`).matches) {
                breakpoint = point;
            }
        }
        else if (value <= containerEl.clientWidth) {
            breakpoint = point;
        }
    }
    return breakpoint || 'max';
}

const isGridEnabled = (swiper, params) => {
    return !!(swiper.grid && params.grid && params.grid.rows > 1);
};
function setBreakpoint() {
    const swiper = this;
    const { realIndex, initialized, params, el } = swiper;
    const breakpoints = params.breakpoints;
    if (!breakpoints || (breakpoints && Object.keys(breakpoints).length === 0))
        return;
    // Get breakpoint for window/container width and update parameters
    const breakpointsBase = params.breakpointsBase === 'window' || !params.breakpointsBase
        ? params.breakpointsBase
        : 'container';
    const breakpointContainer = ['window', 'container'].includes(params.breakpointsBase) || !params.breakpointsBase
        ? swiper.el
        : document.querySelector(params.breakpointsBase);
    const breakpoint = swiper.getBreakpoint(breakpoints, breakpointsBase, breakpointContainer);
    if (!breakpoint || swiper.currentBreakpoint === breakpoint)
        return;
    const breakpointsRecord = breakpoints;
    const breakpointOnlyParams = breakpoint in breakpointsRecord ? breakpointsRecord[breakpoint] : undefined;
    const breakpointParams = breakpointOnlyParams || swiper.originalParams;
    const wasMultiRow = isGridEnabled(swiper, params);
    const isMultiRow = isGridEnabled(swiper, breakpointParams);
    const wasGrabCursor = swiper.params.grabCursor;
    const isGrabCursor = breakpointParams.grabCursor;
    const wasEnabled = params.enabled;
    if (wasMultiRow && !isMultiRow) {
        el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
        swiper.emitContainerClasses();
    }
    else if (!wasMultiRow && isMultiRow) {
        el.classList.add(`${params.containerModifierClass}grid`);
        if ((breakpointParams.grid.fill && breakpointParams.grid.fill === 'column') ||
            (!breakpointParams.grid.fill && params.grid.fill === 'column')) {
            el.classList.add(`${params.containerModifierClass}grid-column`);
        }
        swiper.emitContainerClasses();
    }
    if (wasGrabCursor && !isGrabCursor) {
        swiper.unsetGrabCursor();
    }
    else if (!wasGrabCursor && isGrabCursor) {
        swiper.setGrabCursor();
    }
    const moduleOpt = (opts, prop) => opts[prop];
    ['navigation', 'pagination', 'scrollbar'].forEach((prop) => {
        const bpOpts = moduleOpt(breakpointParams, prop);
        if (typeof bpOpts === 'undefined')
            return;
        const paramsOpts = moduleOpt(params, prop);
        const wasModuleEnabled = typeof paramsOpts === 'object' && paramsOpts !== null && paramsOpts.enabled;
        const isModuleEnabled = typeof bpOpts === 'object' && bpOpts !== null && bpOpts.enabled;
        const moduleApi = swiper[prop];
        if (wasModuleEnabled && !isModuleEnabled)
            moduleApi?.disable?.();
        if (!wasModuleEnabled && isModuleEnabled)
            moduleApi?.enable?.();
    });
    const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
    const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
    const wasLoop = params.loop;
    if (directionChanged && initialized) {
        swiper.changeDirection();
    }
    extend(swiper.params, breakpointParams);
    const isEnabled = swiper.params.enabled;
    const hasLoop = swiper.params.loop;
    Object.assign(swiper, {
        allowTouchMove: swiper.params.allowTouchMove,
        allowSlideNext: swiper.params.allowSlideNext,
        allowSlidePrev: swiper.params.allowSlidePrev,
    });
    if (wasEnabled && !isEnabled) {
        swiper.disable();
    }
    else if (!wasEnabled && isEnabled) {
        swiper.enable();
    }
    swiper.currentBreakpoint = breakpoint;
    swiper.emit('_beforeBreakpoint', breakpointParams);
    if (initialized) {
        // Lay out with the new params before loopCreate(), so loopFix() sees current sizes and
        // isLocked state (a slider locked by watchOverflow skips loop entirely, #8228)
        if (needsReLoop) {
            swiper.loopDestroy();
            swiper.updateSlides();
            swiper.loopCreate(realIndex);
        }
        else if (!wasLoop && hasLoop) {
            swiper.updateSlides();
            swiper.loopCreate(realIndex);
        }
        else if (wasLoop && !hasLoop) {
            swiper.loopDestroy();
        }
    }
    swiper.emit('breakpoint', breakpointParams);
}

var breakpoints = { setBreakpoint, getBreakpoint };

function checkOverflow() {
    const swiper = this;
    const { isLocked: wasLocked, params } = swiper;
    const { slidesOffsetBefore } = params;
    if (slidesOffsetBefore) {
        const lastSlideIndex = swiper.slides.length - 1;
        const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] +
            swiper.slidesSizesGrid[lastSlideIndex] +
            slidesOffsetBefore * 2;
        swiper.isLocked = swiper.size > lastSlideRightEdge;
    }
    else {
        swiper.isLocked = swiper.snapGrid.length === 1;
    }
    if (params.allowSlideNext === true) {
        swiper.allowSlideNext = !swiper.isLocked;
    }
    if (params.allowSlidePrev === true) {
        swiper.allowSlidePrev = !swiper.isLocked;
    }
    if (wasLocked && wasLocked !== swiper.isLocked) {
        swiper.isEnd = false;
    }
    if (wasLocked !== swiper.isLocked) {
        swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
    }
}
var checkOverflow$1 = { checkOverflow };

function prepareClasses(entries, prefix) {
    const resultClasses = [];
    entries.forEach((item) => {
        if (typeof item === 'object') {
            Object.keys(item).forEach((classNames) => {
                if (item[classNames]) {
                    resultClasses.push(prefix + classNames);
                }
            });
        }
        else if (typeof item === 'string') {
            resultClasses.push(prefix + item);
        }
    });
    return resultClasses;
}
function addClasses() {
    const swiper = this;
    const { classNames, params, rtl, el, device } = swiper;
    // oxfmt-ignore
    const suffixes = prepareClasses([
        'initialized',
        params.direction,
        { 'free-mode': swiper.params.freeMode && params.freeMode.enabled },
        { 'autoheight': params.autoHeight },
        { 'rtl': rtl },
        { 'grid': params.grid && params.grid.rows > 1 },
        { 'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column' },
        { 'android': device.android },
        { 'ios': device.ios },
        { 'css-mode': params.cssMode },
        { 'centered': params.cssMode && params.centeredSlides },
        { 'watch-progress': params.watchSlidesProgress },
    ], params.containerModifierClass);
    classNames.push(...suffixes);
    el.classList.add(...classNames);
    swiper.emitContainerClasses();
}

function removeClasses() {
    const swiper = this;
    const { el, classNames } = swiper;
    if (!el || typeof el === 'string')
        return;
    el.classList.remove(...classNames);
    swiper.emitContainerClasses();
}

var classes = { addClasses, removeClasses };

const defaults = {
    init: true,
    direction: 'horizontal',
    oneWayMovement: false,
    swiperElementNodeName: 'SWIPER-CONTAINER',
    touchEventsTarget: 'wrapper',
    initialSlide: 0,
    speed: 300,
    cssMode: false,
    updateOnWindowResize: true,
    resizeObserver: true,
    nested: false,
    createElements: false,
    eventsPrefix: 'swiper',
    enabled: true,
    focusableElements: 'input, select, option, textarea, button, video, label',
    // Overrides
    width: null,
    height: null,
    //
    preventInteractionOnTransition: false,
    // ssr
    userAgent: null,
    url: null,
    // To support iOS's swipe-to-go-back gesture (when being used in-app).
    edgeSwipeDetection: false,
    edgeSwipeThreshold: 20,
    // Autoheight
    autoHeight: false,
    // Set wrapper width
    setWrapperSize: false,
    // Virtual Translate
    virtualTranslate: false,
    // Effects
    effect: 'slide',
    // Breakpoints
    breakpoints: undefined,
    breakpointsBase: 'window',
    // Slides grid
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerGroup: 1,
    slidesPerGroupSkip: 0,
    slidesPerGroupAuto: false,
    centeredSlides: false,
    centeredSlidesBounds: false,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    normalizeSlideIndex: true,
    centerInsufficientSlides: false,
    snapToSlideEdge: false,
    // Disable swiper and hide navigation when container not overflow
    watchOverflow: true,
    // Round length
    roundLengths: false,
    // Touches
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: true,
    shortSwipes: true,
    longSwipes: true,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,
    followFinger: true,
    allowTouchMove: true,
    threshold: 5,
    touchMoveStopPropagation: false,
    touchStartPreventDefault: true,
    touchStartForcePreventDefault: false,
    touchReleaseOnEdges: false,
    // Unique Navigation Elements
    uniqueNavElements: true,
    // Resistance
    resistance: true,
    resistanceRatio: 0.85,
    // Progress
    watchSlidesProgress: false,
    // Cursor
    grabCursor: false,
    // Clicks
    preventClicks: true,
    preventClicksPropagation: true,
    slideToClickedSlide: false,
    // loop
    loop: false,
    loopAddBlankSlides: true,
    loopAdditionalSlides: 0,
    loopPreventsSliding: true,
    // rewind
    rewind: false,
    // Swiping/no swiping
    allowSlidePrev: true,
    allowSlideNext: true,
    swipeHandler: null,
    noSwiping: true,
    noSwipingClass: 'swiper-no-swiping',
    noSwipingSelector: null,
    // Passive Listeners
    passiveListeners: true,
    maxBackfaceHiddenSlides: 10,
    // NS
    containerModifierClass: 'swiper-',
    slideClass: 'swiper-slide',
    slideBlankClass: 'swiper-slide-blank',
    slideActiveClass: 'swiper-slide-active',
    slideVisibleClass: 'swiper-slide-visible',
    slideFullyVisibleClass: 'swiper-slide-fully-visible',
    slideNextClass: 'swiper-slide-next',
    slidePrevClass: 'swiper-slide-prev',
    wrapperClass: 'swiper-wrapper',
    lazyPreload: true,
    lazyPreloaderClass: 'swiper-lazy-preloader',
    lazyPreloadPrevNext: 0,
    // Callbacks
    runCallbacksOnInit: true,
    // Internals
    _emitClasses: false,
};

var eventsEmitter = {
    on(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed)
            return self;
        if (typeof handler !== 'function')
            return self;
        const method = priority ? 'unshift' : 'push';
        events.split(' ').forEach((event) => {
            if (!self.eventsListeners[event])
                self.eventsListeners[event] = [];
            self.eventsListeners[event][method](handler);
        });
        return self;
    },
    once(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed)
            return self;
        if (typeof handler !== 'function')
            return self;
        const onceHandler = function onceHandlerFn(...args) {
            self.off(events, onceHandler);
            if (onceHandler.__emitterProxy) {
                delete onceHandler.__emitterProxy;
            }
            handler.apply(self, args);
        };
        onceHandler.__emitterProxy = handler;
        return self.on(events, onceHandler, priority);
    },
    onAny(handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed)
            return self;
        if (typeof handler !== 'function')
            return self;
        const method = priority ? 'unshift' : 'push';
        if (self.eventsAnyListeners.indexOf(handler) < 0) {
            self.eventsAnyListeners[method](handler);
        }
        return self;
    },
    offAny(handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed)
            return self;
        if (!self.eventsAnyListeners)
            return self;
        const index = self.eventsAnyListeners.indexOf(handler);
        if (index >= 0) {
            self.eventsAnyListeners.splice(index, 1);
        }
        return self;
    },
    off(events, handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed)
            return self;
        if (!self.eventsListeners)
            return self;
        events.split(' ').forEach((event) => {
            if (typeof handler === 'undefined') {
                self.eventsListeners[event] = [];
            }
            else if (self.eventsListeners[event]) {
                self.eventsListeners[event].forEach((eventHandler, index) => {
                    if (eventHandler === handler ||
                        (eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler)) {
                        self.eventsListeners[event].splice(index, 1);
                    }
                });
            }
        });
        return self;
    },
    emit(...args) {
        const self = this;
        if (!self.eventsListeners || self.destroyed)
            return self;
        if (!self.eventsListeners)
            return self;
        let events;
        let data;
        let context;
        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
            events = args[0];
            data = args.slice(1, args.length);
            context = self;
        }
        else {
            const opts = args[0];
            events = opts.events;
            data = opts.data ?? [];
            context = opts.context || self;
        }
        data.unshift(context);
        const eventsArray = Array.isArray(events) ? events : events.split(' ');
        eventsArray.forEach((event) => {
            if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
                self.eventsAnyListeners.forEach((eventHandler) => {
                    eventHandler.apply(context, [event, ...data]);
                });
            }
            if (self.eventsListeners && self.eventsListeners[event]) {
                self.eventsListeners[event].forEach((eventHandler) => {
                    eventHandler.apply(context, data);
                });
            }
        });
        return self;
    },
};

function onClick(e) {
    const swiper = this;
    if (swiper.destroyed)
        return;
    if (!swiper.enabled)
        return;
    if (!swiper.allowClick) {
        if (swiper.params.preventClicks)
            e.preventDefault();
        if (swiper.params.preventClicksPropagation && swiper.animating) {
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }
}

function onDocumentTouchStart() {
    const swiper = this;
    if (swiper.destroyed)
        return;
    if (swiper.documentTouchHandlerProceeded)
        return;
    swiper.documentTouchHandlerProceeded = true;
    if (swiper.params.touchReleaseOnEdges) {
        swiper.el.style.touchAction = 'auto';
    }
}

function onLoad(e) {
    const swiper = this;
    if (swiper.destroyed)
        return;
    processLazyPreloader(swiper, e.target);
    if (e.type === 'error' ||
        swiper.params.cssMode ||
        (swiper.params.slidesPerView !== 'auto' && !swiper.params.autoHeight)) {
        return;
    }
    swiper.update();
}

function onResize() {
    const swiper = this;
    const { params, el } = swiper;
    if (el && el.offsetWidth === 0)
        return;
    // updateSlides() measures slides with their margins reset, and WebKit re-snaps the wrapper after
    // that layout - applying it after the re-seat below, short of the slide by the margins before it.
    // Keep snapping off until the next frame, as slideTo() does for virtual slides.
    const { wrapperEl } = swiper;
    const snapType = params.cssMode && wrapperEl ? wrapperEl.style.scrollSnapType : 'none';
    if (snapType !== 'none') {
        wrapperEl.style.scrollSnapType = 'none';
        requestAnimationFrame(() => {
            if (!swiper.destroyed)
                wrapperEl.style.scrollSnapType = snapType;
        });
    }
    // Breakpoints
    if (params.breakpoints) {
        swiper.setBreakpoint();
    }
    // Save locks
    const { allowSlideNext, allowSlidePrev, snapGrid } = swiper;
    const isVirtual = swiper.virtual && swiper.params.virtual?.enabled;
    // Disable locks on resize
    swiper.allowSlideNext = true;
    swiper.allowSlidePrev = true;
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateSlidesClasses();
    const isVirtualLoop = isVirtual && params.loop;
    if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) &&
        swiper.isEnd &&
        !swiper.isBeginning &&
        !swiper.params.centeredSlides &&
        !isVirtualLoop) {
        const slidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
        swiper.slideTo(slidesLength - 1, 0, false, true);
    }
    else {
        if (swiper.params.loop && !isVirtual) {
            swiper.slideToLoop(swiper.realIndex, 0, false, true);
        }
        else {
            swiper.slideTo(swiper.activeIndex, 0, false, true);
        }
    }
    // In cssMode the re-seat only writes the scroll position, and where the browser had already put
    // the wrapper there no scroll event follows to bring translate and progress up to date.
    if (params.cssMode && swiper.onScroll)
        swiper.onScroll();
    if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        const autoplay = swiper.autoplay;
        clearTimeout(autoplay.resizeTimeout);
        autoplay.resizeTimeout = setTimeout(() => {
            if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
                swiper.autoplay.resume();
            }
        }, 500);
    }
    // Return locks after resize
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
        swiper.checkOverflow();
    }
}

function measureSize(swiper) {
    let width;
    let height;
    const el = swiper.el;
    if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
        width = swiper.params.width;
    }
    else {
        width = el.clientWidth;
    }
    if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
        height = swiper.params.height;
    }
    else {
        height = el.clientHeight;
    }
    if ((width === 0 && swiper.isHorizontal()) || (height === 0 && swiper.isVertical())) {
        return null;
    }
    // Subtract paddings
    width =
        width -
            parseInt(elementStyle(el, 'padding-left') || '0', 10) -
            parseInt(elementStyle(el, 'padding-right') || '0', 10);
    height =
        height -
            parseInt(elementStyle(el, 'padding-top') || '0', 10) -
            parseInt(elementStyle(el, 'padding-bottom') || '0', 10);
    if (Number.isNaN(width))
        width = 0;
    if (Number.isNaN(height))
        height = 0;
    return { width, height };
}
// Whether the container changed size along the slider since updateSize(), with the ResizeObserver
// still to hand the change to onResize() on the next animation frame.
function isResizePending(swiper) {
    const { params, el } = swiper;
    if (!params.updateOnWindowResize ||
        !params.resizeObserver ||
        typeof window.ResizeObserver === 'undefined') {
        return false;
    }
    const isH = swiper.isHorizontal();
    const clientSize = isH ? el.clientWidth : el.clientHeight;
    if (clientSize === swiper._clientSize)
        return false;
    // clientWidth includes the padding, the ResizeObserver only sees the content box: a padding
    // change alone leaves the slide grid as it was, and no onResize() follows to measure it.
    const measured = measureSize(swiper);
    if (!measured || (isH ? measured.width : measured.height) !== swiper.size)
        return true;
    swiper._clientSize = clientSize;
    return false;
}
function updateSize() {
    const swiper = this;
    const el = swiper.el;
    const measured = measureSize(swiper);
    if (!measured)
        return;
    const { width, height } = measured;
    Object.assign(swiper, {
        width,
        height,
        size: swiper.isHorizontal() ? width : height,
        _clientSize: swiper.isHorizontal() ? el.clientWidth : el.clientHeight,
    });
}

function onScroll() {
    const swiper = this;
    if (swiper.destroyed)
        return;
    const { wrapperEl, rtlTranslate, enabled } = swiper;
    if (!enabled)
        return;
    // A resize moves the scroll position (re-snap, clamp) before onResize() measures the new layout;
    // read against the old slide grid it names another slide. Leave it to onResize(), which keeps
    // the slider on its slide. Browsers fire it before or after the ResizeObserver, so check the size.
    if (isResizePending(swiper))
        return;
    swiper.previousTranslate = swiper.translate;
    if (swiper.isHorizontal()) {
        swiper.translate = -wrapperEl.scrollLeft;
    }
    else {
        swiper.translate = -wrapperEl.scrollTop;
    }
    if (swiper.translate === 0)
        swiper.translate = 0;
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
    let newProgress;
    const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    if (translatesDiff === 0) {
        newProgress = 0;
    }
    else {
        newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
    }
    if (newProgress !== swiper.progress) {
        swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
    }
    swiper.emit('setTranslate', swiper.translate, false);
}

function onTouchEnd(event) {
    const swiper = this;
    if (swiper.destroyed)
        return;
    const data = swiper.touchEventsData;
    let e = event.originalEvent ?? event;
    const isTouchEvent = e.type === 'touchend' || e.type === 'touchcancel';
    if (!isTouchEvent) {
        if (data.touchId !== null)
            return; // return from pointer if we use touch
        const pe = e;
        if (pe.pointerId !== data.pointerId)
            return;
    }
    else {
        const te = e;
        const found = [...te.changedTouches].find((t) => t.identifier === data.touchId);
        if (!found || found.identifier !== data.touchId)
            return;
    }
    if (['pointercancel', 'pointerout', 'pointerleave', 'contextmenu'].includes(e.type)) {
        const proceed = ['pointercancel', 'contextmenu'].includes(e.type) &&
            (swiper.browser.isSafari || swiper.browser.isWebView);
        if (!proceed) {
            return;
        }
    }
    data.pointerId = null;
    data.touchId = null;
    data.startEventPath = undefined;
    data.lastMoveEvent = undefined;
    const { params, touches, rtlTranslate: rtl, slidesGrid, enabled } = swiper;
    if (!enabled)
        return;
    if (!params.simulateTouch && e.pointerType === 'mouse')
        return;
    if (data.allowTouchCallbacks) {
        swiper.emit('touchEnd', e);
    }
    data.allowTouchCallbacks = false;
    if (!data.isTouched) {
        if (data.isMoved && params.grabCursor) {
            swiper.setGrabCursor(false);
        }
        data.isMoved = false;
        data.startMoving = false;
        return;
    }
    // Return Grab Cursor
    if (params.grabCursor &&
        data.isMoved &&
        data.isTouched &&
        (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(false);
    }
    // Time diff
    const touchEndTime = now();
    const timeDiff = touchEndTime - data.touchStartTime;
    // Tap, doubleTap, Click
    if (swiper.allowClick) {
        // Legacy `e.path` was a non-standard Chrome extension; `composedPath()` is the modern API.
        const pathTree = e.path ?? (e.composedPath && e.composedPath());
        swiper.updateClickedSlide((pathTree && pathTree[0]), pathTree);
        swiper.emit('tap click', e);
        if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
            swiper.emit('doubleTap doubleClick', e);
        }
    }
    data.lastClickTime = now();
    nextTick(() => {
        if (!swiper.destroyed)
            swiper.allowClick = true;
    });
    if (!data.isTouched ||
        !data.isMoved ||
        !swiper.swipeDirection ||
        (touches.diff === 0 && !data.loopSwapReset) ||
        (data.currentTranslate === data.startTranslate && !data.loopSwapReset)) {
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        return;
    }
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    let currentPos;
    if (params.followFinger) {
        currentPos = rtl ? swiper.translate : -swiper.translate;
    }
    else {
        currentPos = -(data.currentTranslate ?? 0);
    }
    if (params.cssMode) {
        return;
    }
    if (params.freeMode && params.freeMode.enabled) {
        swiper.freeMode.onTouchEnd({ currentPos });
        return;
    }
    // Find current slide
    const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
    let stopIndex = 0;
    let groupSize = swiper.slidesSizesGrid[0];
    for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
        const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (typeof slidesGrid[i + increment] !== 'undefined') {
            if (swipeToLast ||
                (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment])) {
                stopIndex = i;
                groupSize = slidesGrid[i + increment] - slidesGrid[i];
            }
        }
        else if (swipeToLast || currentPos >= slidesGrid[i]) {
            stopIndex = i;
            groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
        }
    }
    let rewindFirstIndex = null;
    let rewindLastIndex = null;
    if (params.rewind) {
        if (swiper.isBeginning) {
            rewindLastIndex =
                params.virtual?.enabled && swiper.virtual
                    ? swiper.virtual.slides.length - 1
                    : swiper.slides.length - 1;
        }
        else if (swiper.isEnd) {
            rewindFirstIndex = 0;
        }
    }
    // Find current slide size
    const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
    const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (timeDiff > params.longSwipesMs) {
        // Long touches
        if (!params.longSwipes) {
            swiper.slideTo(swiper.activeIndex);
            return;
        }
        if (swiper.swipeDirection === 'next') {
            if (ratio >= params.longSwipesRatio)
                swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
            else
                swiper.slideTo(stopIndex);
        }
        if (swiper.swipeDirection === 'prev') {
            if (ratio > 1 - params.longSwipesRatio) {
                swiper.slideTo(stopIndex + increment);
            }
            else if (rewindLastIndex !== null &&
                ratio < 0 &&
                Math.abs(ratio) > params.longSwipesRatio) {
                swiper.slideTo(rewindLastIndex);
            }
            else {
                swiper.slideTo(stopIndex);
            }
        }
    }
    else {
        // Short swipes
        if (!params.shortSwipes) {
            swiper.slideTo(swiper.activeIndex);
            return;
        }
        const isNavButtonTarget = swiper.navigation &&
            (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
        if (!isNavButtonTarget) {
            if (swiper.swipeDirection === 'next') {
                swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
            }
            if (swiper.swipeDirection === 'prev') {
                swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
            }
        }
        else if (e.target === swiper.navigation.nextEl) {
            swiper.slideTo(stopIndex + increment);
        }
        else {
            swiper.slideTo(stopIndex);
        }
    }
}

function onTouchMove(event) {
    const swiper = this;
    if (swiper.destroyed)
        return;
    const data = swiper.touchEventsData;
    const { params, touches, rtlTranslate: rtl, enabled } = swiper;
    if (!enabled)
        return;
    if (!params.simulateTouch && event.pointerType === 'mouse')
        return;
    // Legacy event wrappers nest the native event under .originalEvent.
    const wrapped = event;
    const e = wrapped.originalEvent ?? wrapped;
    if (e.type === 'pointermove') {
        if (data.touchId !== null)
            return; // return from pointer if we use touch
        const pe = e;
        if (pe.pointerId !== data.pointerId)
            return;
    }
    let targetTouch;
    if (e.type === 'touchmove') {
        const te = e;
        const found = [...te.changedTouches].find((t) => t.identifier === data.touchId);
        if (!found || found.identifier !== data.touchId)
            return;
        targetTouch = found;
    }
    else {
        targetTouch = e;
    }
    if (!data.isTouched) {
        if (data.startMoving && data.isScrolling) {
            swiper.emit('touchMoveOpposite', e);
        }
        return;
    }
    // Nested swipers listen on document in capture phase, so they run in registration order and
    // an ancestor initialized first would move before its descendant can set
    // preventedByNestedSwiper. Run touched nested descendants first, innermost to outermost.
    if (data.lastMoveEvent === e)
        return;
    data.lastMoveEvent = e;
    for (const node of data.startEventPath ?? []) {
        if (node === swiper.el)
            break;
        const child = node.swiper;
        if (child &&
            child !== swiper &&
            !child.destroyed &&
            child.params.nested &&
            child.touchEventsData.isTouched) {
            child.onTouchMove(event);
        }
    }
    const pageX = targetTouch.pageX;
    const pageY = targetTouch.pageY;
    if (e.preventedByNestedSwiper) {
        touches.startX = pageX;
        touches.startY = pageY;
        return;
    }
    if (!swiper.allowTouchMove) {
        if (!e.target.matches(data.focusableElements)) {
            swiper.allowClick = false;
        }
        if (data.isTouched) {
            Object.assign(touches, {
                startX: pageX,
                startY: pageY,
                currentX: pageX,
                currentY: pageY,
            });
            data.touchStartTime = now();
        }
        return;
    }
    if (params.touchReleaseOnEdges && !params.loop) {
        if (swiper.isVertical()) {
            // Vertical
            if ((pageY < touches.startY && swiper.translate <= swiper.maxTranslate()) ||
                (pageY > touches.startY && swiper.translate >= swiper.minTranslate())) {
                data.isTouched = false;
                data.isMoved = false;
                return;
            }
        }
        else if (rtl &&
            ((pageX > touches.startX && -swiper.translate <= swiper.maxTranslate()) ||
                (pageX < touches.startX && -swiper.translate >= swiper.minTranslate()))) {
            return;
        }
        else if (!rtl &&
            ((pageX < touches.startX && swiper.translate <= swiper.maxTranslate()) ||
                (pageX > touches.startX && swiper.translate >= swiper.minTranslate()))) {
            return;
        }
    }
    if (document.activeElement &&
        document.activeElement.matches(data.focusableElements) &&
        document.activeElement !== e.target &&
        e.pointerType !== 'mouse') {
        document.activeElement.blur();
    }
    if (document.activeElement) {
        if (e.target === document.activeElement &&
            e.target.matches(data.focusableElements)) {
            data.isMoved = true;
            swiper.allowClick = false;
            return;
        }
    }
    if (data.allowTouchCallbacks) {
        swiper.emit('touchMove', e);
    }
    touches.previousX = touches.currentX;
    touches.previousY = touches.currentY;
    touches.currentX = pageX;
    touches.currentY = pageY;
    const diffX = touches.currentX - touches.startX;
    const diffY = touches.currentY - touches.startY;
    if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold)
        return;
    if (typeof data.isScrolling === 'undefined') {
        let touchAngle;
        if ((swiper.isHorizontal() && touches.currentY === touches.startY) ||
            (swiper.isVertical() && touches.currentX === touches.startX)) {
            data.isScrolling = false;
        }
        else {
            if (diffX * diffX + diffY * diffY >= 25) {
                touchAngle = (Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180) / Math.PI;
                data.isScrolling = swiper.isHorizontal()
                    ? touchAngle > params.touchAngle
                    : 90 - touchAngle > params.touchAngle;
            }
        }
    }
    if (data.isScrolling) {
        swiper.emit('touchMoveOpposite', e);
    }
    if (typeof data.startMoving === 'undefined') {
        if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
            data.startMoving = true;
        }
    }
    if (data.isScrolling || (e.type === 'touchmove' && data.preventTouchMoveFromPointerMove)) {
        data.isTouched = false;
        return;
    }
    if (!data.startMoving) {
        return;
    }
    swiper.allowClick = false;
    if (!params.cssMode && e.cancelable) {
        e.preventDefault();
    }
    if (params.touchMoveStopPropagation && !params.nested) {
        e.stopPropagation();
    }
    let diff = swiper.isHorizontal() ? diffX : diffY;
    let touchesDiff = swiper.isHorizontal()
        ? touches.currentX - touches.previousX
        : touches.currentY - touches.previousY;
    if (params.oneWayMovement) {
        diff = Math.abs(diff) * (rtl ? 1 : -1);
        touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
    }
    touches.diff = diff;
    diff *= params.touchRatio;
    if (rtl) {
        diff = -diff;
        touchesDiff = -touchesDiff;
    }
    const prevTouchesDirection = swiper.touchesDirection;
    swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
    swiper.touchesDirection = touchesDiff > 0 ? 'prev' : 'next';
    const isLoop = swiper.params.loop && !params.cssMode;
    const allowLoopFix = (swiper.touchesDirection === 'next' && swiper.allowSlideNext) ||
        (swiper.touchesDirection === 'prev' && swiper.allowSlidePrev);
    if (!data.isMoved) {
        if (isLoop && allowLoopFix) {
            swiper.loopFix({ direction: swiper.swipeDirection });
        }
        data.startTranslate = swiper.getTranslate();
        swiper.setTransition(0);
        if (swiper.animating) {
            const evt = new window.CustomEvent('transitionend', {
                bubbles: true,
                cancelable: true,
                detail: {
                    bySwiperTouchMove: true,
                },
            });
            swiper.wrapperEl.dispatchEvent(evt);
        }
        data.allowMomentumBounce = false;
        // Grab Cursor
        if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
            swiper.setGrabCursor(true);
        }
        swiper.emit('sliderFirstMove', e);
    }
    new Date().getTime();
    if (params._loopSwapReset !== false &&
        data.isMoved &&
        data.allowThresholdMove &&
        prevTouchesDirection !== swiper.touchesDirection &&
        isLoop &&
        allowLoopFix &&
        Math.abs(diff) >= 1) {
        Object.assign(touches, {
            startX: pageX,
            startY: pageY,
            currentX: pageX,
            currentY: pageY,
            startTranslate: data.currentTranslate,
        });
        data.loopSwapReset = true;
        data.startTranslate = data.currentTranslate;
        return;
    }
    swiper.emit('sliderMove', e);
    data.isMoved = true;
    // startTranslate is guaranteed to be set by this point (set in onTouchStart-side init).
    const startTranslate = data.startTranslate ?? 0;
    data.currentTranslate = diff + startTranslate;
    let disableParentSwiper = true;
    let resistanceRatio = params.resistanceRatio;
    if (params.touchReleaseOnEdges) {
        resistanceRatio = 0;
    }
    if (diff > 0) {
        if (isLoop &&
            allowLoopFix &&
            true &&
            data.allowThresholdMove &&
            data.currentTranslate >
                (params.centeredSlides
                    ? swiper.minTranslate() -
                        swiper.slidesSizesGrid[swiper.activeIndex + 1] -
                        (params.slidesPerView !== 'auto' &&
                            swiper.slides.length - params.slidesPerView >= 2
                            ? swiper.slidesSizesGrid[swiper.activeIndex + 1] +
                                swiper.params.spaceBetween
                            : 0) -
                        swiper.params.spaceBetween
                    : swiper.minTranslate())) {
            swiper.loopFix({ direction: 'prev', setTranslate: true, activeSlideIndex: 0 });
        }
        if (data.currentTranslate > swiper.minTranslate()) {
            disableParentSwiper = false;
            if (params.resistance) {
                data.currentTranslate =
                    swiper.minTranslate() -
                        1 +
                        (-swiper.minTranslate() + startTranslate + diff) ** resistanceRatio;
            }
        }
    }
    else if (diff < 0) {
        if (isLoop &&
            allowLoopFix &&
            true &&
            data.allowThresholdMove &&
            data.currentTranslate <
                (params.centeredSlides
                    ? swiper.maxTranslate() +
                        swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] +
                        swiper.params.spaceBetween +
                        (params.slidesPerView !== 'auto' &&
                            swiper.slides.length - params.slidesPerView >= 2
                            ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] +
                                swiper.params.spaceBetween
                            : 0)
                    : swiper.maxTranslate())) {
            swiper.loopFix({
                direction: 'next',
                setTranslate: true,
                activeSlideIndex: swiper.slides.length -
                    (params.slidesPerView === 'auto'
                        ? swiper.slidesPerViewDynamic()
                        : Math.ceil(parseFloat(String(params.slidesPerView)))),
            });
        }
        if (data.currentTranslate < swiper.maxTranslate()) {
            disableParentSwiper = false;
            if (params.resistance) {
                data.currentTranslate =
                    swiper.maxTranslate() +
                        1 -
                        (swiper.maxTranslate() - startTranslate - diff) ** resistanceRatio;
            }
        }
    }
    if (disableParentSwiper) {
        e.preventedByNestedSwiper = true;
    }
    // Directions locks
    if (!swiper.allowSlideNext &&
        swiper.swipeDirection === 'next' &&
        (data.currentTranslate ?? 0) < startTranslate) {
        data.currentTranslate = startTranslate;
    }
    if (!swiper.allowSlidePrev &&
        swiper.swipeDirection === 'prev' &&
        (data.currentTranslate ?? 0) > startTranslate) {
        data.currentTranslate = startTranslate;
    }
    if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
        data.currentTranslate = startTranslate;
    }
    // Threshold
    if (params.threshold > 0) {
        if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
            if (!data.allowThresholdMove) {
                data.allowThresholdMove = true;
                touches.startX = touches.currentX;
                touches.startY = touches.currentY;
                data.currentTranslate = data.startTranslate;
                touches.diff = swiper.isHorizontal()
                    ? touches.currentX - touches.startX
                    : touches.currentY - touches.startY;
                return;
            }
        }
        else {
            data.currentTranslate = data.startTranslate;
            return;
        }
    }
    if (!params.followFinger || params.cssMode)
        return;
    // Update active index in free mode
    if ((params.freeMode && params.freeMode.enabled && swiper.freeMode) ||
        params.watchSlidesProgress) {
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
    }
    if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
        swiper.freeMode.onTouchMove();
    }
    // Update progress
    swiper.updateProgress(data.currentTranslate);
    // Update translate
    swiper.setTranslate(data.currentTranslate ?? 0);
}

// Modified from https://stackoverflow.com/questions/54520554/custom-element-getrootnode-closest-function-crossing-multiple-parent-shadowd
function closestElement(selector, base) {
    function __closestFrom(el) {
        if (!el || el === document || el === window)
            return null;
        let cur = el;
        if (cur.assignedSlot)
            cur = cur.assignedSlot;
        const found = cur.closest(selector);
        if (!found && !cur.getRootNode) {
            return null;
        }
        const root = cur.getRootNode();
        return found || __closestFrom(root.host);
    }
    return __closestFrom(base);
}
function preventEdgeSwipe(swiper, event, startX) {
    const { params } = swiper;
    const edgeSwipeDetection = params.edgeSwipeDetection;
    const edgeSwipeThreshold = params.edgeSwipeThreshold;
    if (edgeSwipeDetection &&
        (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
        if (edgeSwipeDetection === 'prevent') {
            event.preventDefault();
            return true;
        }
        return false;
    }
    return true;
}
function onTouchStart(event) {
    const swiper = this;
    if (swiper.destroyed)
        return;
    const e = event.originalEvent ?? event;
    const data = swiper.touchEventsData;
    if (e.type === 'pointerdown') {
        const pe = e;
        if (data.pointerId !== null && data.pointerId !== pe.pointerId) {
            return;
        }
        data.pointerId = pe.pointerId;
    }
    else if (e.type === 'touchstart' && e.targetTouches.length === 1) {
        data.touchId = e.targetTouches[0].identifier;
    }
    if (e.type === 'touchstart') {
        // don't proceed touch event
        preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
        return;
    }
    const { params, touches, enabled } = swiper;
    if (!enabled)
        return;
    if (!params.simulateTouch && e.pointerType === 'mouse')
        return;
    if (swiper.animating && params.preventInteractionOnTransition) {
        return;
    }
    if (!swiper.animating && params.cssMode && params.loop) {
        swiper.loopFix();
    }
    let targetEl = e.target;
    if (params.touchEventsTarget === 'wrapper') {
        if (!elementIsChildOf(targetEl, swiper.wrapperEl))
            return;
    }
    // Secondary mouse buttons (right-click / middle-click) shouldn't start a swipe.
    const mouseLike = e;
    if (typeof mouseLike.which === 'number' && mouseLike.which === 3)
        return;
    if (typeof mouseLike.button === 'number' && mouseLike.button > 0)
        return;
    if (data.isTouched && data.isMoved)
        return;
    // change target el for shadow root component
    const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';
    // `path` is a non-standard Chrome extension; `composedPath()` is the modern API.
    const eventPath = e.composedPath
        ? e.composedPath()
        : e.path;
    if (swipingClassHasValue &&
        e.target &&
        e.target.shadowRoot &&
        eventPath) {
        targetEl = eventPath[0];
    }
    const noSwipingSelector = params.noSwipingSelector
        ? params.noSwipingSelector
        : `.${params.noSwipingClass}`;
    const isTargetShadow = !!(e.target && e.target.shadowRoot);
    // use closestElement for shadow root element to get the actual closest for nested shadow root element
    if (params.noSwiping &&
        (isTargetShadow
            ? closestElement(noSwipingSelector, targetEl)
            : targetEl.closest(noSwipingSelector))) {
        swiper.allowClick = true;
        return;
    }
    if (params.swipeHandler) {
        if (typeof params.swipeHandler === 'string' && !targetEl.closest(params.swipeHandler))
            return;
    }
    // At this point `e` is a PointerEvent or MouseEvent (touchstart returned earlier).
    const pe = e;
    touches.currentX = pe.pageX;
    touches.currentY = pe.pageY;
    const startX = touches.currentX;
    const startY = touches.currentY;
    // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore
    if (!preventEdgeSwipe(swiper, e, startX)) {
        return;
    }
    Object.assign(data, {
        isTouched: true,
        isMoved: false,
        allowTouchCallbacks: true,
        isScrolling: undefined,
        startMoving: undefined,
    });
    touches.startX = startX;
    touches.startY = startY;
    data.touchStartTime = now();
    data.startEventPath = eventPath;
    swiper.allowClick = true;
    swiper.updateSize();
    swiper.swipeDirection = undefined;
    if (params.threshold > 0)
        data.allowThresholdMove = false;
    let preventDefault = true;
    if (targetEl.matches(data.focusableElements)) {
        preventDefault = false;
        if (targetEl.nodeName === 'SELECT') {
            data.isTouched = false;
        }
    }
    if (document.activeElement &&
        document.activeElement.matches(data.focusableElements) &&
        document.activeElement !== targetEl &&
        (pe.pointerType === 'mouse' ||
            (pe.pointerType !== 'mouse' && !targetEl.matches(data.focusableElements)))) {
        document.activeElement.blur();
    }
    const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
    if ((params.touchStartForcePreventDefault || shouldPreventDefault) &&
        !targetEl.isContentEditable) {
        e.preventDefault();
    }
    if (params.freeMode &&
        params.freeMode.enabled &&
        swiper.freeMode &&
        swiper.animating &&
        !params.cssMode) {
        swiper.freeMode.onTouchStart();
    }
    swiper.emit('touchStart', e);
}

const events = (swiper, method) => {
    const { params, el, wrapperEl, device } = swiper;
    const capture = !!params.nested;
    const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
    const swiperMethod = method;
    if (!el || typeof el === 'string')
        return;
    // Touch Events
    document[domMethod]('touchstart', swiper.onDocumentTouchStart, {
        passive: false,
        capture,
    });
    el[domMethod]('touchstart', swiper.onTouchStart, { passive: false });
    el[domMethod]('pointerdown', swiper.onTouchStart, { passive: false });
    document[domMethod]('touchmove', swiper.onTouchMove, {
        passive: false,
        capture,
    });
    document[domMethod]('pointermove', swiper.onTouchMove, {
        passive: false,
        capture,
    });
    document[domMethod]('touchend', swiper.onTouchEnd, { passive: true });
    document[domMethod]('pointerup', swiper.onTouchEnd, { passive: true });
    document[domMethod]('pointercancel', swiper.onTouchEnd, { passive: true });
    document[domMethod]('touchcancel', swiper.onTouchEnd, { passive: true });
    document[domMethod]('pointerout', swiper.onTouchEnd, { passive: true });
    document[domMethod]('pointerleave', swiper.onTouchEnd, { passive: true });
    document[domMethod]('contextmenu', swiper.onTouchEnd, { passive: true });
    // Prevent Links Clicks
    if (params.preventClicks || params.preventClicksPropagation) {
        el[domMethod]('click', swiper.onClick, true);
    }
    if (params.cssMode) {
        wrapperEl[domMethod]('scroll', swiper.onScroll);
    }
    // Resize handler
    const subscribe = (events) => {
        swiper[swiperMethod](events, onResize, true);
    };
    if (params.updateOnWindowResize) {
        subscribe(device.ios || device.android
            ? 'resize orientationchange observerUpdate'
            : 'resize observerUpdate');
    }
    else {
        subscribe('observerUpdate');
    }
    // Images loader
    if (params.lazyPreload) {
        el[domMethod]('load', swiper.onLoad, { capture: true });
        el[domMethod]('error', swiper.onLoad, { capture: true });
    }
};
function attachEvents() {
    const swiper = this;
    const { params } = swiper;
    swiper.onTouchStart = onTouchStart.bind(swiper);
    swiper.onTouchMove = onTouchMove.bind(swiper);
    swiper.onTouchEnd = onTouchEnd.bind(swiper);
    swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
    if (params.cssMode) {
        swiper.onScroll = onScroll.bind(swiper);
    }
    swiper.onClick = onClick.bind(swiper);
    swiper.onLoad = onLoad.bind(swiper);
    events(swiper, 'on');
}
function detachEvents() {
    const swiper = this;
    events(swiper, 'off');
}
var events$1 = {
    attachEvents,
    detachEvents,
};

function setGrabCursor(moving) {
    const swiper = this;
    if (!swiper.params.simulateTouch ||
        (swiper.params.watchOverflow && swiper.isLocked) ||
        swiper.params.cssMode)
        return;
    const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
    if (swiper.isElement) {
        swiper.__preventObserver__ = true;
    }
    el.style.cursor = 'move';
    el.style.cursor = moving ? 'grabbing' : 'grab';
    if (swiper.isElement) {
        requestAnimationFrame(() => {
            swiper.__preventObserver__ = false;
        });
    }
}

function unsetGrabCursor() {
    const swiper = this;
    if ((swiper.params.watchOverflow && swiper.isLocked) || swiper.params.cssMode) {
        return;
    }
    if (swiper.isElement) {
        swiper.__preventObserver__ = true;
    }
    swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
    if (swiper.isElement) {
        requestAnimationFrame(() => {
            swiper.__preventObserver__ = false;
        });
    }
}

var grabCursor = {
    setGrabCursor,
    unsetGrabCursor,
};

function loopCreate(slideRealIndex, initial) {
    const swiper = this;
    const { params, slidesEl } = swiper;
    if (!params.loop || (swiper.virtual && swiper.params.virtual?.enabled))
        return;
    const initSlides = () => {
        const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        slides.forEach((el, index) => {
            el.setAttribute('data-swiper-slide-index', String(index));
        });
    };
    const clearBlankSlides = () => {
        const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);
        slides.forEach((el) => {
            el.remove();
        });
        if (slides.length > 0) {
            swiper.recalcSlides();
            swiper.updateSlides();
        }
    };
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) {
        clearBlankSlides();
    }
    const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
    const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
    const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
    const addBlankSlides = (amountOfSlides) => {
        for (let i = 0; i < amountOfSlides; i += 1) {
            const slideEl = swiper.isElement
                ? createElement('swiper-slide', [params.slideBlankClass])
                : createElement('div', [params.slideClass, params.slideBlankClass]);
            swiper.slidesEl.append(slideEl);
        }
    };
    if (shouldFillGroup) {
        if (params.loopAddBlankSlides) {
            const slidesToAdd = slidesPerGroup - (swiper.slides.length % slidesPerGroup);
            addBlankSlides(slidesToAdd);
            swiper.recalcSlides();
            swiper.updateSlides();
        }
        else {
            showWarning('Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
        }
        initSlides();
    }
    else if (shouldFillGrid) {
        if (params.loopAddBlankSlides) {
            const slidesToAdd = params.grid.rows - (swiper.slides.length % params.grid.rows);
            addBlankSlides(slidesToAdd);
            swiper.recalcSlides();
            swiper.updateSlides();
        }
        else {
            showWarning('Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
        }
        initSlides();
    }
    else {
        initSlides();
    }
    const bothDirections = params.centeredSlides || !!params.slidesOffsetBefore || !!params.slidesOffsetAfter;
    swiper.loopFix({
        slideRealIndex,
        direction: bothDirections ? undefined : 'next',
        initial,
    });
}

function loopDestroy() {
    const swiper = this;
    const { params, slidesEl } = swiper;
    if (!params.loop || !slidesEl || (swiper.virtual && swiper.params.virtual?.enabled))
        return;
    swiper.recalcSlides();
    const newSlidesOrder = [];
    swiper.slides.forEach((slideEl) => {
        const loopSlideEl = slideEl;
        const index = typeof loopSlideEl.swiperSlideIndex === 'undefined'
            ? Number(slideEl.getAttribute('data-swiper-slide-index'))
            : loopSlideEl.swiperSlideIndex;
        newSlidesOrder[index] = slideEl;
    });
    swiper.slides.forEach((slideEl) => {
        slideEl.removeAttribute('data-swiper-slide-index');
    });
    newSlidesOrder.forEach((slideEl) => {
        slidesEl.append(slideEl);
    });
    swiper.recalcSlides();
    swiper.slideTo(swiper.realIndex, 0);
}

function loopFix(options = {}) {
    const { slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex: activeSlideIndexParam, initial, byController, byMousewheel, } = options;
    let activeSlideIndex = activeSlideIndexParam;
    const swiper = this;
    if (!swiper.params.loop)
        return;
    // A locked slider (watchOverflow, all slides fit) can't move, so there is nothing to loop:
    // keep the original slide order and don't warn about too few slides (#8228)
    if (swiper.params.watchOverflow && swiper.isLocked)
        return;
    swiper.emit('beforeLoopFix');
    // The compensating slideTo() teleports below change indexes/translate without any
    // observable slide change, so updateActiveIndex() must not emit index-change events
    // while this flag is set (otherwise pagination flickers mid-drag, see #8015)
    swiper.__loopFixInProgress__ = true;
    const { slides, allowSlidePrev, allowSlideNext, slidesEl, params } = swiper;
    const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter, initialSlide } = params;
    const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
    swiper.allowSlidePrev = true;
    swiper.allowSlideNext = true;
    if (swiper.virtual && params.virtual?.enabled) {
        if (slideTo) {
            const virtualSlidesLength = swiper.virtual.slides.length;
            const virtualSlidesBefore = swiper.virtual.slidesBefore ?? 0;
            if (!bothDirections && swiper.snapIndex === 0) {
                swiper.slideTo(virtualSlidesLength, 0, false, true);
            }
            else if (bothDirections && swiper.snapIndex < params.slidesPerView) {
                swiper.slideTo(virtualSlidesLength + swiper.snapIndex, 0, false, true);
            }
            else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
                swiper.slideTo(virtualSlidesBefore, 0, false, true);
            }
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        swiper.__loopFixInProgress__ = false;
        swiper.emit('loopFix');
        return;
    }
    let slidesPerView = params.slidesPerView;
    if (slidesPerView === 'auto') {
        slidesPerView = swiper.slidesPerViewDynamic();
    }
    else {
        slidesPerView = Math.ceil(parseFloat(String(params.slidesPerView)));
        if (bothDirections && slidesPerView % 2 === 0) {
            slidesPerView = slidesPerView + 1;
        }
    }
    const slidesPerGroup = params.slidesPerGroupAuto
        ? slidesPerView
        : params.slidesPerGroup;
    // How many slides the before/after offsets are worth. Unlike centeredSlides
    // (which hides ~slidesPerView / 2 slides on each side), an offset hides only
    // offset / slideSize slides, so sizing the loop buffer from slidesPerView / 2
    // would teleport further than the snapGrid allows with few slides (#8203).
    // Offsets accept a legacy function form at runtime (see updateSlides), so
    // narrow before doing math on them.
    const resolveOffset = (value) => (typeof value === 'function' ? value.call(swiper) : value) || 0;
    const slidesGridStep = swiper.slidesGrid.length > 1
        ? (swiper.slidesGrid[swiper.slidesGrid.length - 1] - swiper.slidesGrid[0]) /
            (swiper.slidesGrid.length - 1)
        : swiper.size;
    const offsetSlidesBefore = slidesGridStep > 0 ? resolveOffset(slidesOffsetBefore) / slidesGridStep : 0;
    const offsetSlidesAfter = slidesGridStep > 0 ? resolveOffset(slidesOffsetAfter) / slidesGridStep : 0;
    let loopedSlides = bothDirections
        ? Math.max(slidesPerGroup, (centeredSlides ? Math.ceil(slidesPerView / 2) : 0) +
            Math.ceil(Math.max(offsetSlidesBefore, offsetSlidesAfter)))
        : slidesPerGroup;
    if (loopedSlides % slidesPerGroup !== 0) {
        loopedSlides += slidesPerGroup - (loopedSlides % slidesPerGroup);
    }
    loopedSlides += params.loopAdditionalSlides;
    swiper.loopedSlides = loopedSlides;
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    if (slides.length < slidesPerView + loopedSlides ||
        (swiper.params.effect === 'cards' && slides.length < slidesPerView + loopedSlides * 2)) {
        showWarning('Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters');
    }
    else if (gridEnabled && params.grid.fill === 'row') {
        showWarning('Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`');
    }
    const prependSlidesIndexes = [];
    const appendSlidesIndexes = [];
    const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
    // The active slide must be able to sit between loopedSlides on each side; when there are
    // too few slides for that (e.g. loopAdditionalSlides, which the cards effect sets to 2-3),
    // every index falls into the prepend branch and nothing is ever appended, so forward
    // navigation gets stuck (#8008). Shrink the buffer to what the slides can hold, keeping
    // it a whole number of groups and leaving one slide to spare: with none, the forward
    // loopFix in onTouchMove fires right at drag start and appends the active slide itself.
    if (loopedSlides > (cols - slidesPerView) / 2) {
        loopedSlides = Math.max(slidesPerGroup, Math.floor((cols - slidesPerView - 1) / 2 / slidesPerGroup) * slidesPerGroup);
        swiper.loopedSlides = loopedSlides;
    }
    const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !bothDirections;
    let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
    if (typeof activeSlideIndex === 'undefined') {
        activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
    }
    else {
        activeIndex = activeSlideIndex;
    }
    const isNext = direction === 'next' || !direction;
    const isPrev = direction === 'prev' || !direction;
    let slidesPrepended = 0;
    let slidesAppended = 0;
    const activeColIndex = gridEnabled
        ? (slides[activeSlideIndex].column ?? 0)
        : activeSlideIndex;
    const activeColIndexWithShift = activeColIndex +
        (bothDirections && typeof setTranslate === 'undefined'
            ? (centeredSlides ? -slidesPerView / 2 + 0.5 : 0) - offsetSlidesBefore
            : 0);
    // prepend last slides before start
    if (activeColIndexWithShift < loopedSlides) {
        slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
        // prepend exactly what the compensating slideTo() below shifts by (like the append branch)
        for (let i = 0; i < slidesPrepended; i += 1) {
            const index = i - Math.floor(i / cols) * cols;
            if (gridEnabled) {
                const colIndexToPrepend = cols - index - 1;
                for (let j = slides.length - 1; j >= 0; j -= 1) {
                    if (slides[j].column === colIndexToPrepend)
                        prependSlidesIndexes.push(j);
                }
            }
            else {
                prependSlidesIndexes.push(cols - index - 1);
            }
        }
    }
    else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
        slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
        if (isInitialOverflow) {
            slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
        }
        // The view must still fit inside the slides afterwards. With a forced activeSlideIndex far
        // to the right (slideToLoop) and a buffer shrunk by the cap above, the formula above can
        // come up short and leave the end of the view empty (#8253)
        slidesAppended = Math.max(slidesAppended, Math.ceil(activeColIndexWithShift + slidesPerView - cols));
        for (let i = 0; i < slidesAppended; i += 1) {
            const index = i - Math.floor(i / cols) * cols;
            if (gridEnabled) {
                slides.forEach((slide, slideIndex) => {
                    if (slide.column === index)
                        appendSlidesIndexes.push(slideIndex);
                });
            }
            else {
                appendSlidesIndexes.push(index);
            }
        }
    }
    swiper.__preventObserver__ = true;
    requestAnimationFrame(() => {
        swiper.__preventObserver__ = false;
    });
    if (swiper.params.effect === 'cards' && slides.length < slidesPerView + loopedSlides * 2) {
        if (appendSlidesIndexes.includes(activeSlideIndex)) {
            appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
        }
        if (prependSlidesIndexes.includes(activeSlideIndex)) {
            prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
        }
    }
    if (isPrev) {
        prependSlidesIndexes.forEach((index) => {
            const slideEl = slides[index];
            slideEl.swiperLoopMoveDOM = true;
            slidesEl.prepend(slideEl);
            slideEl.swiperLoopMoveDOM = false;
        });
    }
    if (isNext) {
        appendSlidesIndexes.forEach((index) => {
            const slideEl = slides[index];
            slideEl.swiperLoopMoveDOM = true;
            slidesEl.append(slideEl);
            slideEl.swiperLoopMoveDOM = false;
        });
    }
    swiper.recalcSlides();
    if (params.slidesPerView === 'auto') {
        swiper.updateSlides();
    }
    else if (gridEnabled &&
        ((prependSlidesIndexes.length > 0 && isPrev) || (appendSlidesIndexes.length > 0 && isNext))) {
        swiper.slides.forEach((slide, slideIndex) => {
            swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
        });
    }
    if (params.watchSlidesProgress) {
        swiper.updateSlidesOffset();
    }
    if (slideTo) {
        if (prependSlidesIndexes.length > 0 && isPrev) {
            if (typeof slideRealIndex === 'undefined') {
                const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
                const diff = newSlideTranslate - currentSlideTranslate;
                if (byMousewheel) {
                    swiper.setTranslate(swiper.translate - diff);
                }
                else {
                    swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
                    if (setTranslate) {
                        swiper.touchEventsData.startTranslate =
                            swiper.touchEventsData.startTranslate - diff;
                        swiper.touchEventsData.currentTranslate =
                            swiper.touchEventsData.currentTranslate - diff;
                    }
                }
            }
            else {
                if (setTranslate) {
                    const shift = gridEnabled
                        ? prependSlidesIndexes.length / params.grid.rows
                        : prependSlidesIndexes.length;
                    swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
                    swiper.touchEventsData.currentTranslate = swiper.translate;
                }
            }
        }
        else if (appendSlidesIndexes.length > 0 && isNext) {
            if (typeof slideRealIndex === 'undefined') {
                const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
                const diff = newSlideTranslate - currentSlideTranslate;
                if (byMousewheel) {
                    swiper.setTranslate(swiper.translate - diff);
                }
                else {
                    swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
                    if (setTranslate) {
                        swiper.touchEventsData.startTranslate =
                            swiper.touchEventsData.startTranslate - diff;
                        swiper.touchEventsData.currentTranslate =
                            swiper.touchEventsData.currentTranslate - diff;
                    }
                }
            }
            else {
                const shift = gridEnabled
                    ? appendSlidesIndexes.length / params.grid.rows
                    : appendSlidesIndexes.length;
                swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
            }
        }
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    const controlled = swiper.controller?.control;
    if (controlled && !byController) {
        const loopParams = {
            slideRealIndex,
            direction,
            setTranslate,
            activeSlideIndex,
            byController: true,
        };
        if (Array.isArray(controlled)) {
            controlled.forEach((c) => {
                if (!c.destroyed && c.params.loop)
                    c.loopFix({
                        ...loopParams,
                        slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false,
                    });
            });
        }
        else if (controlled instanceof swiper.constructor &&
            controlled.params.loop) {
            controlled.loopFix({
                ...loopParams,
                slideTo: controlled.params.slidesPerView === params.slidesPerView ? slideTo : false,
            });
        }
    }
    swiper.__loopFixInProgress__ = false;
    swiper.emit('loopFix');
}

var loop = {
    loopCreate,
    loopFix,
    loopDestroy,
};

function moduleExtendParams(params, allModulesParams) {
    return function extendParams(obj = {}) {
        const moduleParamName = Object.keys(obj)[0];
        const moduleParams = obj[moduleParamName];
        if (typeof moduleParams !== 'object' || moduleParams === null) {
            extend(allModulesParams, obj);
            return;
        }
        if (params[moduleParamName] === true) {
            params[moduleParamName] = { enabled: true };
        }
        if (moduleParamName === 'navigation' &&
            params[moduleParamName] &&
            params[moduleParamName].enabled &&
            !params[moduleParamName].prevEl &&
            !params[moduleParamName].nextEl) {
            params[moduleParamName].auto = true;
        }
        if (['pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 &&
            params[moduleParamName] &&
            params[moduleParamName].enabled &&
            !params[moduleParamName].el) {
            params[moduleParamName].auto = true;
        }
        if (!(moduleParamName in params && 'enabled' in moduleParams)) {
            extend(allModulesParams, obj);
            return;
        }
        if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
            params[moduleParamName].enabled = true;
        }
        if (!params[moduleParamName])
            params[moduleParamName] = { enabled: false };
        extend(allModulesParams, obj);
    };
}

const Observer = ({ swiper, extendParams, on }) => {
    const observers = [];
    const attach = (target, options = {}) => {
        const ObserverFunc = window.MutationObserver ||
            window
                .WebkitMutationObserver;
        if (!ObserverFunc)
            return;
        const observer = new ObserverFunc((mutations) => {
            // The observerUpdate event should only be triggered
            // once despite the number of mutations.  Additional
            // triggers are redundant and are very costly
            if (swiper.__preventObserver__)
                return;
            if (mutations.length === 1) {
                swiper.emit('observerUpdate', mutations[0]);
                return;
            }
            const observerUpdate = function observerUpdate() {
                swiper.emit('observerUpdate', mutations[0]);
            };
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(observerUpdate);
            }
            else {
                window.setTimeout(observerUpdate, 0);
            }
        });
        observer.observe(target, {
            attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
            childList: swiper.isElement || (typeof options.childList === 'undefined' ? true : options.childList),
            characterData: typeof options.characterData === 'undefined' ? true : options.characterData,
        });
        observers.push(observer);
    };
    const init = () => {
        if (!swiper.params.observer)
            return;
        if (swiper.params.observeParents) {
            const containerParents = elementParents(swiper.hostEl);
            for (let i = 0; i < containerParents.length; i += 1) {
                attach(containerParents[i]);
            }
        }
        // Observe container
        attach(swiper.hostEl, {
            childList: swiper.params.observeSlideChildren,
        });
        // Observe wrapper
        attach(swiper.wrapperEl, { attributes: false });
    };
    const destroy = () => {
        observers.forEach((observer) => {
            observer.disconnect();
        });
        observers.splice(0, observers.length);
    };
    extendParams({
        observer: false,
        observeParents: false,
        observeSlideChildren: false,
    });
    on('init', init);
    on('destroy', destroy);
};

const Resize = ({ swiper, on, emit }) => {
    let observer = null;
    let animationFrame = null;
    const resizeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized)
            return;
        emit('beforeResize');
        emit('resize');
    };
    const createObserver = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized)
            return;
        // Entry sizes come from the layout before the rAF, while onResize() stores the live size in
        // swiper.width/height. Comparing entries against swiper.width therefore skipped every other
        // frame of a continuous resize, painting those frames with a stale translate (#8230), so
        // compare against the last handled entry size instead.
        let observedWidth = swiper.width;
        let observedHeight = swiper.height;
        observer = new ResizeObserver((entries) => {
            animationFrame = window.requestAnimationFrame(() => {
                let newWidth = observedWidth;
                let newHeight = observedHeight;
                entries.forEach(({ contentBoxSize, contentRect, target }) => {
                    if (target && target !== swiper.el)
                        return;
                    // Older Safari (≤15) exposed `contentBoxSize` as a single object instead of an array.
                    const box = Array.isArray(contentBoxSize)
                        ? contentBoxSize[0]
                        : contentBoxSize;
                    newWidth = contentRect ? contentRect.width : box.inlineSize;
                    newHeight = contentRect ? contentRect.height : box.blockSize;
                });
                if (newWidth !== observedWidth || newHeight !== observedHeight) {
                    observedWidth = newWidth;
                    observedHeight = newHeight;
                    resizeHandler();
                }
            });
        });
        observer.observe(swiper.el);
    };
    const removeObserver = () => {
        if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
        }
        if (observer && observer.unobserve && swiper.el) {
            observer.unobserve(swiper.el);
            observer = null;
        }
    };
    const orientationChangeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized)
            return;
        emit('orientationchange');
    };
    on('init', () => {
        if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
            createObserver();
            return;
        }
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', orientationChangeHandler);
    });
    on('destroy', () => {
        removeObserver();
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('orientationchange', orientationChangeHandler);
    });
};

function slideNext(speed, runCallbacks = true, internal) {
    const swiper = this;
    const { enabled, params, animating } = swiper;
    if (!enabled || swiper.destroyed)
        return swiper;
    if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
    }
    let perGroup = params.slidesPerGroup;
    if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
        perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
    }
    const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
    const isVirtual = swiper.virtual && params.virtual?.enabled;
    if (params.loop) {
        if (animating && !isVirtual && params.loopPreventsSliding)
            return false;
        swiper.loopFix({ direction: 'next' });
        swiper._clientLeft = swiper.wrapperEl.clientLeft;
        if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
            requestAnimationFrame(() => {
                swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
            });
            return true;
        }
    }
    if (params.rewind && swiper.isEnd) {
        return swiper.slideTo(0, speed, runCallbacks, internal);
    }
    return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
}

function slidePrev(speed, runCallbacks = true, internal) {
    const swiper = this;
    const { params, snapGrid, slidesGrid, rtlTranslate, enabled, animating } = swiper;
    if (!enabled || swiper.destroyed)
        return swiper;
    if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
    }
    const isVirtual = swiper.virtual && params.virtual?.enabled;
    if (params.loop) {
        if (animating && !isVirtual && params.loopPreventsSliding)
            return false;
        swiper.loopFix({ direction: 'prev' });
        swiper._clientLeft = swiper.wrapperEl.clientLeft;
    }
    const translate = rtlTranslate ? swiper.translate : -swiper.translate;
    function normalize(val) {
        if (val < 0)
            return -Math.floor(Math.abs(val));
        return Math.floor(val);
    }
    const normalizedTranslate = normalize(translate);
    const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
    const isFreeMode = params.freeMode && params.freeMode.enabled;
    let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
    if (typeof prevSnap === 'undefined' && (params.cssMode || isFreeMode)) {
        let prevSnapIndex;
        snapGrid.forEach((snap, snapIndex) => {
            if (normalizedTranslate >= snap) {
                prevSnapIndex = snapIndex;
            }
        });
        if (typeof prevSnapIndex !== 'undefined') {
            prevSnap = isFreeMode
                ? snapGrid[prevSnapIndex]
                : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
    }
    let prevIndex = 0;
    if (typeof prevSnap !== 'undefined') {
        prevIndex = slidesGrid.indexOf(prevSnap);
        if (prevIndex < 0)
            prevIndex = swiper.activeIndex - 1;
        if (params.slidesPerView === 'auto' &&
            params.slidesPerGroup === 1 &&
            params.slidesPerGroupAuto) {
            // slidesPerViewDynamic('previous') counts from activeIndex, so step from there (stepping
            // from prevSnap's index overshoots by one); always move back at least one slide (#8235)
            const prevSlidesInView = swiper.slidesPerViewDynamic('previous', true) - 1;
            prevIndex = Math.max(swiper.activeIndex - Math.max(prevSlidesInView, 1), 0);
        }
    }
    if (params.rewind && swiper.isBeginning) {
        const lastIndex = swiper.params.virtual?.enabled && swiper.virtual
            ? swiper.virtual.slides.length - 1
            : swiper.slides.length - 1;
        return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
    }
    else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
        requestAnimationFrame(() => {
            swiper.slideTo(prevIndex, speed, runCallbacks, internal);
        });
        return true;
    }
    return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
}

function slideReset(speed, runCallbacks = true, internal) {
    const swiper = this;
    if (swiper.destroyed)
        return;
    if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
    }
    return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
}

function slideTo(index = 0, speed, runCallbacks = true, internal, initial) {
    if (typeof index === 'string') {
        index = parseInt(index, 10);
    }
    const swiper = this;
    let slideIndex = index;
    if (slideIndex < 0)
        slideIndex = 0;
    const { params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled, } = swiper;
    if ((!enabled && !internal && !initial) ||
        swiper.destroyed ||
        (swiper.animating && params.preventInteractionOnTransition)) {
        return false;
    }
    if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
    }
    const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
    let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
    if (snapIndex >= snapGrid.length)
        snapIndex = snapGrid.length - 1;
    const translate = -snapGrid[snapIndex];
    // Normalize slideIndex
    if (params.normalizeSlideIndex) {
        for (let i = 0; i < slidesGrid.length; i += 1) {
            const normalizedTranslate = -Math.floor(translate * 100);
            const normalizedGrid = Math.floor(slidesGrid[i] * 100);
            const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
            if (typeof slidesGrid[i + 1] !== 'undefined') {
                if (normalizedTranslate >= normalizedGrid &&
                    normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
                    slideIndex = i;
                }
                else if (normalizedTranslate >= normalizedGrid &&
                    normalizedTranslate < normalizedGridNext) {
                    slideIndex = i + 1;
                }
            }
            else if (normalizedTranslate >= normalizedGrid) {
                slideIndex = i;
            }
        }
    }
    // Directions locks
    if (swiper.initialized && slideIndex !== activeIndex) {
        if (!swiper.allowSlideNext &&
            (rtl
                ? translate > swiper.translate && translate > swiper.minTranslate()
                : translate < swiper.translate && translate < swiper.minTranslate())) {
            return false;
        }
        if (!swiper.allowSlidePrev &&
            translate > swiper.translate &&
            translate > swiper.maxTranslate()) {
            if ((activeIndex || 0) !== slideIndex) {
                return false;
            }
        }
    }
    if (slideIndex !== (previousIndex || 0) && runCallbacks) {
        swiper.emit('beforeSlideChangeStart');
    }
    // Update progress
    swiper.updateProgress(translate);
    let direction;
    if (slideIndex > activeIndex)
        direction = 'next';
    else if (slideIndex < activeIndex)
        direction = 'prev';
    else
        direction = 'reset';
    // initial virtual
    const isVirtual = swiper.virtual && swiper.params.virtual?.enabled;
    const isInitialVirtual = isVirtual && initial;
    // Update Index
    if (!isInitialVirtual &&
        ((rtl && -translate === swiper.translate) || (!rtl && translate === swiper.translate))) {
        swiper.updateActiveIndex(slideIndex);
        // Update Height
        if (params.autoHeight) {
            swiper.updateAutoHeight();
        }
        swiper.updateSlidesClasses();
        if (params.effect !== 'slide') {
            swiper.setTranslate(translate);
        }
        if (direction !== 'reset') {
            swiper.transitionStart(runCallbacks, direction);
            swiper.transitionEnd(runCallbacks, direction);
        }
        return false;
    }
    if (params.cssMode) {
        // onScroll() leaves the scroll this causes to onResize() while a resize is pending, and
        // onResize() re-seats the slider onto activeIndex - so it has to name this slide already.
        if (isResizePending(swiper))
            swiper.updateActiveIndex(slideIndex);
        const isH = swiper.isHorizontal();
        const t = rtl ? translate : -translate;
        if (speed === 0) {
            if (isVirtual) {
                swiper.wrapperEl.style.scrollSnapType = 'none';
                swiper._immediateVirtual = true;
            }
            if (isVirtual && !swiper._cssModeVirtualInitialSet && (swiper.params.initialSlide ?? 0) > 0) {
                swiper._cssModeVirtualInitialSet = true;
                requestAnimationFrame(() => {
                    wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
                });
            }
            else {
                wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
            }
            if (isVirtual) {
                requestAnimationFrame(() => {
                    swiper.wrapperEl.style.scrollSnapType = '';
                    swiper._immediateVirtual = false;
                });
            }
        }
        else {
            wrapperEl.scrollTo({
                [isH ? 'left' : 'top']: t,
                behavior: 'smooth',
            });
        }
        return true;
    }
    const browser = getBrowser();
    const isSafari = browser.isSafari;
    if (isVirtual && !initial && isSafari && swiper.isElement) {
        swiper.virtual.update(false, false, slideIndex);
    }
    swiper.setTransition(speed);
    swiper.setTranslate(translate);
    swiper.updateActiveIndex(slideIndex);
    swiper.updateSlidesClasses();
    swiper.emit('beforeTransitionStart', speed, internal);
    swiper.transitionStart(runCallbacks, direction);
    if (speed === 0) {
        swiper.transitionEnd(runCallbacks, direction);
    }
    else if (!swiper.animating) {
        swiper.animating = true;
        if (!swiper.onSlideToWrapperTransitionEnd) {
            swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
                if (!swiper || swiper.destroyed)
                    return;
                if (e.target !== this)
                    return;
                swiper.wrapperEl.removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
                swiper.onSlideToWrapperTransitionEnd = null;
                delete swiper.onSlideToWrapperTransitionEnd;
                swiper.transitionEnd(runCallbacks, direction);
            };
        }
        swiper.wrapperEl.addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
    }
    return true;
}

function slideToClickedSlide() {
    const swiper = this;
    if (swiper.destroyed)
        return;
    const { params, slidesEl, clickedSlide, clickedIndex } = swiper;
    if (clickedSlide === undefined || clickedIndex === undefined)
        return;
    const slidesPerView = params.slidesPerView === 'auto'
        ? swiper.slidesPerViewDynamic()
        : params.slidesPerView;
    let slideToIndex = swiper.getSlideIndexWhenGrid(clickedIndex);
    let realIndex;
    const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
    const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
    if (params.loop) {
        if (swiper.animating)
            return;
        realIndex = parseInt(clickedSlide.getAttribute('data-swiper-slide-index'), 10);
        if (params.centeredSlides) {
            swiper.slideToLoop(realIndex);
        }
        else if (slideToIndex >
            (isGrid
                ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1)
                : swiper.slides.length - slidesPerView)) {
            swiper.loopFix();
            slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
            nextTick(() => {
                swiper.slideTo(slideToIndex);
            });
        }
        else {
            swiper.slideTo(slideToIndex);
        }
    }
    else {
        swiper.slideTo(slideToIndex);
    }
}

function slideToClosest(speed, runCallbacks = true, internal, threshold = 0.5) {
    const swiper = this;
    if (swiper.destroyed)
        return;
    if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
    }
    let index = swiper.activeIndex;
    const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
    const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
    const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
    if (translate >= swiper.snapGrid[snapIndex]) {
        // The current translate is on or after the current snap index, so the choice
        // is between the current index and the one after it.
        const currentSnap = swiper.snapGrid[snapIndex];
        const nextSnap = swiper.snapGrid[snapIndex + 1];
        if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
            index += swiper.params.slidesPerGroup;
        }
    }
    else {
        // The current translate is before the current snap index, so the choice
        // is between the current index and the one before it.
        const prevSnap = swiper.snapGrid[snapIndex - 1];
        const currentSnap = swiper.snapGrid[snapIndex];
        if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
            index -= swiper.params.slidesPerGroup;
        }
    }
    index = Math.max(index, 0);
    index = Math.min(index, swiper.slidesGrid.length - 1);
    return swiper.slideTo(index, speed, runCallbacks, internal);
}

function slideToLoop(index = 0, speed, runCallbacks = true, internal) {
    if (typeof index === 'string') {
        const indexAsNumber = parseInt(index, 10);
        index = indexAsNumber;
    }
    const swiper = this;
    if (swiper.destroyed)
        return;
    if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
    }
    const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
    let newIndex = index;
    if (swiper.params.loop) {
        if (swiper.virtual && swiper.params.virtual?.enabled) {
            newIndex = newIndex + (swiper.virtual.slidesBefore ?? 0);
        }
        else {
            let targetSlideIndex;
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                const targetSlideEl = swiper.slides.find((slideEl) => Number(slideEl.getAttribute('data-swiper-slide-index')) === slideIndex);
                targetSlideIndex = targetSlideEl?.column ?? 0;
            }
            else {
                targetSlideIndex = swiper.getSlideIndexByData(newIndex);
            }
            const cols = gridEnabled
                ? Math.ceil(swiper.slides.length / swiper.params.grid.rows)
                : swiper.slides.length;
            const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter } = swiper.params;
            const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
            let slidesPerView;
            if (swiper.params.slidesPerView === 'auto') {
                slidesPerView = swiper.slidesPerViewDynamic();
            }
            else {
                slidesPerView = Math.ceil(parseFloat(String(swiper.params.slidesPerView)));
                if (bothDirections && slidesPerView % 2 === 0) {
                    slidesPerView = slidesPerView + 1;
                }
            }
            let needLoopFix = cols - targetSlideIndex < slidesPerView;
            if (centeredSlides) {
                // A centered target only needs half a view of slides on each side. Asking for a whole
                // view after it makes loopFix rearrange slides that already fit, which with only one
                // slide to spare moves a slide away from the target's side and leaves a gap (#8253)
                const halfView = Math.floor(slidesPerView / 2);
                needLoopFix = targetSlideIndex < halfView || cols - 1 - targetSlideIndex < halfView;
            }
            else if (bothDirections) {
                needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
            }
            if (internal && bothDirections && swiper.params.slidesPerView !== 'auto' && !gridEnabled) {
                needLoopFix = false;
            }
            if (needLoopFix) {
                const direction = bothDirections
                    ? targetSlideIndex < swiper.activeIndex
                        ? 'prev'
                        : 'next'
                    : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView
                        ? 'next'
                        : 'prev';
                swiper.loopFix({
                    direction,
                    slideTo: true,
                    activeSlideIndex: direction === 'next' ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
                    slideRealIndex: direction === 'next' ? swiper.realIndex : undefined,
                });
            }
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                const targetSlideEl = swiper.slides.find((slideEl) => Number(slideEl.getAttribute('data-swiper-slide-index')) === slideIndex);
                newIndex = targetSlideEl?.column ?? 0;
            }
            else {
                newIndex = swiper.getSlideIndexByData(newIndex);
            }
        }
    }
    requestAnimationFrame(() => {
        swiper.slideTo(newIndex, speed, runCallbacks, internal);
    });
    return swiper;
}

var slide = {
    slideTo,
    slideToLoop,
    slideNext,
    slidePrev,
    slideReset,
    slideToClosest,
    slideToClickedSlide,
};

function setTransition(duration, byController) {
    const swiper = this;
    if (!swiper.params.cssMode) {
        swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
        swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : '';
    }
    swiper.emit('setTransition', duration, byController);
}

function transitionEmit({ swiper, runCallbacks, direction, step, }) {
    const { activeIndex, previousIndex } = swiper;
    let dir = direction;
    if (!dir) {
        if (activeIndex > previousIndex)
            dir = 'next';
        else if (activeIndex < previousIndex)
            dir = 'prev';
        else
            dir = 'reset';
    }
    swiper.emit(`transition${step}`);
    if (runCallbacks && dir === 'reset') {
        swiper.emit(`slideResetTransition${step}`);
    }
    else if (runCallbacks && activeIndex !== previousIndex) {
        swiper.emit(`slideChangeTransition${step}`);
        if (dir === 'next') {
            swiper.emit(`slideNextTransition${step}`);
        }
        else {
            swiper.emit(`slidePrevTransition${step}`);
        }
    }
}

function transitionEnd(runCallbacks = true, direction) {
    const swiper = this;
    const { params } = swiper;
    swiper.animating = false;
    if (params.cssMode)
        return;
    swiper.setTransition(0);
    transitionEmit({ swiper, runCallbacks, direction, step: 'End' });
}

function transitionStart(runCallbacks = true, direction) {
    const swiper = this;
    const { params } = swiper;
    if (params.cssMode)
        return;
    if (params.autoHeight) {
        swiper.updateAutoHeight();
    }
    transitionEmit({ swiper, runCallbacks, direction, step: 'Start' });
}

var transition = {
    setTransition,
    transitionStart,
    transitionEnd,
};

function getSwiperTranslate(axis = this.isHorizontal() ? 'x' : 'y') {
    const swiper = this;
    const { params, rtlTranslate: rtl, translate, wrapperEl } = swiper;
    if (params.virtualTranslate) {
        return rtl ? -translate : translate;
    }
    if (params.cssMode) {
        return translate;
    }
    let currentTranslate = getTranslate(wrapperEl, axis);
    currentTranslate += swiper.cssOverflowAdjustment();
    if (rtl)
        currentTranslate = -currentTranslate;
    return currentTranslate || 0;
}

function maxTranslate() {
    return -this.snapGrid[this.snapGrid.length - 1];
}

function minTranslate() {
    return -this.snapGrid[0];
}

function setTranslate(translate, byController) {
    const swiper = this;
    const { rtlTranslate: rtl, params, wrapperEl, progress } = swiper;
    let x = 0;
    let y = 0;
    const z = 0;
    if (swiper.isHorizontal()) {
        x = rtl ? -translate : translate;
    }
    else {
        y = translate;
    }
    if (params.roundLengths) {
        x = Math.floor(x);
        y = Math.floor(y);
    }
    swiper.previousTranslate = swiper.translate;
    swiper.translate = swiper.isHorizontal() ? x : y;
    if (params.cssMode) {
        wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
    }
    else if (!params.virtualTranslate) {
        if (swiper.isHorizontal()) {
            x -= swiper.cssOverflowAdjustment();
        }
        else {
            y -= swiper.cssOverflowAdjustment();
        }
        wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    }
    // Check if we need to update progress
    let newProgress;
    const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    if (translatesDiff === 0) {
        newProgress = 0;
    }
    else {
        newProgress = (translate - swiper.minTranslate()) / translatesDiff;
    }
    if (newProgress !== progress) {
        swiper.updateProgress(translate);
    }
    swiper.emit('setTranslate', swiper.translate, byController);
}

function translateTo(translate = 0, speed = this.params.speed, runCallbacks = true, translateBounds = true, internal) {
    const swiper = this;
    const { params, wrapperEl } = swiper;
    if (swiper.animating && params.preventInteractionOnTransition) {
        return false;
    }
    const minTranslate = swiper.minTranslate();
    const maxTranslate = swiper.maxTranslate();
    let newTranslate;
    if (translateBounds && translate > minTranslate)
        newTranslate = minTranslate;
    else if (translateBounds && translate < maxTranslate)
        newTranslate = maxTranslate;
    else
        newTranslate = translate;
    // Update progress
    swiper.updateProgress(newTranslate);
    if (params.cssMode) {
        const isH = swiper.isHorizontal();
        if (speed === 0) {
            wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
        }
        else {
            wrapperEl.scrollTo({
                [isH ? 'left' : 'top']: -newTranslate,
                behavior: 'smooth',
            });
        }
        return true;
    }
    if (speed === 0) {
        swiper.setTransition(0);
        swiper.setTranslate(newTranslate);
        if (runCallbacks) {
            swiper.emit('beforeTransitionStart', speed, internal);
            swiper.emit('transitionEnd');
        }
    }
    else {
        swiper.setTransition(speed);
        swiper.setTranslate(newTranslate);
        if (runCallbacks) {
            swiper.emit('beforeTransitionStart', speed, internal);
            swiper.emit('transitionStart');
        }
        if (!swiper.animating) {
            swiper.animating = true;
            if (!swiper.onTranslateToWrapperTransitionEnd) {
                swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
                    if (!swiper || swiper.destroyed)
                        return;
                    if (e.target !== this)
                        return;
                    swiper.wrapperEl.removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
                    swiper.onTranslateToWrapperTransitionEnd = null;
                    delete swiper.onTranslateToWrapperTransitionEnd;
                    swiper.animating = false;
                    if (runCallbacks) {
                        swiper.emit('transitionEnd');
                    }
                };
            }
            swiper.wrapperEl.addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
        }
    }
    return true;
}

var translate = {
    getTranslate: getSwiperTranslate,
    setTranslate,
    minTranslate,
    maxTranslate,
    translateTo,
};

function getActiveIndexByTranslate(swiper) {
    const { slidesGrid, params } = swiper;
    const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
    let activeIndex;
    for (let i = 0; i < slidesGrid.length; i += 1) {
        if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (translate >= slidesGrid[i] &&
                translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
                activeIndex = i;
            }
            else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
                activeIndex = i + 1;
            }
        }
        else if (translate >= slidesGrid[i]) {
            activeIndex = i;
        }
    }
    // Normalize slideIndex
    if (params.normalizeSlideIndex) {
        if (activeIndex < 0 || typeof activeIndex === 'undefined')
            activeIndex = 0;
    }
    return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
    const swiper = this;
    const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
    const { snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex, } = swiper;
    let activeIndex = newActiveIndex;
    let snapIndex;
    const getVirtualRealIndex = (aIndex) => {
        const virtualSlides = swiper.virtual.slides;
        let realIndex = aIndex - (swiper.virtual.slidesBefore ?? 0);
        if (realIndex < 0) {
            realIndex = virtualSlides.length + realIndex;
        }
        if (realIndex >= virtualSlides.length) {
            realIndex -= virtualSlides.length;
        }
        return realIndex;
    };
    if (typeof activeIndex === 'undefined') {
        activeIndex = getActiveIndexByTranslate(swiper);
    }
    if (snapGrid.indexOf(translate) >= 0) {
        snapIndex = snapGrid.indexOf(translate);
    }
    else {
        const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
        snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
    }
    if (snapIndex >= snapGrid.length)
        snapIndex = snapGrid.length - 1;
    if (activeIndex === previousIndex && !swiper.params.loop) {
        if (snapIndex !== previousSnapIndex) {
            swiper.snapIndex = snapIndex;
            swiper.emit('snapIndexChange');
        }
        return;
    }
    if (activeIndex === previousIndex &&
        swiper.params.loop &&
        swiper.virtual &&
        swiper.params.virtual?.enabled) {
        swiper.realIndex = getVirtualRealIndex(activeIndex);
        return;
    }
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    // Get real index
    let realIndex;
    if (swiper.virtual && params.virtual?.enabled) {
        if (params.loop) {
            realIndex = getVirtualRealIndex(activeIndex);
        }
        else {
            realIndex = activeIndex;
        }
    }
    else if (gridEnabled) {
        const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
        let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute('data-swiper-slide-index'), 10);
        if (Number.isNaN(activeSlideIndex)) {
            activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
        }
        realIndex = Math.floor(activeSlideIndex / params.grid.rows);
    }
    else if (swiper.slides[activeIndex]) {
        const slideIndex = swiper.slides[activeIndex].getAttribute('data-swiper-slide-index');
        if (slideIndex) {
            realIndex = parseInt(slideIndex, 10);
        }
        else {
            realIndex = activeIndex;
        }
    }
    else {
        realIndex = activeIndex;
    }
    Object.assign(swiper, {
        previousSnapIndex,
        snapIndex,
        previousRealIndex,
        realIndex,
        previousIndex,
        activeIndex,
    });
    if (swiper.initialized) {
        preload(swiper);
    }
    // Loop-fix teleports change indexes without any observable slide change —
    // emitting here would make pagination and other listeners react to transient
    // wrong indexes (#8015). The enclosing slide action emits the final events.
    if (swiper.__loopFixInProgress__)
        return;
    swiper.emit('activeIndexChange');
    swiper.emit('snapIndexChange');
    if (swiper.initialized || swiper.params.runCallbacksOnInit) {
        // Compare to the realIndex listeners last heard, not to the previous call's
        // value — a suppressed loop-fix call in between would otherwise advance the
        // baseline and swallow (or duplicate) a realIndexChange
        if ((swiper.__lastEmittedRealIndex__ ?? previousRealIndex) !== realIndex) {
            swiper.emit('realIndexChange');
        }
        swiper.emit('slideChange');
    }
    swiper.__lastEmittedRealIndex__ = realIndex;
}

function updateAutoHeight(speed) {
    const swiper = this;
    const activeSlides = [];
    const isVirtual = swiper.virtual && swiper.params.virtual?.enabled;
    let newHeight = 0;
    let i;
    if (typeof speed === 'number') {
        swiper.setTransition(speed);
    }
    else if (speed === true) {
        swiper.setTransition(swiper.params.speed);
    }
    const getSlideByIndex = (index) => {
        if (isVirtual) {
            return swiper.slides[swiper.getSlideIndexByData(index)];
        }
        return swiper.slides[index];
    };
    // Find slides currently in view
    if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
        if (swiper.params.centeredSlides) {
            (swiper.visibleSlides || []).forEach((slide) => {
                activeSlides.push(slide);
            });
        }
        else {
            for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
                const index = swiper.activeIndex + i;
                if (index > swiper.slides.length && !isVirtual)
                    break;
                const slide = getSlideByIndex(index);
                if (slide)
                    activeSlides.push(slide);
            }
        }
    }
    else {
        const slide = getSlideByIndex(swiper.activeIndex);
        if (slide)
            activeSlides.push(slide);
    }
    // Find new height from highest slide in view
    for (i = 0; i < activeSlides.length; i += 1) {
        if (typeof activeSlides[i] !== 'undefined') {
            const height = activeSlides[i].offsetHeight;
            newHeight = height > newHeight ? height : newHeight;
        }
    }
    // Update Height
    if (newHeight || newHeight === 0)
        swiper.wrapperEl.style.height = `${newHeight}px`;
}

function updateClickedSlide(el, path) {
    const swiper = this;
    const params = swiper.params;
    let slide = el.closest(`.${params.slideClass}, swiper-slide`);
    if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) {
        [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
            if (!slide &&
                pathEl.matches &&
                pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
                slide = pathEl;
            }
        });
    }
    let slideFound = false;
    let slideIndex;
    if (slide) {
        for (let i = 0; i < swiper.slides.length; i += 1) {
            if (swiper.slides[i] === slide) {
                slideFound = true;
                slideIndex = i;
                break;
            }
        }
    }
    if (slide && slideFound) {
        swiper.clickedSlide = slide;
        if (swiper.virtual && swiper.params.virtual?.enabled) {
            swiper.clickedIndex = parseInt(slide.getAttribute('data-swiper-slide-index'), 10);
        }
        else {
            swiper.clickedIndex = slideIndex;
        }
    }
    else {
        swiper.clickedSlide = undefined;
        swiper.clickedIndex = undefined;
        return;
    }
    if (params.slideToClickedSlide &&
        swiper.clickedIndex !== undefined &&
        swiper.clickedIndex !== swiper.activeIndex) {
        swiper.slideToClickedSlide();
    }
}

function updateProgress(translate) {
    const swiper = this;
    if (typeof translate === 'undefined') {
        const multiplier = swiper.rtlTranslate ? -1 : 1;
        translate = (swiper && swiper.translate && swiper.translate * multiplier) || 0;
    }
    const params = swiper.params;
    const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
    let { progress, isBeginning, isEnd } = swiper;
    let progressLoop = swiper.progressLoop;
    const wasBeginning = isBeginning;
    const wasEnd = isEnd;
    if (translatesDiff === 0) {
        progress = 0;
        isBeginning = true;
        isEnd = true;
    }
    else {
        progress = (translate - swiper.minTranslate()) / translatesDiff;
        const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
        const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
        isBeginning = isBeginningRounded || progress <= 0;
        isEnd = isEndRounded || progress >= 1;
        if (isBeginningRounded)
            progress = 0;
        if (isEndRounded)
            progress = 1;
    }
    if (params.loop) {
        const firstSlideIndex = swiper.getSlideIndexByData(0);
        const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
        const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
        const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
        const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
        const translateAbs = Math.abs(translate);
        if (translateAbs >= firstSlideTranslate) {
            progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
        }
        else {
            progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
        }
        if (progressLoop > 1)
            progressLoop -= 1;
    }
    Object.assign(swiper, {
        progress,
        progressLoop,
        isBeginning,
        isEnd,
    });
    if (params.watchSlidesProgress || (params.centeredSlides && params.autoHeight))
        swiper.updateSlidesProgress(translate);
    if (isBeginning && !wasBeginning) {
        swiper.emit('reachBeginning toEdge');
    }
    if (isEnd && !wasEnd) {
        swiper.emit('reachEnd toEdge');
    }
    if ((wasBeginning && !isBeginning) || (wasEnd && !isEnd)) {
        swiper.emit('fromEdge');
    }
    swiper.emit('progress', progress);
}

function updateSlides() {
    const swiper = this;
    function getDirectionPropertyValue(node, label) {
        return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || '0');
    }
    const params = swiper.params;
    const { wrapperEl, slidesEl, rtlTranslate: rtl, wrongRTL } = swiper;
    const isVirtual = !!(swiper.virtual && params.virtual?.enabled);
    const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
    const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
    const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
    let snapGrid = [];
    const slidesGrid = [];
    const slidesSizesGrid = [];
    const resolveOffset = (value) => typeof value === 'function' ? value.call(swiper) : value;
    const offsetBefore = resolveOffset(params.slidesOffsetBefore);
    const offsetAfter = resolveOffset(params.slidesOffsetAfter);
    const previousSnapGridLength = swiper.snapGrid.length;
    const previousSlidesGridLength = swiper.slidesGrid.length;
    const swiperSize = swiper.size - offsetBefore - offsetAfter;
    let spaceBetween = params.spaceBetween;
    let slidePosition = -offsetBefore;
    let prevSlideSize = 0;
    let index = 0;
    if (typeof swiperSize === 'undefined') {
        return;
    }
    if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiperSize;
    }
    else if (typeof spaceBetween === 'string') {
        spaceBetween = parseFloat(spaceBetween);
    }
    swiper.virtualSize =
        -spaceBetween - offsetBefore - offsetAfter;
    // reset margins
    slides.forEach((slideEl) => {
        if (rtl) {
            slideEl.style.marginLeft = '';
        }
        else {
            slideEl.style.marginRight = '';
        }
        slideEl.style.marginBottom = '';
        slideEl.style.marginTop = '';
    });
    // reset cssMode offsets
    if (params.centeredSlides && params.cssMode) {
        setCSSProperty(wrapperEl, '--swiper-centered-offset-before', '');
        setCSSProperty(wrapperEl, '--swiper-centered-offset-after', '');
    }
    // set cssMode offsets
    if (params.cssMode) {
        setCSSProperty(wrapperEl, '--swiper-slides-offset-before', `${offsetBefore}px`);
        setCSSProperty(wrapperEl, '--swiper-slides-offset-after', `${offsetAfter}px`);
    }
    const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
    if (gridEnabled) {
        swiper.grid.initSlides(slides);
    }
    else if (swiper.grid) {
        swiper.grid.unsetSlides();
    }
    // Calc slides
    let slideSize = 0;
    const shouldResetSlideSize = params.slidesPerView === 'auto' &&
        params.breakpoints &&
        Object.keys(params.breakpoints).filter((key) => {
            const bp = params.breakpoints[key];
            return typeof bp?.slidesPerView !== 'undefined';
        }).length > 0;
    for (let i = 0; i < slidesLength; i += 1) {
        slideSize = 0;
        const slide = slides[i];
        if (slide) {
            if (gridEnabled) {
                swiper.grid.updateSlide(i, slide, slides);
            }
            if (elementStyle(slide, 'display') === 'none')
                continue;
        }
        if (isVirtual && params.slidesPerView === 'auto') {
            if (params.virtual?.slidesPerViewAutoSlideSize) {
                slideSize = params.virtual.slidesPerViewAutoSlideSize;
            }
            if (slideSize && slide) {
                if (params.roundLengths)
                    slideSize = Math.floor(slideSize);
                slide.style[swiper.getDirectionLabel('width')] =
                    `${slideSize}px`;
            }
        }
        else if (params.slidesPerView === 'auto') {
            if (shouldResetSlideSize) {
                slide.style[swiper.getDirectionLabel('width')] = ``;
            }
            const slideStyles = getComputedStyle(slide);
            const currentTransform = slide.style.transform;
            const currentWebKitTransform = slide.style.webkitTransform;
            if (currentTransform) {
                slide.style.transform = 'none';
            }
            if (currentWebKitTransform) {
                slide.style.webkitTransform =
                    'none';
            }
            if (params.roundLengths) {
                slideSize = swiper.isHorizontal()
                    ? elementOuterSize(slide, 'width')
                    : elementOuterSize(slide, 'height');
            }
            else {
                const width = getDirectionPropertyValue(slideStyles, 'width');
                const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
                const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
                const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
                const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
                const boxSizing = slideStyles.getPropertyValue('box-sizing');
                if (boxSizing && boxSizing === 'border-box') {
                    slideSize = width + marginLeft + marginRight;
                }
                else {
                    const { clientWidth, offsetWidth } = slide;
                    slideSize =
                        width +
                            paddingLeft +
                            paddingRight +
                            marginLeft +
                            marginRight +
                            (offsetWidth - clientWidth);
                }
            }
            if (currentTransform) {
                slide.style.transform = currentTransform;
            }
            if (currentWebKitTransform) {
                slide.style.webkitTransform =
                    currentWebKitTransform;
            }
            if (params.roundLengths)
                slideSize = Math.floor(slideSize);
        }
        else {
            slideSize =
                (swiperSize - (params.slidesPerView - 1) * spaceBetween) /
                    params.slidesPerView;
            if (params.roundLengths)
                slideSize = Math.floor(slideSize);
            if (slide) {
                slide.style[swiper.getDirectionLabel('width')] =
                    `${slideSize}px`;
            }
        }
        if (slide) {
            slide.swiperSlideSize = slideSize;
        }
        slidesSizesGrid.push(slideSize);
        if (params.centeredSlides) {
            slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
            if (prevSlideSize === 0 && i !== 0)
                slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
            if (i === 0)
                slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
            if (Math.abs(slidePosition) < 1 / 1000)
                slidePosition = 0;
            if (params.roundLengths)
                slidePosition = Math.floor(slidePosition);
            if (index % params.slidesPerGroup === 0)
                snapGrid.push(slidePosition);
            slidesGrid.push(slidePosition);
        }
        else {
            if (params.roundLengths)
                slidePosition = Math.floor(slidePosition);
            if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) %
                swiper.params.slidesPerGroup ===
                0)
                snapGrid.push(slidePosition);
            slidesGrid.push(slidePosition);
            slidePosition = slidePosition + slideSize + spaceBetween;
        }
        swiper.virtualSize += slideSize + spaceBetween;
        prevSlideSize = slideSize;
        index += 1;
    }
    swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
    if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
        wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
    }
    if (params.setWrapperSize) {
        wrapperEl.style[swiper.getDirectionLabel('width')] = `${swiper.virtualSize + spaceBetween}px`;
    }
    if (gridEnabled) {
        swiper.grid.updateWrapperSize(slideSize, snapGrid);
    }
    // Remove last grid elements depending on width
    if (!params.centeredSlides) {
        // Check if snapToSlideEdge should be applied
        const isFractionalSlidesPerView = params.slidesPerView !== 'auto' && params.slidesPerView % 1 !== 0;
        const shouldSnapToSlideEdge = params.snapToSlideEdge &&
            !params.loop &&
            (params.slidesPerView === 'auto' || isFractionalSlidesPerView);
        // Calculate the last allowed snap index when snapToSlideEdge is enabled
        // This ensures minimum slides are visible at the end
        let lastAllowedSnapIndex = snapGrid.length;
        if (shouldSnapToSlideEdge) {
            let minVisibleSlides;
            if (params.slidesPerView === 'auto') {
                // For 'auto' mode, calculate how many slides fit based on actual sizes
                minVisibleSlides = 1;
                let accumulatedSize = 0;
                for (let i = slidesSizesGrid.length - 1; i >= 0; i -= 1) {
                    accumulatedSize +=
                        slidesSizesGrid[i] + (i < slidesSizesGrid.length - 1 ? spaceBetween : 0);
                    if (accumulatedSize <= swiperSize) {
                        minVisibleSlides = slidesSizesGrid.length - i;
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                minVisibleSlides = Math.floor(params.slidesPerView);
            }
            lastAllowedSnapIndex = Math.max(slidesLength - minVisibleSlides, 0);
        }
        const newSlidesGrid = [];
        for (let i = 0; i < snapGrid.length; i += 1) {
            let slidesGridItem = snapGrid[i];
            if (params.roundLengths)
                slidesGridItem = Math.floor(slidesGridItem);
            if (shouldSnapToSlideEdge) {
                // When snapToSlideEdge is enabled, only keep snaps up to lastAllowedSnapIndex
                if (i <= lastAllowedSnapIndex) {
                    newSlidesGrid.push(slidesGridItem);
                }
            }
            else if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
                // When snapToSlideEdge is disabled, keep snaps that fit within scrollable area
                newSlidesGrid.push(slidesGridItem);
            }
        }
        snapGrid = newSlidesGrid;
        if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) >
            1) {
            // Only add edge-aligned snap if snapToSlideEdge is not enabled
            if (!shouldSnapToSlideEdge) {
                snapGrid.push(swiper.virtualSize - swiperSize);
            }
        }
    }
    if (isVirtual && params.loop) {
        const size = slidesSizesGrid[0] + spaceBetween;
        const slidesBefore = swiper.virtual.slidesBefore ?? 0;
        const slidesAfter = swiper.virtual.slidesAfter ?? 0;
        const virtualLoopCount = slidesBefore + slidesAfter;
        if (params.slidesPerGroup > 1) {
            const groups = Math.ceil(virtualLoopCount / params.slidesPerGroup);
            const groupSize = size * params.slidesPerGroup;
            for (let i = 0; i < groups; i += 1) {
                snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
            }
        }
        for (let i = 0; i < virtualLoopCount; i += 1) {
            if (params.slidesPerGroup === 1) {
                snapGrid.push(snapGrid[snapGrid.length - 1] + size);
            }
            slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
            swiper.virtualSize += size;
        }
    }
    if (snapGrid.length === 0)
        snapGrid = [0];
    if (spaceBetween !== 0) {
        const key = swiper.isHorizontal() && rtl ? 'marginLeft' : swiper.getDirectionLabel('marginRight');
        slides
            .filter((_, slideIndex) => {
            if (!params.cssMode || params.loop)
                return true;
            if (slideIndex === slides.length - 1) {
                return false;
            }
            return true;
        })
            .forEach((slideEl) => {
            slideEl.style[key] = `${spaceBetween}px`;
        });
    }
    if (params.centeredSlides && params.centeredSlidesBounds) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach((slideSizeValue) => {
            allSlidesSize += slideSizeValue + (spaceBetween || 0);
        });
        allSlidesSize -= spaceBetween;
        const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
        snapGrid = snapGrid.map((snap) => {
            if (snap <= 0)
                return -offsetBefore;
            if (snap > maxSnap)
                return maxSnap + offsetAfter;
            return snap;
        });
    }
    if (params.centerInsufficientSlides) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach((slideSizeValue) => {
            allSlidesSize += slideSizeValue + (spaceBetween || 0);
        });
        allSlidesSize -= spaceBetween;
        if (allSlidesSize < swiperSize) {
            const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
            snapGrid.forEach((snap, snapIndex) => {
                snapGrid[snapIndex] = snap - allSlidesOffset;
            });
            slidesGrid.forEach((snap, snapIndex) => {
                slidesGrid[snapIndex] = snap + allSlidesOffset;
            });
        }
    }
    Object.assign(swiper, {
        slides,
        snapGrid,
        slidesGrid,
        slidesSizesGrid,
    });
    if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
        setCSSProperty(wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
        setCSSProperty(wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
        const addToSnapGrid = -swiper.snapGrid[0];
        const addToSlidesGrid = -swiper.slidesGrid[0];
        swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
        swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
    }
    if (slidesLength !== previousSlidesLength) {
        swiper.emit('slidesLengthChange');
    }
    if (snapGrid.length !== previousSnapGridLength) {
        if (swiper.params.watchOverflow)
            swiper.checkOverflow();
        swiper.emit('snapGridLengthChange');
    }
    if (slidesGrid.length !== previousSlidesGridLength) {
        swiper.emit('slidesGridLengthChange');
    }
    if (params.watchSlidesProgress) {
        swiper.updateSlidesOffset();
    }
    swiper.emit('slidesUpdated');
    if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
        const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
        const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
        if (slidesLength <= params.maxBackfaceHiddenSlides) {
            if (!hasClassBackfaceClassAdded)
                swiper.el.classList.add(backFaceHiddenClass);
        }
        else if (hasClassBackfaceClassAdded) {
            swiper.el.classList.remove(backFaceHiddenClass);
        }
    }
}

const toggleSlideClasses$1 = (slideEl, condition, className) => {
    if (condition && !slideEl.classList.contains(className)) {
        slideEl.classList.add(className);
    }
    else if (!condition && slideEl.classList.contains(className)) {
        slideEl.classList.remove(className);
    }
};
function updateSlidesClasses() {
    const swiper = this;
    const { slides, params, slidesEl, activeIndex } = swiper;
    const isVirtual = !!(swiper.virtual && params.virtual?.enabled);
    const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
    const getFilteredSlide = (selector) => {
        return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
    };
    let activeSlide;
    let prevSlide;
    let nextSlide;
    if (isVirtual) {
        if (params.loop) {
            const virtualSlides = swiper.virtual.slides;
            let slideIndex = activeIndex - (swiper.virtual.slidesBefore ?? 0);
            if (slideIndex < 0)
                slideIndex = virtualSlides.length + slideIndex;
            if (slideIndex >= virtualSlides.length)
                slideIndex -= virtualSlides.length;
            activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
        }
        else {
            activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
        }
    }
    else if (gridEnabled) {
        activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
        nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
        prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
    }
    else {
        activeSlide = slides[activeIndex];
    }
    if (activeSlide) {
        if (!gridEnabled) {
            // Next Slide
            nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !nextSlide) {
                nextSlide = slides[0];
            }
            // Prev Slide
            prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            // NOTE: legacy guard from v9; `(!prevSlide) === 0` is always false, but we preserve
            // the original behaviour (no-op) to avoid runtime changes in v14. Audit candidate.
            if (params.loop && !prevSlide === 0) {
                prevSlide = slides[slides.length - 1];
            }
        }
    }
    slides.forEach((slideEl) => {
        toggleSlideClasses$1(slideEl, slideEl === activeSlide, params.slideActiveClass);
        toggleSlideClasses$1(slideEl, slideEl === nextSlide, params.slideNextClass);
        toggleSlideClasses$1(slideEl, slideEl === prevSlide, params.slidePrevClass);
    });
    swiper.emitSlidesClasses();
}

function updateSlidesOffset() {
    const swiper = this;
    const slides = swiper.slides;
    const minusOffset = swiper.isElement
        ? swiper.isHorizontal()
            ? swiper.wrapperEl.offsetLeft
            : swiper.wrapperEl.offsetTop
        : 0;
    for (let i = 0; i < slides.length; i += 1) {
        slides[i].swiperSlideOffset =
            (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) -
                minusOffset -
                swiper.cssOverflowAdjustment();
    }
}

const toggleSlideClasses = (slideEl, condition, className) => {
    if (condition && !slideEl.classList.contains(className)) {
        slideEl.classList.add(className);
    }
    else if (!condition && slideEl.classList.contains(className)) {
        slideEl.classList.remove(className);
    }
};
function updateSlidesProgress(translate = (this && this.translate) || 0) {
    const swiper = this;
    const params = swiper.params;
    const { slides, rtlTranslate: rtl, snapGrid } = swiper;
    if (slides.length === 0)
        return;
    if (typeof slides[0].swiperSlideOffset === 'undefined')
        swiper.updateSlidesOffset();
    let offsetCenter = -translate;
    if (rtl)
        offsetCenter = translate;
    swiper.visibleSlidesIndexes = [];
    swiper.visibleSlides = [];
    let spaceBetween = params.spaceBetween;
    if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = (parseFloat(spaceBetween.replace('%', '')) / 100) * swiper.size;
    }
    else if (typeof spaceBetween === 'string') {
        spaceBetween = parseFloat(spaceBetween);
    }
    for (let i = 0; i < slides.length; i += 1) {
        const slide = slides[i];
        let slideOffset = slide.swiperSlideOffset ?? 0;
        if (params.cssMode && params.centeredSlides) {
            slideOffset -= slides[0].swiperSlideOffset ?? 0;
        }
        const slideSize = slide.swiperSlideSize ?? 0;
        const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) /
            (slideSize + spaceBetween);
        const originalSlideProgress = (offsetCenter -
            snapGrid[0] +
            (params.centeredSlides ? swiper.minTranslate() : 0) -
            slideOffset) /
            (slideSize + spaceBetween);
        const slideBefore = -(offsetCenter - slideOffset);
        const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
        const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
        const isVisible = (slideBefore >= 0 && slideBefore < swiper.size - 1) ||
            (slideAfter > 1 && slideAfter <= swiper.size) ||
            (slideBefore <= 0 && slideAfter >= swiper.size);
        if (isVisible) {
            swiper.visibleSlides.push(slide);
            swiper.visibleSlidesIndexes.push(i);
        }
        toggleSlideClasses(slide, isVisible, params.slideVisibleClass);
        toggleSlideClasses(slide, isFullyVisible, params.slideFullyVisibleClass);
        slide.progress = rtl ? -slideProgress : slideProgress;
        slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
    }
}

var update = {
    updateSize,
    updateSlides,
    updateAutoHeight,
    updateSlidesOffset,
    updateSlidesProgress,
    updateProgress,
    updateSlidesClasses,
    updateActiveIndex,
    updateClickedSlide,
};

const prototypes = {
    eventsEmitter,
    update,
    translate,
    transition,
    slide,
    loop,
    grabCursor,
    events: events$1,
    breakpoints,
    checkOverflow: checkOverflow$1,
    classes,
};
const extendedDefaults = {};
class Swiper {
    static extendedDefaults;
    static defaults;
    constructor(...args) {
        let el;
        let params;
        if (args.length === 1 &&
            args[0] !== null &&
            typeof args[0] === 'object' &&
            Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
            params = args[0];
        }
        else {
            [el, params] = args;
        }
        if (!params)
            params = {};
        params = extend({}, params);
        if (el && !params.el)
            params.el = el;
        if (params.el &&
            typeof params.el === 'string' &&
            typeof document !== 'undefined' &&
            document.querySelectorAll(params.el).length > 1) {
            const swipers = [];
            document.querySelectorAll(params.el).forEach((containerEl) => {
                const newParams = extend({}, params, { el: containerEl });
                swipers.push(new Swiper(newParams));
            });
            return swipers;
        }
        // Swiper Instance
        const swiper = this;
        swiper.__swiper__ = true;
        swiper.support = getSupport();
        swiper.device = getDevice({ userAgent: params.userAgent ?? undefined });
        swiper.browser = getBrowser();
        swiper.eventsListeners = {};
        swiper.eventsAnyListeners = [];
        swiper.modules = [...(swiper.__modules__ || [])];
        if (params.modules && Array.isArray(params.modules)) {
            params.modules.forEach((mod) => {
                const fn = mod;
                if (typeof fn === 'function' && swiper.modules.indexOf(fn) < 0) {
                    swiper.modules.push(fn);
                }
            });
        }
        const allModulesParams = {};
        swiper.modules.forEach((mod) => {
            mod({
                params: params,
                swiper,
                extendParams: moduleExtendParams(params, allModulesParams),
                on: swiper.on.bind(swiper),
                once: swiper.once.bind(swiper),
                off: swiper.off.bind(swiper),
                emit: swiper.emit.bind(swiper),
            });
        });
        // Extend defaults with modules params
        const swiperParams = extend({}, defaults, allModulesParams);
        // Extend defaults with passed params
        swiper.params = extend({}, swiperParams, extendedDefaults, params);
        swiper.originalParams = extend({}, swiper.params);
        swiper.passedParams = extend({}, params);
        // add event listeners
        if (swiper.params && swiper.params.on) {
            const onHandlers = swiper.params.on;
            Object.keys(onHandlers).forEach((eventName) => {
                const handler = onHandlers[eventName];
                if (handler)
                    swiper.on(eventName, handler);
            });
        }
        if (swiper.params && swiper.params.onAny) {
            swiper.onAny(swiper.params.onAny);
        }
        // Extend Swiper
        Object.assign(swiper, {
            enabled: swiper.params.enabled,
            el,
            // Classes
            classNames: [],
            // Slides
            slides: [],
            slidesGrid: [],
            snapGrid: [],
            slidesSizesGrid: [],
            // isDirection
            isHorizontal() {
                return swiper.params.direction === 'horizontal';
            },
            isVertical() {
                return swiper.params.direction === 'vertical';
            },
            // Indexes
            activeIndex: 0,
            realIndex: 0,
            //
            isBeginning: true,
            isEnd: false,
            // Props
            translate: 0,
            previousTranslate: 0,
            progress: 0,
            velocity: 0,
            animating: false,
            cssOverflowAdjustment() {
                // Returns 0 unless `translate` is > 2**23
                // Should be subtracted from css values to prevent overflow
                return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
            },
            // Locks
            allowSlideNext: swiper.params.allowSlideNext,
            allowSlidePrev: swiper.params.allowSlidePrev,
            // Touch Events
            touchEventsData: {
                isTouched: undefined,
                isMoved: undefined,
                allowTouchCallbacks: undefined,
                touchStartTime: undefined,
                isScrolling: undefined,
                currentTranslate: undefined,
                startTranslate: undefined,
                allowThresholdMove: undefined,
                // Form elements to match
                focusableElements: swiper.params.focusableElements,
                // Last click time
                lastClickTime: 0,
                clickTimeout: undefined,
                // Velocities
                velocities: [],
                allowMomentumBounce: undefined,
                startMoving: undefined,
                pointerId: null,
                touchId: null,
            },
            // Clicks
            allowClick: true,
            // Touches
            allowTouchMove: swiper.params.allowTouchMove,
            touches: {
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
                diff: 0,
            },
            // Images
            imagesToLoad: [],
            imagesLoaded: 0,
        });
        swiper.emit('_swiper');
        // Init
        if (swiper.params.init) {
            swiper.init();
        }
        // Return app instance
        return swiper;
    }
    getDirectionLabel(property) {
        if (this.isHorizontal()) {
            return property;
        }
        // oxfmt-ignore
        return {
            'width': 'height',
            'margin-top': 'margin-left',
            'margin-bottom ': 'margin-right',
            'margin-left': 'margin-top',
            'margin-right': 'margin-bottom',
            'padding-left': 'padding-top',
            'padding-right': 'padding-bottom',
            'marginRight': 'marginBottom',
        }[property];
    }
    /**
     * !INTERNAL
     */
    isHorizontal() {
        return this.params.direction === 'horizontal';
    }
    isVertical() {
        return this.params.direction === 'vertical';
    }
    cssOverflowAdjustment() {
        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
    }
    getSlideIndex(slideEl) {
        const { slidesEl, params } = this;
        const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        const firstSlideIndex = elementIndex(slides[0]);
        return elementIndex(slideEl) - (firstSlideIndex ?? 0);
    }
    getSlideIndexByData(index) {
        return this.getSlideIndex(this.slides.find((slideEl) => Number(slideEl.getAttribute('data-swiper-slide-index')) === index));
    }
    getSlideIndexWhenGrid(index) {
        if (this.grid && this.params.grid && this.params.grid.rows > 1) {
            if (this.params.grid.fill === 'column') {
                index = Math.floor(index / this.params.grid.rows);
            }
            else if (this.params.grid.fill === 'row') {
                index = index % Math.ceil(this.slides.length / this.params.grid.rows);
            }
        }
        return index;
    }
    recalcSlides() {
        const { slidesEl, params } = this;
        this.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    }
    /**
     * Enable Swiper (if it was disabled)
     */
    enable() {
        if (this.enabled)
            return;
        this.enabled = true;
        if (this.params.grabCursor) {
            this.setGrabCursor();
        }
        this.emit('enable');
    }
    /**
     * Disable Swiper (if it was enabled). When Swiper is disabled, it will hide all navigation elements and won't respond to any events and interactions
     */
    disable() {
        if (!this.enabled)
            return;
        this.enabled = false;
        if (this.params.grabCursor) {
            this.unsetGrabCursor();
        }
        this.emit('disable');
    }
    /**
     * Set Swiper translate progress (from 0 to 1). Where 0 - its initial position (offset) on first slide, and 1 - its maximum position (offset) on last slide
     *
     * @param progress Swiper translate progress (from 0 to 1).
     * @param speed Transition duration (in ms).
     */
    setProgress(progress, speed) {
        progress = Math.min(Math.max(progress, 0), 1);
        const min = this.minTranslate();
        const max = this.maxTranslate();
        const current = (max - min) * progress + min;
        this.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
        this.updateActiveIndex();
        this.updateSlidesClasses();
    }
    emitContainerClasses() {
        if (!this.params._emitClasses || !this.el)
            return;
        const cls = this.el.className.split(' ').filter((className) => {
            return (className.indexOf('swiper') === 0 ||
                className.indexOf(this.params.containerModifierClass) === 0);
        });
        this.emit('_containerClasses', cls.join(' '));
    }
    getSlideClasses(slideEl) {
        if (this.destroyed)
            return '';
        return slideEl.className
            .split(' ')
            .filter((className) => {
            return (className.indexOf('swiper-slide') === 0 ||
                className.indexOf(this.params.slideClass) === 0);
        })
            .join(' ');
    }
    emitSlidesClasses() {
        if (!this.params._emitClasses || !this.el)
            return;
        const updates = [];
        this.slides.forEach((slideEl) => {
            const classNames = this.getSlideClasses(slideEl);
            updates.push({ slideEl, classNames });
            this.emit('_slideClass', slideEl, classNames);
        });
        this.emit('_slideClasses', updates);
    }
    /**
     * Get dynamically calculated amount of slides per view, useful only when slidesPerView set to `auto`
     */
    slidesPerViewDynamic(view = 'current', exact = false) {
        const { params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex } = this;
        let spv = 1;
        if (typeof params.slidesPerView === 'number')
            return params.slidesPerView;
        // container not measured yet — centered branch below would never break and return ~slides.length (#7586)
        if (!swiperSize)
            return spv;
        if (params.centeredSlides) {
            let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize ?? 0) : 0;
            let breakLoop = false;
            for (let i = activeIndex + 1; i < slides.length; i += 1) {
                if (slides[i] && !breakLoop) {
                    slideSize += Math.ceil(slides[i].swiperSlideSize ?? 0);
                    spv += 1;
                    if (slideSize > swiperSize)
                        breakLoop = true;
                }
            }
            for (let i = activeIndex - 1; i >= 0; i -= 1) {
                if (slides[i] && !breakLoop) {
                    slideSize += slides[i].swiperSlideSize ?? 0;
                    spv += 1;
                    if (slideSize > swiperSize)
                        breakLoop = true;
                }
            }
        }
        else if (view === 'current') {
            for (let i = activeIndex + 1; i < slides.length; i += 1) {
                const slideInView = exact
                    ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize
                    : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
                if (slideInView) {
                    spv += 1;
                }
            }
        }
        else {
            // previous
            for (let i = activeIndex - 1; i >= 0; i -= 1) {
                const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
                if (slideInView) {
                    spv += 1;
                }
            }
        }
        return spv;
    }
    /**
     * You should call it after you add/remove slides
     * manually, or after you hide/show it, or do any
     * custom DOM modifications with Swiper
     * This method also includes subcall of the following
     * methods which you can use separately:
     */
    update() {
        const swiper = this;
        if (!swiper || swiper.destroyed)
            return;
        const { snapGrid, params } = swiper;
        // Breakpoints
        if (params.breakpoints) {
            swiper.setBreakpoint();
        }
        if (params.lazyPreload) {
            [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
                if (imageEl.complete) {
                    processLazyPreloader(swiper, imageEl);
                }
            });
        }
        swiper.updateSize();
        // A hidden container may not have a size yet. Defer layout and index updates
        // until it can be measured (or an explicit width/height is supplied).
        if (typeof swiper.size === 'undefined') {
            swiper.emit('update');
            return;
        }
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();
        function setTranslate() {
            const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
            const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
            swiper.setTranslate(newTranslate);
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        let translated;
        if (params.freeMode?.enabled && !params.cssMode) {
            setTranslate();
            if (params.autoHeight) {
                swiper.updateAutoHeight();
            }
        }
        else {
            if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) &&
                swiper.isEnd &&
                !params.centeredSlides) {
                const slidesLength = swiper.virtual && params.virtual?.enabled
                    ? swiper.virtual.slides.length
                    : swiper.slides.length;
                translated = swiper.slideTo(slidesLength - 1, 0, false, true);
            }
            else {
                translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
            }
            if (!translated) {
                setTranslate();
            }
        }
        if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
            swiper.checkOverflow();
        }
        swiper.emit('update');
    }
    /**
     * Changes slider direction from horizontal to vertical and back.
     *
     * @param direction New direction. If not specified, then will automatically changed to opposite direction
     * @param needUpdate Will call swiper.update(). Default true
     */
    changeDirection(newDirection, needUpdate = true) {
        const swiper = this;
        const currentDirection = swiper.params.direction;
        if (!newDirection) {
            newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        }
        if (newDirection === currentDirection ||
            (newDirection !== 'horizontal' && newDirection !== 'vertical')) {
            return swiper;
        }
        swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
        swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
        swiper.emitContainerClasses();
        swiper.params.direction = newDirection;
        // RTL only inverts the translate axis while horizontal, so recompute the flag here —
        // a stale `true` flips the sign of every translate read on a vertical slider.
        swiper.rtlTranslate = newDirection === 'horizontal' && swiper.rtl;
        swiper.slides.forEach((slideEl) => {
            if (newDirection === 'vertical') {
                slideEl.style.width = '';
            }
            else {
                slideEl.style.height = '';
            }
        });
        swiper.emit('changeDirection');
        if (needUpdate)
            swiper.update();
        return swiper;
    }
    /**
     * Changes slider language
     *
     * @param direction New direction. Should be `rtl` or `ltr`
     */
    changeLanguageDirection(direction) {
        const swiper = this;
        if ((swiper.rtl && direction === 'rtl') || (!swiper.rtl && direction === 'ltr'))
            return;
        swiper.rtl = direction === 'rtl';
        swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;
        if (swiper.rtl) {
            swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
            swiper.el.dir = 'rtl';
        }
        else {
            swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
            swiper.el.dir = 'ltr';
        }
        swiper.update();
    }
    mount(element) {
        const swiper = this;
        if (swiper.mounted)
            return true;
        // No DOM (SSR / Node) — nothing to mount to.
        if (typeof document === 'undefined')
            return false;
        // Find el (params.el can be a CSSSelector, HTMLElement, or undefined)
        const initialEl = element ?? swiper.params.el;
        let el = null;
        if (typeof initialEl === 'string') {
            el = document.querySelector(initialEl);
        }
        else if (isHTMLElement(initialEl)) {
            el = initialEl;
        }
        if (!el) {
            return false;
        }
        el.swiper = swiper;
        const parent = el.parentNode;
        if (parent &&
            parent.host &&
            parent.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
            swiper.isElement = true;
        }
        const getWrapperSelector = () => {
            return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
        };
        const getWrapper = () => {
            if (el && el.shadowRoot) {
                const res = el.shadowRoot.querySelector(getWrapperSelector());
                // Children needs to return slot items
                return res;
            }
            return elementChildren(el, getWrapperSelector())[0];
        };
        // Find Wrapper
        let wrapperEl = getWrapper();
        if (!wrapperEl && swiper.params.createElements) {
            wrapperEl = createElement('div', swiper.params.wrapperClass);
            el.append(wrapperEl);
            elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
                wrapperEl.append(slideEl);
            });
        }
        const host = swiper.isElement ? el.parentNode.host : null;
        Object.assign(swiper, {
            el,
            wrapperEl,
            slidesEl: swiper.isElement && !host.slideSlots ? host : wrapperEl,
            hostEl: swiper.isElement ? host : el,
            mounted: true,
            // RTL
            rtl: el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl',
            rtlTranslate: swiper.params.direction === 'horizontal' &&
                (el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl'),
            wrongRTL: elementStyle(wrapperEl, 'display') === '-webkit-box',
        });
        return true;
    }
    /**
     * Initialize slider
     */
    init(el) {
        const swiper = this;
        if (swiper.initialized)
            return swiper;
        const mounted = swiper.mount(el);
        if (mounted === false)
            return swiper;
        swiper.emit('beforeInit');
        // Set breakpoint
        if (swiper.params.breakpoints) {
            swiper.setBreakpoint();
        }
        // Add Classes
        swiper.addClasses();
        // Update size
        swiper.updateSize();
        // Update slides
        swiper.updateSlides();
        if (swiper.params.watchOverflow) {
            swiper.checkOverflow();
        }
        // Set Grab Cursor
        if (swiper.params.grabCursor && swiper.enabled) {
            swiper.setGrabCursor();
        }
        // Slide To Initial Slide
        if (swiper.params.loop && swiper.virtual && swiper.params.virtual?.enabled) {
            swiper.slideTo((swiper.params.initialSlide ?? 0) + (swiper.virtual.slidesBefore ?? 0), 0, swiper.params.runCallbacksOnInit, false, true);
        }
        else {
            swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
        }
        // Create loop
        if (swiper.params.loop) {
            swiper.loopCreate(undefined, true);
        }
        // Attach events
        swiper.attachEvents();
        if (swiper.params.lazyPreload) {
            const lazyElements = [
                ...swiper.el.querySelectorAll('[loading="lazy"]'),
            ];
            if (swiper.isElement) {
                lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
            }
            lazyElements.forEach((imageEl) => {
                // Not-yet-complete images are handled by the delegated `load`/`error` listener in attachEvents()
                if (imageEl.complete)
                    processLazyPreloader(swiper, imageEl);
            });
        }
        // Init Flag
        swiper.initialized = true;
        preload(swiper);
        // Emit
        swiper.emit('init');
        swiper.emit('afterInit');
        return swiper;
    }
    /**
     * Destroy slider instance and detach all events listeners
     *
     * @param deleteInstance Set it to false (by default it is true) to not to delete Swiper instance
     * @param cleanStyles Set it to true (by default it is true) and all custom styles will be removed from slides, wrapper and container.
     * Useful if you need to destroy Swiper and to init again with new options or in different direction
     */
    destroy(deleteInstance = true, cleanStyles = true) {
        const swiper = this;
        const { params, el, wrapperEl, slides } = swiper;
        if (typeof swiper.params === 'undefined' || swiper.destroyed) {
            return null;
        }
        swiper.emit('beforeDestroy');
        // Init Flag
        swiper.initialized = false;
        // Detach events
        swiper.detachEvents();
        // Destroy loop
        if (params.loop) {
            swiper.loopDestroy();
        }
        // Cleanup styles
        if (cleanStyles) {
            swiper.removeClasses();
            if (el && typeof el !== 'string') {
                el.removeAttribute('style');
            }
            if (wrapperEl) {
                wrapperEl.removeAttribute('style');
            }
            if (slides && slides.length) {
                slides.forEach((slideEl) => {
                    slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
                    slideEl.removeAttribute('style');
                    slideEl.removeAttribute('data-swiper-slide-index');
                });
            }
        }
        swiper.emit('destroy');
        // Detach emitter events
        Object.keys(swiper.eventsListeners).forEach((eventName) => {
            swiper.off(eventName);
        });
        if (deleteInstance !== false) {
            if (swiper.el && typeof swiper.el !== 'string') {
                swiper.el.swiper = null;
            }
            deleteProps(swiper);
        }
        swiper.destroyed = true;
        return null;
    }
    static extendDefaults(newDefaults) {
        extend(extendedDefaults, newDefaults);
    }
    static installModule(mod) {
        if (!Swiper.prototype.__modules__)
            Swiper.prototype.__modules__ = [];
        const modules = Swiper.prototype.__modules__;
        if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
            modules.push(mod);
        }
    }
    static use(module) {
        if (Array.isArray(module)) {
            module.forEach((m) => Swiper.installModule(m));
            return Swiper;
        }
        Swiper.installModule(module);
        return Swiper;
    }
}
Object.defineProperty(Swiper, 'extendedDefaults', {
    get() {
        return extendedDefaults;
    },
});
Object.defineProperty(Swiper, 'defaults', {
    get() {
        return defaults;
    },
});
// Attach prototype-mixin method groups onto Swiper.prototype. Each group is a
// plain record of method-name → function; we copy them across as-is.
const prototypeRecord = prototypes;
const swiperProto = Swiper.prototype;
Object.keys(prototypeRecord).forEach((prototypeGroup) => {
    const group = prototypeRecord[prototypeGroup];
    Object.keys(group).forEach((protoMethod) => {
        swiperProto[protoMethod] = group[protoMethod];
    });
});
Swiper.use([Resize, Observer]);

export { Swiper as S, defaults as d };
