
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Nerv = {})));
}(this, (function (exports) { 'use strict';

var canUsePromise = 'Promise' in window;
var resolved;
if (canUsePromise) {
    resolved = Promise.resolve();
}
var nextTick = canUsePromise ? function (fn) {
    return resolved.then(fn);
} : 'requestAnimationFrame' in window ? requestAnimationFrame : setTimeout;

/* istanbul ignore next */
// tslint:disable-next-line
Object.is = Object.is || function (x, y) {
    if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
    }
    return x !== x && y !== y;
};
function shallowEqual(obj1, obj2) {
    if (obj1 === null || obj2 === null) {
        return false;
    }
    if (Object.is(obj1, obj2)) {
        return true;
    }
    var obj1Keys = obj1 ? Object.keys(obj1) : [];
    var obj2Keys = obj2 ? Object.keys(obj2) : [];
    if (obj1Keys.length !== obj2Keys.length) {
        return false;
    }
    for (var i = 0; i < obj1Keys.length; i++) {
        var obj1KeyItem = obj1Keys[i];
        if (!obj2.hasOwnProperty(obj1KeyItem) || !Object.is(obj1[obj1KeyItem], obj2[obj1KeyItem])) {
            return false;
        }
    }
    return true;
}

var SimpleMap = function SimpleMap() {
    this.cache = [];
    this.size = 0;
};
SimpleMap.prototype.set = function set(k, v) {
    var this$1 = this;

    var len = this.cache.length;
    if (!len) {
        this.cache.push({ k: k, v: v });
        this.size += 1;
        return;
    }
    for (var i = 0; i < len; i++) {
        var item = this$1.cache[i];
        if (item.k === k) {
            item.v = v;
            return;
        }
    }
    this.cache.push({ k: k, v: v });
    this.size += 1;
};
SimpleMap.prototype.get = function get(k) {
    var this$1 = this;

    var len = this.cache.length;
    if (!len) {
        return;
    }
    for (var i = 0; i < len; i++) {
        var item = this$1.cache[i];
        if (item.k === k) {
            return item.v;
        }
    }
};
SimpleMap.prototype.has = function has(k) {
    var this$1 = this;

    var len = this.cache.length;
    if (!len) {
        return false;
    }
    for (var i = 0; i < len; i++) {
        var item = this$1.cache[i];
        if (item.k === k) {
            return true;
        }
    }
    return false;
};
SimpleMap.prototype['delete'] = function delete$1(k) {
    var this$1 = this;

    var len = this.cache.length;
    for (var i = 0; i < len; i++) {
        var item = this$1.cache[i];
        if (item.k === k) {
            this$1.cache.splice(i, 1);
            this$1.size -= 1;
            return true;
        }
    }
    return false;
};
SimpleMap.prototype.clear = function clear() {
    var this$1 = this;

    var len = this.cache.length;
    this.size = 0;
    if (!len) {
        return;
    }
    while (len) {
        this$1.cache.pop();
        len--;
    }
};
var MapClass = 'Map' in window ? Map : SimpleMap;

function isNumber(arg) {
    return typeof arg === 'number';
}
var isSupportSVG = isFunction(document.createAttributeNS);
function isString(arg) {
    return typeof arg === 'string';
}
function isFunction(arg) {
    return typeof arg === 'function';
}
var isArray = Array.isArray;
function isAttrAnEvent(attr) {
    return attr[0] === 'o' && attr[1] === 'n';
}
function extend(source, from) {
    if (!from) {
        return source;
    }
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            source[key] = from[key];
        }
    }
    return source;
}
function clone(obj) {
    return extend({}, obj);
}

var Current = {
    current: null
};

var EMPTY_CHILDREN = [];
var EMPTY_OBJ = {};
function isNullOrUndef(o) {
    return o === undefined || o === null;
}
function isInvalid(o) {
    return isNullOrUndef(o) || o === true || o === false;
}
function isVNode(node) {
    return !isNullOrUndef(node) && node.vtype === 2 /* Node */;
}
function isVText(node) {
    return !isNullOrUndef(node) && node.vtype === 1 /* Text */;
}
function isComponent(instance) {
    return !isInvalid(instance) && instance.isReactComponent === EMPTY_OBJ;
}
function isWidget(node) {
    return !isNullOrUndef(node) && (node.vtype & (4 /* Composite */ | 8 /* Stateless */)) > 0;
}
function isComposite(node) {
    return !isNullOrUndef(node) && node.vtype === 4 /* Composite */;
}
function isValidElement(node) {
    return !isNullOrUndef(node) && node.vtype;
}
// tslint:disable-next-line:no-empty
function noop() {}
// typescript will compile the enum's value for us.
// eg.
// Composite = 1 << 2  => Composite = 4
var VType;
(function (VType) {
    VType[VType["Text"] = 1] = "Text";
    VType[VType["Node"] = 2] = "Node";
    VType[VType["Composite"] = 4] = "Composite";
    VType[VType["Stateless"] = 8] = "Stateless";
    VType[VType["Void"] = 16] = "Void";
})(VType || (VType = {}));

var Ref = {
    update: function update(lastVnode, nextVnode, domNode) {
        var prevRef = lastVnode != null && lastVnode.props.ref;
        var nextRef = nextVnode != null && nextVnode.props.ref;
        if (prevRef !== nextRef) {
            if (!isFunction(prevRef) || !isFunction(nextRef)) {
                this.detach(lastVnode, prevRef, lastVnode.dom);
            }
            this.attach(nextVnode, nextRef, domNode);
        }
    },
    attach: function attach(vnode, ref, domNode) {
        var node = isComposite(vnode) ? vnode.component : domNode;
        if (isFunction(ref)) {
            ref(node);
        } else if (isString(ref)) {
            var inst = vnode._owner;
            if (inst && isFunction(inst.render)) {
                inst.refs[ref] = node;
            }
        }
    },
    detach: function detach(vnode, ref, domNode) {
        var node = isComposite(vnode) ? vnode.component : domNode;
        if (isFunction(ref)) {
            ref(null);
        } else if (isString(ref)) {
            var inst = vnode._owner;
            if (inst.refs[ref] === node && isFunction(inst.render)) {
                delete inst.refs[ref];
            }
        }
    }
};

var ONINPUT = 'oninput';
var ONPROPERTYCHANGE = 'onpropertychange';
var delegatedEvents = new MapClass();
var doc$1 = document;
var unbubbleEvents = {
    onmousemove: 1,
    ontouchmove: 1,
    onmouseleave: 1,
    onmouseenter: 1,
    onload: 1,
    onunload: 1,
    onscroll: 1,
    onfocus: 1,
    onblur: 1,
    onrowexit: 1,
    onbeforeunload: 1,
    onstop: 1,
    ondragdrop: 1,
    ondragenter: 1,
    ondragexit: 1,
    ondraggesture: 1,
    ondragover: 1,
    oncontextmenu: 1,
    onerror: 1,
    onabort: 1,
    oncanplay: 1,
    oncanplaythrough: 1,
    ondurationchange: 1,
    onemptied: 1,
    onended: 1,
    onloadeddata: 1,
    onloadedmetadata: 1,
    onloadstart: 1,
    onencrypted: 1,
    onpause: 1,
    onplay: 1,
    onplaying: 1,
    onprogress: 1,
    onratechange: 1,
    onseeking: 1,
    onseeked: 1,
    onstalled: 1,
    onsuspend: 1,
    ontimeupdate: 1,
    onvolumechange: 1,
    onwaiting: 1
};
unbubbleEvents[ONPROPERTYCHANGE] = 1;
var bindFocus = false;
/* istanbul ignore next */
if (navigator.userAgent.indexOf('MSIE 9') >= 0) {
    doc$1.addEventListener('selectionchange', function () {
        var el = doc$1.activeElement;
        if (detectCanUseOnInputNode(el)) {
            var ev = doc$1.createEvent('CustomEvent');
            ev.initCustomEvent('input', true, true, {});
            el.dispatchEvent(ev);
        }
    });
}
function attachEvent(domNode, eventName, handler) {
    eventName = fixEvent(domNode, eventName);
    /* istanbul ignore next */
    if (eventName === ONPROPERTYCHANGE) {
        processOnPropertyChangeEvent(domNode, handler);
        return;
    }
    var delegatedRoots = delegatedEvents.get(eventName);
    if (unbubbleEvents[eventName] === 1) {
        if (!delegatedRoots) {
            delegatedRoots = new MapClass();
        }
        var event = attachEventToNode(domNode, eventName, delegatedRoots);
        delegatedEvents.set(eventName, delegatedRoots);
        if (isFunction(handler)) {
            delegatedRoots.set(domNode, {
                eventHandler: handler,
                event: event
            });
        }
    } else {
        if (!delegatedRoots) {
            delegatedRoots = {
                items: new MapClass()
            };
            delegatedRoots.event = attachEventToDocument(doc$1, eventName, delegatedRoots);
            delegatedEvents.set(eventName, delegatedRoots);
        }
        if (isFunction(handler)) {
            delegatedRoots.items.set(domNode, handler);
        }
    }
}
function detachEvent(domNode, eventName, handler) {
    eventName = fixEvent(domNode, eventName);
    if (eventName === ONPROPERTYCHANGE) {
        return;
    }
    var delegatedRoots = delegatedEvents.get(eventName);
    if (unbubbleEvents[eventName] === 1 && delegatedRoots) {
        var event = delegatedRoots.get(domNode);
        if (event) {
            domNode.removeEventListener(parseEventName(eventName), event.event, false);
            /* istanbul ignore next */
            var delegatedRootsSize = delegatedRoots.size;
            if (delegatedRoots['delete'](domNode) && delegatedRootsSize === 0) {
                delegatedEvents['delete'](eventName);
            }
        }
    } else if (delegatedRoots && delegatedRoots.items) {
        var items = delegatedRoots.items;
        if (items['delete'](domNode) && items.size === 0) {
            doc$1.removeEventListener(parseEventName(eventName), delegatedRoots.event, false);
            delegatedEvents['delete'](eventName);
        }
    }
}
var propertyChangeActiveElement;
var propertyChangeActiveElementValue;
var propertyChangeActiveElementValueProp;
var propertyChangeActiveHandler;
/* istanbul ignore next */
function propertyChangeHandler(event) {
    if (event.propertyName !== 'value') {
        return;
    }
    var target = event.target || event.srcElement;
    var val = target.value;
    if (val === propertyChangeActiveElementValue) {
        return;
    }
    propertyChangeActiveElementValue = val;
    if (isFunction(propertyChangeActiveHandler)) {
        propertyChangeActiveHandler.call(target, event);
    }
}
/* istanbul ignore next */
function processOnPropertyChangeEvent(node, handler) {
    propertyChangeActiveHandler = handler;
    if (!bindFocus) {
        bindFocus = true;
        doc$1.addEventListener('focusin', function () {
            unbindOnPropertyChange();
            bindOnPropertyChange(node);
        }, false);
        doc$1.addEventListener('focusout', unbindOnPropertyChange, false);
    }
}
/* istanbul ignore next */
function bindOnPropertyChange(node) {
    propertyChangeActiveElement = node;
    propertyChangeActiveElementValue = node.value;
    propertyChangeActiveElementValueProp = Object.getOwnPropertyDescriptor(node.constructor.prototype, 'value');
    Object.defineProperty(propertyChangeActiveElement, 'value', {
        get: function get() {
            return propertyChangeActiveElementValueProp.get.call(this);
        },
        set: function set(val) {
            propertyChangeActiveElementValue = val;
            propertyChangeActiveElementValueProp.set.call(this, val);
        }
    });
    propertyChangeActiveElement.addEventListener('propertychange', propertyChangeHandler, false);
}
/* istanbul ignore next */
function unbindOnPropertyChange() {
    if (!propertyChangeActiveElement) {
        return;
    }
    delete propertyChangeActiveElement.value;
    propertyChangeActiveElement.removeEventListener('propertychange', propertyChangeHandler, false);
    propertyChangeActiveElement = null;
    propertyChangeActiveElementValue = null;
    propertyChangeActiveElementValueProp = null;
}
function detectCanUseOnInputNode(node) {
    var nodeName = node.nodeName && node.nodeName.toLowerCase();
    var type = node.type;
    return nodeName === 'input' && /text|password/.test(type) || nodeName === 'textarea';
}
function fixEvent(node, eventName) {
    if (eventName === 'onDoubleClick') {
        eventName = 'ondblclick';
    } else if (eventName === 'onTouchTap') {
        eventName = 'onclick';
        // tslint:disable-next-line:prefer-conditional-expression
    } else if (eventName === 'onChange' && detectCanUseOnInputNode(node)) {
        eventName = ONINPUT in window ? ONINPUT : ONPROPERTYCHANGE;
    } else {
        eventName = eventName.toLowerCase();
    }
    return eventName;
}
function parseEventName(name) {
    return name.substr(2);
}
/* istanbul ignore next */
function stopPropagation() {
    this.cancelBubble = true;
    this.stopImmediatePropagation();
}
function dispatchEvent(event, target, items, count, eventData) {
    var eventsToTrigger = items.get(target);
    if (eventsToTrigger) {
        count--;
        eventData.currentTarget = target;
        // for React synthetic event compatibility
        Object.defineProperties(event, {
            nativeEvent: {
                value: event
            },
            persist: {
                value: noop
            }
        });
        eventsToTrigger(event);
        if (event.cancelBubble) {
            return;
        }
    }
    if (count > 0) {
        var parentDom = target.parentNode;
        if (parentDom === null || event.type === 'click' && parentDom.nodeType === 1 && parentDom.disabled) {
            return;
        }
        dispatchEvent(event, parentDom, items, count, eventData);
    }
}
function attachEventToDocument(d, eventName, delegatedRoots) {
    var eventHandler = function (event) {
        var items = delegatedRoots.items;
        var count = items.size;
        if (count > 0) {
            var eventData = {
                currentTarget: event.target
            };
            /* istanbul ignore next */
            try {
                Object.defineProperties(event, {
                    currentTarget: {
                        configurable: true,
                        get: function get() {
                            return eventData.currentTarget;
                        }
                    },
                    stopPropagation: {
                        value: stopPropagation
                    }
                });
            } catch (error) {
                // some browsers crashed
                // see: https://stackoverflow.com/questions/44052813/why-cannot-redefine-property
            }
            dispatchEvent(event, event.target, delegatedRoots.items, count, eventData);
        }
    };
    d.addEventListener(parseEventName(eventName), eventHandler, false);
    return eventHandler;
}
function attachEventToNode(node, eventName, delegatedRoots) {
    var eventHandler = function (event) {
        var eventToTrigger = delegatedRoots.get(node);
        if (eventToTrigger && eventToTrigger.eventHandler) {
            var eventData = {
                currentTarget: node
            };
            /* istanbul ignore next */
            Object.defineProperties(event, {
                currentTarget: {
                    configurable: true,
                    get: function get() {
                        return eventData.currentTarget;
                    }
                }
            });
            eventToTrigger.eventHandler(event);
        }
    };
    node.addEventListener(parseEventName(eventName), eventHandler, false);
    return eventHandler;
}

var options = {
    afterMount: noop,
    afterUpdate: noop,
    beforeUnmount: noop,
    roots: {},
    debug: false
};

function unmountChildren(children, parentDom) {
    if (isArray(children)) {
        for (var i = 0, len = children.length; i < len; i++) {
            unmount(children[i], parentDom);
        }
    } else {
        unmount(children, parentDom);
    }
}
function unmount(vnode, parentDom) {
    if (isInvalid(vnode)) {
        return;
    }
    var vtype = vnode.vtype;
    // Bitwise operators for better performance
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
    var dom = vtype & 4 /* Composite */ ? vnode.component.dom : vnode.dom;
    if ((vtype & (4 /* Composite */ | 8 /* Stateless */)) > 0) {
        options.beforeUnmount(vnode);
        vnode.destroy();
    } else if ((vtype & 2 /* Node */) > 0) {
        var props = vnode.props;
        var children = vnode.children;
        var ref = vnode.ref;
        unmountChildren(children);
        for (var propName in props) {
            if (isAttrAnEvent(propName)) {
                detachEvent(dom, propName, props[propName]);
            }
        }
        if (ref !== null) {
            Ref.detach(vnode, ref, dom);
        }
    }
    if (!isNullOrUndef(parentDom) && !isNullOrUndef(dom)) {
        parentDom.removeChild(dom);
    }
    // vnode.dom = null
}

var NS = {
    ev: 'http://www.w3.org/2001/xml-events',
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace'
};
var ATTRS = {
    accentHeight: 'accent-height',
    accumulate: 0,
    additive: 0,
    alignmentBaseline: 'alignment-baseline',
    allowReorder: 'allowReorder',
    alphabetic: 0,
    amplitude: 0,
    arabicForm: 'arabic-form',
    ascent: 0,
    attributeName: 'attributeName',
    attributeType: 'attributeType',
    autoReverse: 'autoReverse',
    azimuth: 0,
    baseFrequency: 'baseFrequency',
    baseProfile: 'baseProfile',
    baselineShift: 'baseline-shift',
    bbox: 0,
    begin: 0,
    bias: 0,
    by: 0,
    calcMode: 'calcMode',
    capHeight: 'cap-height',
    clip: 0,
    clipPath: 'clip-path',
    clipRule: 'clip-rule',
    clipPathUnits: 'clipPathUnits',
    colorInterpolation: 'color-interpolation',
    colorInterpolationFilters: 'color-interpolation-filters',
    colorProfile: 'color-profile',
    colorRendering: 'color-rendering',
    contentScriptType: 'contentScriptType',
    contentStyleType: 'contentStyleType',
    cursor: 0,
    cx: 0,
    cy: 0,
    d: 0,
    decelerate: 0,
    descent: 0,
    diffuseConstant: 'diffuseConstant',
    direction: 0,
    display: 0,
    divisor: 0,
    dominantBaseline: 'dominant-baseline',
    dur: 0,
    dx: 0,
    dy: 0,
    edgeMode: 'edgeMode',
    elevation: 0,
    enableBackground: 'enable-background',
    end: 0,
    evEvent: 'ev:event',
    exponent: 0,
    externalResourcesRequired: 'externalResourcesRequired',
    fill: 0,
    fillOpacity: 'fill-opacity',
    fillRule: 'fill-rule',
    filter: 0,
    filterRes: 'filterRes',
    filterUnits: 'filterUnits',
    floodColor: 'flood-color',
    floodOpacity: 'flood-opacity',
    focusable: 0,
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontSizeAdjust: 'font-size-adjust',
    fontStretch: 'font-stretch',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    format: 0,
    from: 0,
    fx: 0,
    fy: 0,
    g1: 0,
    g2: 0,
    glyphName: 'glyph-name',
    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
    glyphOrientationVertical: 'glyph-orientation-vertical',
    glyphRef: 'glyphRef',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    hanging: 0,
    horizAdvX: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    ideographic: 0,
    imageRendering: 'image-rendering',
    'in': 0,
    in2: 0,
    intercept: 0,
    k: 0,
    k1: 0,
    k2: 0,
    k3: 0,
    k4: 0,
    kernelMatrix: 'kernelMatrix',
    kernelUnitLength: 'kernelUnitLength',
    kerning: 0,
    keyPoints: 'keyPoints',
    keySplines: 'keySplines',
    keyTimes: 'keyTimes',
    lengthAdjust: 'lengthAdjust',
    letterSpacing: 'letter-spacing',
    lightingColor: 'lighting-color',
    limitingConeAngle: 'limitingConeAngle',
    local: 0,
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    markerHeight: 'markerHeight',
    markerUnits: 'markerUnits',
    markerWidth: 'markerWidth',
    mask: 0,
    maskContentUnits: 'maskContentUnits',
    maskUnits: 'maskUnits',
    mathematical: 0,
    mode: 0,
    numOctaves: 'numOctaves',
    offset: 0,
    opacity: 0,
    operator: 0,
    order: 0,
    orient: 0,
    orientation: 0,
    origin: 0,
    overflow: 0,
    overlinePosition: 'overline-position',
    overlineThickness: 'overline-thickness',
    paintOrder: 'paint-order',
    panose1: 'panose-1',
    pathLength: 'pathLength',
    patternContentUnits: 'patternContentUnits',
    patternTransform: 'patternTransform',
    patternUnits: 'patternUnits',
    pointerEvents: 'pointer-events',
    points: 0,
    pointsAtX: 'pointsAtX',
    pointsAtY: 'pointsAtY',
    pointsAtZ: 'pointsAtZ',
    preserveAlpha: 'preserveAlpha',
    preserveAspectRatio: 'preserveAspectRatio',
    primitiveUnits: 'primitiveUnits',
    r: 0,
    radius: 0,
    refX: 'refX',
    refY: 'refY',
    renderingIntent: 'rendering-intent',
    repeatCount: 'repeatCount',
    repeatDur: 'repeatDur',
    requiredExtensions: 'requiredExtensions',
    requiredFeatures: 'requiredFeatures',
    restart: 0,
    result: 0,
    rotate: 0,
    rx: 0,
    ry: 0,
    scale: 0,
    seed: 0,
    shapeRendering: 'shape-rendering',
    slope: 0,
    spacing: 0,
    specularConstant: 'specularConstant',
    specularExponent: 'specularExponent',
    speed: 0,
    spreadMethod: 'spreadMethod',
    startOffset: 'startOffset',
    stdDeviation: 'stdDeviation',
    stemh: 0,
    stemv: 0,
    stitchTiles: 'stitchTiles',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strikethroughPosition: 'strikethrough-position',
    strikethroughThickness: 'strikethrough-thickness',
    string: 0,
    stroke: 0,
    strokeDasharray: 'stroke-dasharray',
    strokeDashoffset: 'stroke-dashoffset',
    strokeLinecap: 'stroke-linecap',
    strokeLinejoin: 'stroke-linejoin',
    strokeMiterlimit: 'stroke-miterlimit',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    surfaceScale: 'surfaceScale',
    systemLanguage: 'systemLanguage',
    tableValues: 'tableValues',
    targetX: 'targetX',
    targetY: 'targetY',
    textAnchor: 'text-anchor',
    textDecoration: 'text-decoration',
    textRendering: 'text-rendering',
    textLength: 'textLength',
    to: 0,
    transform: 0,
    u1: 0,
    u2: 0,
    underlinePosition: 'underline-position',
    underlineThickness: 'underline-thickness',
    unicode: 0,
    unicodeBidi: 'unicode-bidi',
    unicodeRange: 'unicode-range',
    unitsPerEm: 'units-per-em',
    vAlphabetic: 'v-alphabetic',
    vHanging: 'v-hanging',
    vIdeographic: 'v-ideographic',
    vMathematical: 'v-mathematical',
    values: 0,
    vectorEffect: 'vector-effect',
    version: 0,
    vertAdvY: 'vert-adv-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y',
    viewBox: 'viewBox',
    viewTarget: 'viewTarget',
    visibility: 0,
    widths: 0,
    wordSpacing: 'word-spacing',
    writingMode: 'writing-mode',
    x: 0,
    xHeight: 'x-height',
    x1: 0,
    x2: 0,
    xChannelSelector: 'xChannelSelector',
    xlinkActuate: 'xlink:actuate',
    xlinkArcrole: 'xlink:arcrole',
    xlinkHref: 'xlink:href',
    xlinkRole: 'xlink:role',
    xlinkShow: 'xlink:show',
    xlinkTitle: 'xlink:title',
    xlinkType: 'xlink:type',
    xmlBase: 'xml:base',
    xmlId: 'xml:id',
    xmlns: 0,
    xmlnsXlink: 'xmlns:xlink',
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space',
    y: 0,
    y1: 0,
    y2: 0,
    yChannelSelector: 'yChannelSelector',
    z: 0,
    zoomAndPan: 'zoomAndPan'
};
var SVGPropertyConfig = {
    Properties: {},
    DOMAttributeNamespaces: {
        'ev:event': NS.ev,
        'xlink:actuate': NS.xlink,
        'xlink:arcrole': NS.xlink,
        'xlink:href': NS.xlink,
        'xlink:role': NS.xlink,
        'xlink:show': NS.xlink,
        'xlink:title': NS.xlink,
        'xlink:type': NS.xlink,
        'xml:base': NS.xml,
        'xml:id': NS.xml,
        'xml:lang': NS.xml,
        'xml:space': NS.xml
    },
    DOMAttributeNames: {}
};
Object.keys(ATTRS).forEach(function (key) {
    SVGPropertyConfig.Properties[key] = 0;
    if (ATTRS[key]) {
        SVGPropertyConfig.DOMAttributeNames[key] = ATTRS[key];
    }
});

/* tslint:disable: no-empty*/
function patch(lastVnode, nextVnode, lastDom, context, isSvg) {
    lastDom = lastVnode && lastVnode.dom || lastDom;
    if (isVText(nextVnode) && isVText(lastVnode)) {
        return patchVText(lastVnode, nextVnode);
    }
    var newDom;
    if (isSameVNode(lastVnode, nextVnode)) {
        if (isVNode(nextVnode)) {
            isSvg = isNullOrUndef(isSvg) ? lastVnode.isSvg : isSvg;
            if (isSvg) {
                nextVnode.isSvg = isSvg;
            }
            patchProps(lastDom, nextVnode.props, lastVnode.props, isSvg);
            patchChildren(lastDom, lastVnode.children, nextVnode.children, context, isSvg);
            if (nextVnode.ref !== null) {
                Ref.update(lastVnode, nextVnode, lastDom);
            }
            newDom = lastDom;
        } else if (isWidget(nextVnode)) {
            newDom = nextVnode.update(lastVnode, nextVnode, context, lastDom);
            options.afterUpdate(nextVnode);
        }
        nextVnode.dom = newDom;
    } else {
        var parentNode = lastDom.parentNode;
        var nextSibling = lastDom.nextSibling;
        unmount(lastVnode, parentNode);
        newDom = createElement(nextVnode, isSvg, context);
        if (nextVnode !== null) {
            nextVnode.dom = newDom;
        }
        if (parentNode !== null) {
            parentNode.insertBefore(newDom, nextSibling);
        }
    }
    return newDom;
}
function patchArrayChildren(parentDom, lastChildren, nextChildren, context, isSvg) {
    var lastLength = lastChildren.length;
    var nextLength = nextChildren.length;
    if (lastLength === 0) {
        if (nextLength > 0) {
            var dom = createElement(nextChildren, isSvg, context);
            parentDom.appendChild(dom);
        }
    } else if (nextLength === 0) {
        unmountChildren(lastChildren, parentDom);
    } else {
        if (isKeyed(lastChildren, nextChildren)) {
            patchKeyedChildren(lastChildren, nextChildren, parentDom, context, isSvg, lastLength, nextLength);
        } else {
            patchNonKeyedChildren(parentDom, lastChildren, nextChildren, context, isSvg, lastLength, nextLength);
        }
    }
}
function patchChildren(parentDom, lastChildren, nextChildren, context, isSvg) {
    if (lastChildren === nextChildren) {
        return;
    }
    var lastChildrenIsArray = isArray(lastChildren);
    var nextChildrenIsArray = isArray(nextChildren);
    if (lastChildrenIsArray && nextChildrenIsArray) {
        patchArrayChildren(parentDom, lastChildren, nextChildren, context, isSvg);
    } else if (!lastChildrenIsArray && !nextChildrenIsArray) {
        patch(lastChildren, nextChildren, parentDom, context, isSvg);
    } else if (lastChildrenIsArray && !nextChildrenIsArray) {
        patchArrayChildren(parentDom, lastChildren, [nextChildren], context, isSvg);
    } else if (!lastChildrenIsArray && nextChildrenIsArray) {
        patchArrayChildren(parentDom, [lastChildren], nextChildren, context, isSvg);
    }
}
function patchNonKeyedChildren(parentDom, lastChildren, nextChildren, context, isSvg, lastLength, nextLength) {
    var minLength = Math.min(lastLength, nextLength);
    var i = 0;
    while (i < minLength) {
        patch(lastChildren[i], nextChildren[i], parentDom, context, isSvg);
        i++;
    }
    if (lastLength < nextLength) {
        for (i = minLength; i < nextLength; i++) {
            if (parentDom !== null) {
                parentDom.appendChild(createElement(nextChildren[i], isSvg, context));
            }
        }
    } else if (lastLength > nextLength) {
        for (i = minLength; i < lastLength; i++) {
            unmount(lastChildren[i], parentDom);
        }
    }
}
function patchKeyedChildren(a, b, dom, context, isSvg, aLength, bLength) {
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i;
    var j;
    var aNode;
    var bNode;
    var nextNode;
    var nextPos;
    var node;
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];
    // Step 1
    // tslint:disable-next-line
    outer: {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch(aStartNode, bStartNode, dom, context, isSvg);
            aStart++;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        // Sync nodes with the same key at the end.
        while (aEndNode.key === bEndNode.key) {
            patch(aEndNode, bEndNode, dom, context, isSvg);
            aEnd--;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }
    }
    if (aStart > aEnd) {
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < bLength ? b[nextPos].dom : null;
            while (bStart <= bEnd) {
                node = b[bStart];
                bStart++;
                attachNewNode(dom, createElement(node, isSvg, context), nextNode);
            }
        }
    } else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            unmount(a[aStart++], dom);
        }
    } else {
        var aLeft = aEnd - aStart + 1;
        var bLeft = bEnd - bStart + 1;
        var sources = new Array(bLeft);
        // Mark all nodes as inserted.
        for (i = 0; i < bLeft; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;
        // When sizes are small, just loop them through
        if (bLeft <= 4 || aLeft * bLeft <= 16) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLeft) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            } else {
                                pos = j;
                            }
                            patch(aNode, bNode, dom, context, isSvg);
                            patched++;
                            a[i] = null;
                            break;
                        }
                    }
                }
            }
        } else {
            var keyIndex = new MapClass();
            for (i = bStart; i <= bEnd; i++) {
                keyIndex.set(b[i].key, i);
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLeft) {
                    j = keyIndex.get(aNode.key);
                    if (j !== undefined) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        } else {
                            pos = j;
                        }
                        patch(aNode, bNode, dom, context, isSvg);
                        patched++;
                        a[i] = null;
                    }
                }
            }
        }
        if (aLeft === aLength && patched === 0) {
            unmountChildren(a, dom);
            while (bStart < bLeft) {
                node = b[bStart];
                bStart++;
                attachNewNode(dom, createElement(node, isSvg, context), null);
            }
        } else {
            i = aLeft - patched;
            while (i > 0) {
                aNode = a[aStart++];
                if (aNode !== null) {
                    unmount(aNode, dom);
                    i--;
                }
            }
            if (moved) {
                var seq = lis(sources);
                j = seq.length - 1;
                for (i = bLeft - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        attachNewNode(dom, createElement(node, isSvg, context), nextPos < bLength ? b[nextPos].dom : null);
                    } else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            attachNewNode(dom, node.dom, nextPos < bLength ? b[nextPos].dom : null);
                        } else {
                            j--;
                        }
                    }
                }
            } else if (patched !== bLeft) {
                for (i = bLeft - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        attachNewNode(dom, createElement(node, isSvg, context), nextPos < bLength ? b[nextPos].dom : null);
                    }
                }
            }
        }
    }
}
function attachNewNode(parentDom, newNode, nextNode) {
    if (isNullOrUndef(nextNode)) {
        parentDom.appendChild(newNode);
    } else {
        parentDom.insertBefore(newNode, nextNode);
    }
}
/**
 * Slightly modified Longest Increased Subsequence algorithm, it ignores items that have -1 value, they're representing
 * new items.
 *
 * http://en.wikipedia.org/wiki/Longest_increasing_subsequence
 *
 * @param a Array of numbers.
 * @returns Longest increasing subsequence.
 */
function lis(a) {
    var p = a.slice();
    var result = [];
    result.push(0);
    var u;
    var v;
    for (var i = 0, il = a.length; i < il; ++i) {
        if (a[i] === -1) {
            continue;
        }
        var j = result[result.length - 1];
        if (a[j] < a[i]) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            var c = (u + v) / 2 | 0;
            if (a[result[c]] < a[i]) {
                u = c + 1;
            } else {
                v = c;
            }
        }
        if (a[i] < a[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
function isKeyed(lastChildren, nextChildren) {
    return nextChildren.length > 0 && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key) && lastChildren.length > 0 && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}
function isSameVNode(a, b) {
    if (isInvalid(a) || isInvalid(b)) {
        return false;
    }
    return a.type === b.type && a.key === b.key;
}
function patchVText(lastVNode, nextVNode) {
    var dom = lastVNode.dom;
    if (dom === null) {
        return;
    }
    var nextText = nextVNode.text;
    nextVNode.dom = dom;
    if (lastVNode.text !== nextText) {
        dom.nodeValue = nextText;
    }
    return dom;
}
var skipProps = {
    children: 1,
    key: 1,
    ref: 1,
    owner: 1
};
var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
function setStyle(domStyle, style, value) {
    domStyle[style] = !isNumber(value) || IS_NON_DIMENSIONAL.test(style) ? value : value + 'px';
    if (style === 'float') {
        domStyle['cssFloat'] = value;
        domStyle['styleFloat'] = value;
    }
}
function patchEvent(eventName, lastEvent, nextEvent, domNode) {
    if (lastEvent !== nextEvent) {
        if (isFunction(lastEvent)) {
            detachEvent(domNode, eventName, lastEvent);
        }
        attachEvent(domNode, eventName, nextEvent);
    }
}
function patchStyle(lastAttrValue, nextAttrValue, dom) {
    var domStyle = dom.style;
    var style;
    var value;
    if (isString(nextAttrValue)) {
        domStyle.cssText = nextAttrValue;
        return;
    }
    if (!isNullOrUndef(lastAttrValue) && !isString(lastAttrValue)) {
        for (style in nextAttrValue) {
            value = nextAttrValue[style];
            if (value !== lastAttrValue[style]) {
                setStyle(domStyle, style, value);
            }
        }
        for (style in lastAttrValue) {
            if (isNullOrUndef(nextAttrValue[style])) {
                domStyle[style] = '';
            }
        }
    } else {
        for (style in nextAttrValue) {
            value = nextAttrValue[style];
            setStyle(domStyle, style, value);
        }
    }
}
function patchProp(domNode, prop, lastValue, nextValue, isSvg) {
    if (lastValue !== nextValue) {
        if (prop === 'className') {
            prop = 'class';
        }
        if (skipProps[prop] === 1) {
            return;
        } else if (prop === 'class' && !isSvg) {
            domNode.className = nextValue;
        } else if (prop === 'dangerouslySetInnerHTML') {
            var lastHtml = lastValue && lastValue.__html;
            var nextHtml = nextValue && nextValue.__html;
            if (lastHtml !== nextHtml) {
                if (!isNullOrUndef(nextHtml)) {
                    domNode.innerHTML = nextHtml;
                }
            }
        } else if (isAttrAnEvent(prop)) {
            patchEvent(prop, lastValue, nextValue, domNode);
        } else if (prop === 'style') {
            patchStyle(lastValue, nextValue, domNode);
        } else if (prop !== 'list' && prop !== 'type' && !isSvg && prop in domNode) {
            setProperty(domNode, prop, nextValue == null ? '' : nextValue);
            if (nextValue == null || nextValue === false) {
                domNode.removeAttribute(prop);
            }
        } else if (isNullOrUndef(nextValue) || nextValue === false) {
            domNode.removeAttribute(prop);
        } else {
            var namespace = SVGPropertyConfig.DOMAttributeNamespaces[prop];
            if (isSvg && namespace) {
                if (nextValue) {
                    if (!lastValue || lastValue !== nextValue) {
                        domNode.setAttributeNS(namespace, prop, nextValue);
                    }
                } else {
                    var colonPosition = prop.indexOf(':');
                    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
                    domNode.removeAttributeNS(namespace, localName);
                }
            } else {
                if (!isFunction(nextValue)) {
                    domNode.setAttribute(prop, nextValue);
                }
                // WARNING: Non-event attributes with function values:
                // https://reactjs.org/blog/2017/09/08/dom-attributes-in-react-16.html#changes-in-detail
            }
        }
    }
}
function setProperty(node, name, value) {
    try {
        node[name] = value;
    } catch (e) {}
}
function patchProps(domNode, nextProps, previousProps, isSvg) {
    for (var propName in previousProps) {
        var value = previousProps[propName];
        if (isNullOrUndef(nextProps[propName]) && !isNullOrUndef(value)) {
            if (isAttrAnEvent(propName)) {
                detachEvent(domNode, propName, value);
            } else if (propName === 'className') {
                domNode.removeAttribute('class');
            } else {
                domNode.removeAttribute(propName);
            }
        }
    }
    for (var propName$1 in nextProps) {
        patchProp(domNode, propName$1, previousProps[propName$1], nextProps[propName$1], isSvg);
    }
}

var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
var doc = document;
function createElement(vnode, isSvg, parentContext, parentComponent) {
    var domNode;
    if (isValidElement(vnode)) {
        var vtype = vnode.vtype;
        if (vtype & (4 /* Composite */ | 8 /* Stateless */)) {
            domNode = vnode.init(parentContext, parentComponent);
            options.afterMount(vnode);
        } else if (vtype & 1 /* Text */) {
                domNode = doc.createTextNode(vnode.text);
                vnode.dom = domNode;
            } else if (vtype & 2 /* Node */) {
                domNode = mountVNode$1(vnode, isSvg, parentContext, parentComponent);
            } else if (vtype & 16 /* Void */) {
                domNode = vnode.dom;
            }
    } else if (isString(vnode) || isNumber(vnode)) {
        domNode = doc.createTextNode(vnode);
    } else if (isNullOrUndef(vnode) || vnode === false) {
        domNode = doc.createTextNode('');
    } else if (isArray(vnode)) {
        domNode = doc.createDocumentFragment();
        vnode.forEach(function (child) {
            if (!isInvalid(child)) {
                var childNode = createElement(child, isSvg, parentContext, parentComponent);
                if (childNode) {
                    domNode.appendChild(childNode);
                }
            }
        });
    } else {
        throw new Error('Unsupported VNode.');
    }
    return domNode;
}
function mountVNode$1(vnode, isSvg, parentContext, parentComponent) {
    if (vnode.isSvg) {
        isSvg = true;
    } else if (vnode.type === 'svg') {
        isSvg = true;
    } else if (!isSupportSVG) {
        isSvg = false;
    }
    if (isSvg) {
        vnode.namespace = SVG_NAMESPACE;
        vnode.isSvg = isSvg;
    }
    var domNode = !isSvg ? doc.createElement(vnode.type) : doc.createElementNS(vnode.namespace, vnode.type);
    setProps(domNode, vnode, isSvg);
    if (vnode.type === 'foreignObject') {
        isSvg = false;
    }
    var children = vnode.children;
    if (isArray(children)) {
        for (var i = 0, len = children.length; i < len; i++) {
            mountChild(children[i], domNode, parentContext, parentComponent, isSvg);
        }
    } else {
        mountChild(children, domNode, parentContext, parentComponent, isSvg);
    }
    vnode.dom = domNode;
    if (vnode.ref !== null) {
        Ref.attach(vnode, vnode.ref, domNode);
    }
    return domNode;
}
function mountChild(child, domNode, parentContext, parentComponent, isSvg) {
    child.parentContext = parentContext || EMPTY_OBJ;
    var childNode = createElement(child, isSvg, parentContext, parentComponent);
    if (childNode !== null) {
        domNode.appendChild(childNode);
    }
}
function setProps(domNode, vnode, isSvg) {
    var props = vnode.props;
    for (var p in props) {
        patchProp(domNode, p, null, props[p], isSvg);
    }
}

function createVText(text) {
    return {
        text: text,
        vtype: 1 /* Text */
        , dom: null
    };
}

function createVoid() {
    var dom = document.createTextNode('');
    return {
        dom: dom,
        vtype: 16 /* Void */
    };
}

var readyComponents = [];
function errorCatcher(fn, component) {
    try {
        return fn();
    } catch (error) {
        errorHandler(component, error);
    }
}
function errorHandler(component, error) {
    var boundary;
    while (true) {
        if (isFunction(component.componentDidCatch)) {
            boundary = component;
            break;
        } else if (component._parentComponent) {
            component = component._parentComponent;
        } else {
            break;
        }
    }
    if (boundary) {
        var _disable = boundary._disable;
        boundary._disable = false;
        boundary.componentDidCatch(error);
        boundary._disable = _disable;
    } else {
        throw error;
    }
}
function mountVNode(vnode, parentContext, parentComponent) {
    return createElement(vnode, false, parentContext, parentComponent);
}
function mountComponent(vnode, parentContext, parentComponent) {
    var ref = vnode.props.ref;
    vnode.component = new vnode.type(vnode.props, parentContext);
    var component = vnode.component;
    if (isComponent(parentComponent)) {
        component._parentComponent = parentComponent;
    }
    if (isFunction(component.componentWillMount)) {
        errorCatcher(function () {
            component.componentWillMount();
        }, component);
        component.state = component.getState();
    }
    component._dirty = false;
    var rendered = renderComponent(component);
    component._rendered = rendered;
    if (isFunction(component.componentDidMount)) {
        readyComponents.push(component);
    }
    if (!isNullOrUndef(ref)) {
        readyComponents.push(function () {
            return Ref.attach(vnode, ref, component.dom);
        });
    }
    var dom = vnode.dom = component.dom = mountVNode(rendered, getChildContext(component, parentContext), component);
    component._disable = false;
    return dom;
}
function mountStatelessComponent(vnode, parentContext) {
    var ref = vnode.props.ref;
    delete vnode.props.ref;
    vnode._rendered = vnode.type(vnode.props, parentContext);
    var rendered = vnode._rendered;
    if (isVNode(rendered) && !isNullOrUndef(ref)) {
        rendered.ref = ref;
    }
    return vnode.dom = mountVNode(rendered, parentContext);
}
function getChildContext(component, context) {
    if (component.getChildContext) {
        return extend(context, component.getChildContext());
    }
    return context;
}
function renderComponent(component) {
    Current.current = component;
    var rendered;
    errorCatcher(function () {
        rendered = component.render();
    }, component);
    if (isNumber(rendered) || isString(rendered)) {
        rendered = createVText(rendered);
    } else if (rendered === undefined) {
        rendered = createVoid();
    }
    Current.current = null;
    return rendered;
}
function flushMount() {
    if (!readyComponents.length) {
        return;
    }
    // @TODO: perf
    var queue = readyComponents.slice(0);
    readyComponents.length = 0;
    queue.forEach(function (item) {
        if (isFunction(item)) {
            item();
        } else if (item.componentDidMount) {
            errorCatcher(function () {
                item.componentDidMount();
            }, item);
        }
    });
}
function reRenderComponent(prev, current) {
    var component = current.component = prev.component;
    var nextProps = current.props;
    var nextContext = component.context;
    component._disable = true;
    if (isFunction(component.componentWillReceiveProps)) {
        errorCatcher(function () {
            component.componentWillReceiveProps(nextProps, nextContext);
        }, component);
    }
    component._disable = false;
    component.prevProps = component.props;
    component.prevState = component.state;
    component.prevContext = component.context;
    component.props = nextProps;
    component.context = nextContext;
    if (!isNullOrUndef(nextProps.ref)) {
        Ref.update(prev, current);
    }
    updateComponent(component);
    return component.dom;
}
function reRenderStatelessComponent(prev, current, parentContext, domNode) {
    var lastRendered = prev._rendered;
    var rendered = current.type(current.props, parentContext);
    current._rendered = rendered;
    return current.dom = patch(lastRendered, rendered, domNode, parentContext);
}
function updateComponent(component, isForce) {
    if (isForce === void 0) isForce = false;

    var lastDom = component.dom;
    var props = component.props;
    var state = component.getState();
    var context = component.context;
    var prevProps = component.prevProps || props;
    var prevState = component.prevState || state;
    var prevContext = component.prevContext || context;
    component.props = prevProps;
    component.context = prevContext;
    var skip = false;
    if (!isForce && isFunction(component.shouldComponentUpdate) && component.shouldComponentUpdate(props, state, context) === false) {
        skip = true;
    } else if (isFunction(component.componentWillUpdate)) {
        errorCatcher(function () {
            component.componentWillUpdate(props, state, context);
        }, component);
    }
    component.props = props;
    component.state = state;
    component.context = context;
    component._dirty = false;
    if (!skip) {
        var lastRendered = component._rendered;
        var rendered = renderComponent(component);
        var childContext = getChildContext(component, context);
        component.dom = patch(lastRendered, rendered, lastDom, childContext);
        component._rendered = rendered;
        if (isFunction(component.componentDidUpdate)) {
            errorCatcher(function () {
                component.componentDidUpdate(prevProps, prevState, context);
            }, component);
        }
    }
    component.prevProps = component.props;
    component.prevState = component.state;
    component.prevContext = component.context;
    if (component._pendingCallbacks) {
        while (component._pendingCallbacks.length) {
            component._pendingCallbacks.pop().call(component);
        }
    }
    flushMount();
}
function unmountComponent(vnode) {
    var component = vnode.component;
    if (isFunction(component.componentWillUnmount)) {
        errorCatcher(function () {
            component.componentWillUnmount();
        }, component);
    }
    component._disable = true;
    unmount(component._rendered);
    if (!isNullOrUndef(vnode.props.ref)) {
        Ref.detach(vnode, vnode.props.ref, vnode.dom);
    }
}
function unmountStatelessComponent(vnode) {
    unmount(vnode._rendered);
    if (!isNullOrUndef(vnode.props.ref)) {
        Ref.detach(vnode, vnode.props.ref, vnode.dom);
    }
}

var items = [];
function enqueueRender(component) {
    // tslint:disable-next-line:no-conditional-assignment
    if (!component._dirty && (component._dirty = true) && items.push(component) === 1) {
        nextTick(rerender);
    }
}
function rerender() {
    var p;
    var list = items;
    items = [];
    // tslint:disable-next-line:no-conditional-assignment
    while (p = list.pop()) {
        if (p._dirty) {
            updateComponent(p);
        }
    }
}

var Component = function Component(props, context) {
    this._dirty = true;
    this._disable = true;
    this._pendingStates = [];
    // Is a React Component.
    // tslint:disable-next-line:max-line-length
    // see: https://github.com/facebook/react/blob/3c977dea6b96f6a9bb39f09886848da870748441/packages/react/src/ReactBaseClasses.js#L26
    this.isReactComponent = EMPTY_OBJ;
    if (!this.state) {
        this.state = {};
    }
    this.props = props || {};
    this.context = context || EMPTY_OBJ;
    this.refs = {};
};
Component.prototype.setState = function setState(state, callback) {
    if (state) {
        (this._pendingStates = this._pendingStates || []).push(state);
    }
    if (isFunction(callback)) {
        (this._pendingCallbacks = this._pendingCallbacks || []).push(callback);
    }
    if (!this._disable) {
        enqueueRender(this);
    }
};
Component.prototype.getState = function getState() {
    var this$1 = this;

    // tslint:disable-next-line:no-this-assignment
    var ref = this;
    var _pendingStates = ref._pendingStates;
    var state = ref.state;
    var props = ref.props;
    if (!_pendingStates.length) {
        return state;
    }
    var stateClone = clone(state);
    var queue = _pendingStates.concat();
    this._pendingStates.length = 0;
    queue.forEach(function (nextState) {
        if (isFunction(nextState)) {
            nextState = nextState.call(this$1, state, props);
        }
        extend(stateClone, nextState);
    });
    return stateClone;
};
Component.prototype.forceUpdate = function forceUpdate(callback) {
    if (isFunction(callback)) {
        (this._pendingCallbacks = this._pendingCallbacks || []).push(callback);
    }
    updateComponent(this, true);
};
// tslint:disable-next-line
Component.prototype.render = function render(nextProps, nextState, nextContext) {};

var PureComponent = function (Component$$1) {
    function PureComponent() {
        Component$$1.apply(this, arguments);
        this.isPureComponent = true;
    }

    if (Component$$1) PureComponent.__proto__ = Component$$1;
    PureComponent.prototype = Object.create(Component$$1 && Component$$1.prototype);
    PureComponent.prototype.constructor = PureComponent;
    PureComponent.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
    };

    return PureComponent;
}(Component);

function isVChild(vnode) {
    return isVNode(vnode) || isString(vnode) || isNumber(vnode);
}
function render(vnode, container, callback) {
    if (!isVChild(vnode) && !isWidget(vnode)) {
        return null;
    }
    /* istanbul ignore if */
    if (!container || container.nodeType !== 1) {
        throw new Error(container + " should be a DOM Element");
    }
    var lastVnode = container._component;
    var dom;
    if (lastVnode !== undefined) {
        dom = patch(lastVnode, vnode, container, {});
    } else {
        dom = mountVNode(vnode, {});
        container.appendChild(dom);
    }
    if (container) {
        container._component = vnode;
    }
    flushMount();
    if (callback) {
        callback();
    }
    return vnode.component || dom;
}

function createVNode(type, props, children, key, namespace, owner, ref) {
    return {
        type: type,
        key: key || null,
        vtype: 2 /* Node */
        , props: props || EMPTY_OBJ,
        children: children,
        namespace: namespace || null,
        _owner: owner,
        dom: null,
        ref: ref || null
    };
}

function h(type, props, children) {
    var childNodes;
    if (props.children) {
        if (!children) {
            children = props.children;
        }
        delete props.children;
    }
    if (isArray(children)) {
        childNodes = [];
        addChildren(childNodes, children, type);
    } else if (isString(children) || isNumber(children)) {
        children = createVText(String(children));
    } else if (!isValidElement(children)) {
        children = EMPTY_CHILDREN;
    }
    return createVNode(type, props, childNodes !== undefined ? childNodes : children, props.key, props.namespace, props.owner, props.ref);
}
function addChildren(childNodes, children, type) {
    if (isString(children) || isNumber(children)) {
        childNodes.push(createVText(String(children)));
    } else if (isValidElement(children)) {
        childNodes.push(children);
    } else if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            addChildren(childNodes, children[i], type);
        }
    }
}

var ComponentWrapper = function ComponentWrapper(type, props) {
    this.vtype = 4 /* Composite */;
    this.type = type;
    this.name = type.name || type.toString().match(/^function\s*([^\s(]+)/)[1];
    type.displayName = this.name;
    this._owner = props.owner;
    delete props.owner;
    this.props = props;
    this.key = props.key;
    this.dom = null;
};
ComponentWrapper.prototype.init = function init(parentContext, parentComponent) {
    return mountComponent(this, parentContext, parentComponent);
};
ComponentWrapper.prototype.update = function update(previous, current, parentContext, domNode) {
    return reRenderComponent(previous, this);
};
ComponentWrapper.prototype.destroy = function destroy() {
    unmountComponent(this);
};

var StateLessComponent = function StateLessComponent(type, props) {
    this.vtype = 8 /* Stateless */;
    this.type = type;
    this._owner = props.owner;
    delete props.owner;
    this.props = props;
    this.key = props.key;
};
StateLessComponent.prototype.init = function init(parentContext) {
    return mountStatelessComponent(this, parentContext);
};
StateLessComponent.prototype.update = function update(previous, current, parentContext, domNode) {
    var props = current.props;
    var state = current.state;
    var context = current.context;
    var shouldComponentUpdate = props.onShouldComponentUpdate;
    if (isFunction(shouldComponentUpdate) && !shouldComponentUpdate(props, state, context)) {
        return domNode;
    }
    return reRenderStatelessComponent(previous, this, parentContext, domNode);
};
StateLessComponent.prototype.destroy = function destroy() {
    unmountStatelessComponent(this);
};

function transformPropsForRealTag(type, props) {
    var newProps = {};
    for (var propName in props) {
        var propValue = props[propName];
        if (propName === 'defaultValue') {
            newProps.value = props.value || props.defaultValue;
            continue;
        }
        var svgPropName = SVGPropertyConfig.DOMAttributeNames[propName];
        if (svgPropName && svgPropName !== propName) {
            newProps[svgPropName] = propValue;
            continue;
        }
        newProps[propName] = propValue;
    }
    return newProps;
}
/**
 *
 * @param props
 * @param defaultProps
 * defaultProps should respect null but ignore undefined
 * @see: https://facebook.github.io/react/docs/react-component.html#defaultprops
 */
function transformPropsForComponent(props, defaultProps) {
    var newProps = {};
    for (var propName in props) {
        var propValue = props[propName];
        newProps[propName] = propValue;
    }
    if (defaultProps) {
        for (var propName$1 in defaultProps) {
            if (newProps[propName$1] === undefined) {
                newProps[propName$1] = defaultProps[propName$1];
            }
        }
    }
    return newProps;
}
function createElement$2(type, properties) {
    var _children = [],
        len = arguments.length - 2;
    while (len-- > 0) _children[len] = arguments[len + 2];

    var children = _children;
    if (_children) {
        if (_children.length === 1) {
            children = _children[0];
        } else if (_children.length === 0) {
            children = undefined;
        }
    }
    var props;
    if (isString(type)) {
        props = transformPropsForRealTag(type, properties);
        props.owner = Current.current;
        return h(type, props, children);
    } else if (isFunction(type)) {
        props = transformPropsForComponent(properties, type.defaultProps);
        if (!props.children) {
            props.children = children || EMPTY_CHILDREN;
        }
        props.owner = Current.current;
        return type.prototype && type.prototype.render ? new ComponentWrapper(type, props) : new StateLessComponent(type, props);
    }
    return type;
}

function cloneElement(vnode, props) {
    var children = [],
        len = arguments.length - 2;
    while (len-- > 0) children[len] = arguments[len + 2];

    if (isVText(vnode)) {
        return vnode;
    }
    var properties = extend(clone(vnode.props), props);
    if (vnode.namespace) {
        properties.namespace = vnode.namespace;
    }
    return createElement$2(vnode.type, properties, arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
}

var Children = {
    map: function map(children, fn, ctx) {
        if (isNullOrUndef(children)) {
            return children;
        }
        children = Children.toArray(children);
        if (ctx && ctx !== children) {
            fn = fn.bind(ctx);
        }
        return children.map(fn);
    },
    forEach: function forEach(children, fn, ctx) {
        if (isNullOrUndef(children)) {
            return;
        }
        children = Children.toArray(children);
        if (ctx && ctx !== children) {
            fn = fn.bind(ctx);
        }
        for (var i = 0, len = children.length; i < len; i++) {
            fn(children[i], i, children);
        }
    },
    count: function count(children) {
        children = Children.toArray(children);
        return children.length;
    },
    only: function only(children) {
        children = Children.toArray(children);
        if (children.length !== 1) {
            throw new Error('Children.only() expects only one child.');
        }
        return children[0];
    },
    toArray: function toArray(children) {
        if (isNullOrUndef(children)) {
            return [];
        }
        return isArray(children) ? children : EMPTY_CHILDREN.concat(children);
    }
};

function unmountComponentAtNode(dom) {
    var component = dom._component;
    if (isValidElement(component)) {
        unmount(component, dom);
        delete dom._component;
        return true;
    }
    return false;
}
function findDOMNode(component) {
    return component && component.dom;
}

var index = {
    Children: Children,
    Component: Component,
    PureComponent: PureComponent,
    createElement: createElement$2,
    cloneElement: cloneElement,
    render: render,
    nextTick: nextTick,
    options: options,
    findDOMNode: findDOMNode,
    isValidElement: isValidElement,
    unmountComponentAtNode: unmountComponentAtNode
};

exports.Children = Children;
exports.Component = Component;
exports.PureComponent = PureComponent;
exports.createElement = createElement$2;
exports.cloneElement = cloneElement;
exports.render = render;
exports.nextTick = nextTick;
exports.options = options;
exports.findDOMNode = findDOMNode;
exports.isValidElement = isValidElement;
exports.unmountComponentAtNode = unmountComponentAtNode;
exports['default'] = index;

})));
//# sourceMappingURL=nerv.js.map

// Nerv.Module.define('link', function (require, exports, module) {
// 'use strict';
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.jsonp=r()}(this,function(){"use strict";function e(e){if(null===e||void 0===e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}function r(e){return e?Object.keys(e).map(function(r){return r+"="+g(e[r])}).join("&"):""}function t(e){return"function"==typeof e}function n(e,r){e||(e=window.location.href),r=r.replace(/[[]]/g,"\\$&");var t=RegExp("[?&]"+r+"(=([^&#]*)|&|#|$)"),n=t.exec(e);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}function o(e,r,t){var n=RegExp("([?&])"+r+"=.*?(&|$)","i"),o=-1!==e.indexOf("?")?"&":"?";return e.match(n)?e.replace(n,"$1"+r+"="+t+"$2"):e+o+r+"="+t}function i(e,r,n){if(t(e)?(n=e,r={}):e&&"object"===(void 0===e?"undefined":C(e))&&(n=r,r=e||{},e=r.url),t(r)&&(n=r,r={}),r||(r={}),r=b({},P,r),e=e||r.url,n=n||w,e&&"string"==typeof e){var o=a(e,r.params),c=s({useStore:r.useStore,storeKey:o,storeCheck:r.storeCheck,storeCheckKey:r.storeCheckKey,storeSign:r.storeSign,dataCheck:r.dataCheck});if(c){if(n(null,c),!i.promiseClose&&S)return new Promise(function(e){return e(c)})}else{if(r.originalUrl=o,!i.promiseClose&&S)return new Promise(function(e,t){u(o,r,function(r,o){if(r)return n(r),t(r);n(null,o),e(o)})});u(o,r,n)}}else if(n(Error("Param url is needed!")),!i.promiseClose&&S)return new Promise(function(e,r){return r(Error("Param url is needed!"))})}function a(e,t){return t="string"==typeof t?t:r(t),e+=(~e.indexOf("?")?"&":"?")+t,e=e.replace("?&","?")}function u(e,r,t){function i(e){h.parentNode&&h.parentNode.removeChild(h),j[e]=w,clearTimeout(j["timer_"+e])}var a=r.originalUrl,c=r.charset,s=n(e,r.jsonp),l="?"!==s&&s||r.name||"__jsonp"+x++,m=arguments[3]||null;s?"?"===s&&(e=o(e,r.jsonp,O(l))):e+=("&"===e.split("").pop()?"":"&")+r.jsonp+"="+O(l),r.cache||(e+=("&"===e.split("").pop()?"":"&")+"_="+(new Date).getTime()),clearTimeout(j["timer_"+l]);var y=j[l];j[l]=function(e){if(y&&y(e),i(l),m&&(e.__$$backupCall=m),r.dataCheck){if(!1!==r.dataCheck(e))return f({useStore:r.useStore,storeKey:a,data:e}),t(null,e);!1===d(a,r,t)&&t(Error("Data check error, and no fallback"))}else f({useStore:r.useStore,storeKey:a,data:e}),t(null,e)};var h=p({url:e,charset:c}),b=null!=r.timeout?r.timeout:K;j["timer_"+l]=setTimeout(function(){return i(l),"number"==typeof r.retryTimes&&r.retryTimes>0?(r.retryTimes--,u(a,r,t)):!1===d(a,r,t)?t(Error("Timeout and no data return")):void 0},b)}function c(e,r,t){return!!(e&&r&&t)&&(e[r]&&e[r]===t)}function s(e){var r=e.useStore,t=e.storeKey,n=e.storeCheck,o=e.storeCheckKey,i=e.storeSign,a=e.dataCheck;if(r=!!r&&_.enabled){var u=_.get(t);if((n=n||c)(u,o,i)&&(!a||u&&a&&!1!==a(u)))return u}return null}function l(e){var r=e.useStore,t=e.storeKey,n=e.dataCheck;if(r=!!r&&_.enabled){var o=_.get(t);if(!n||o&&n&&!1!==n(o))return o}return null}function f(e){var r=e.useStore,t=e.storeKey,n=e.data;(r=!!r&&_.enabled)&&_.set(t,n)}function d(e,r,t){var n=r.backup,o=void 0;if(n){if("string"==typeof n)return delete r.backup,o=a(n,r.params),u(o,r,t,{backup:n});if(Array.isArray(n)&&n.length){var i=n.shift();return o=a(i,r.params),u(o,r,t,{backup:i})}}var c=l({useStore:r.useStore,storeKey:e,dataCheck:r.dataCheck});return!!c&&(t(null,c),!0)}function p(e){var r=e.url,t=e.charset;if(E){var n=E.createElement("script");return n.type="text/javascript",t&&(n.charset=t),n.src=r,T.appendChild(n),n}}var m=Object.getOwnPropertySymbols,y=Object.prototype.hasOwnProperty,h=Object.prototype.propertyIsEnumerable,b=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var r={},t=0;t<10;t++)r["_"+String.fromCharCode(t)]=t;if("0123456789"!==Object.getOwnPropertyNames(r).map(function(e){return r[e]}).join(""))return!1;var n={};return"abcdefghijklmnopqrst".split("").forEach(function(e){n[e]=e}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},n)).join("")}catch(e){return!1}}()?Object.assign:function(r){for(var t,n,o=e(r),i=1;i<arguments.length;i++){t=Object(arguments[i]);for(var a in t)y.call(t,a)&&(o[a]=t[a]);if(m){n=m(t);for(var u=0;u<n.length;u++)h.call(t,n[u])&&(o[n[u]]=t[n[u]])}}return o},g=encodeURIComponent,v="undefined"!=typeof window?window:global,k=v["localStorage"],_={disabled:!1,set:function(e,r){return void 0===r?_.remove(e):(k.setItem(e,_.serialize(r)),r)},get:function(e,r){var t=_.deserialize(k.getItem(e));return void 0===t?r:t},remove:function(e){k.removeItem(e)},clear:function(){k.clear()},has:function(e){return void 0!==_.get(e)},forEach:function(e){for(var r=0;r<k.length;r++){var t=k.key(r);e(t,_.get(t))}},getAll:function(){var e={};return _.forEach(function(r,t){e[r]=t}),e},serialize:function(e){return JSON.stringify(e)},deserialize:function(e){if("string"==typeof e)try{return JSON.parse(e)}catch(r){return e||void 0}}};try{_.set("__store__","__store__"),"__store__"!==_.get("__store__")&&(_.disabled=!0),_.remove("__store__")}catch(e){_.disabled=!0}_.enabled=!_.disabled;var C="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},j="undefined"!=typeof window?window:global,S=function(){return"Promise"in j&&C(t(Promise))}(),w=function(){},O=encodeURIComponent,E=j.document,T=E?E.head||E.getElementsByTagName("head")[0]:null,K=2e3,P={timeout:K,retryTimes:2,backup:null,params:{},jsonp:"callback",name:null,cache:!1,useStore:!1,storeCheck:null,storeSign:null,storeCheckKey:null,dataCheck:null,charset:"UTF-8"},x=(new Date).getTime();return i});
//# sourceMappingURL=jsonp.min.js.map

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Link = function (_Nerv$Component) {
  _inherits(Link, _Nerv$Component);

  function Link() {
    _classCallCheck(this, Link);

    var _this = _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));

    _this.state = {
      data: [],
      smallerScreen: false,
      uuid: ''
    };
    return _this;
  }

  _createClass(Link, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var href = window.location.href;
      if (href.indexOf('fresh.jd.com/') !== -1) {
        this.setState({
          smallerScreen: true
        });
      }
      var groupId = void 0;
      var skuId = [];
      var search = window.location.search;
      if (search) {
        var arr = search.slice(1, search.length).split('&');
        arr.forEach(function (item) {
          if (item.indexOf('productId=') !== -1) {
            groupId = Number(item.split('=')[1]) ? item.split('=')[1] : '';
          } else if (item.indexOf('skuId=') !== -1) {
            var skus = item.split('=')[1].split('_');
            skus && skus.length > 0 && skus.forEach(function (obj) {
              Number(obj) && skuId.push(obj);
            });
          }
        });
      }
      var topInfo = {};
      topInfo[groupId] = skuId;
      var body = {
        ids: groupId,
        sourceCode: 'student',
        pageId: 'student',
        currentStageFlag: 'Y',
        topInfo: topInfo
      };

      var uuid = '';
      var self = this;
//       window.addEventListener("load", function () {
        uuid = typeof window.getCookie === 'function' && window.getCookie('__jda') && window.getCookie('__jda').split('.')[1];
        self.getData(body, uuid, groupId);
//       });
    }
  }, {
    key: 'getData',
    value: function getData(body, uuid, groupId) {
      var _this2 = this;

      jsonp('//api.m.jd.com/api', {
        params: {
          functionId: 'queryMatProdsForGrps',
          body: JSON.stringify(body),
          uuid: uuid || '508044610',
          client: 'wh5',
          clientVersion: '1.0.0',
          loginType: '3'
        },
        name: 'jQueryass'
      }, function (error, res) {
        if (error) {
          return null;
        } else {
          var productList = [];
          productList = res && res.groupList[0] && res.groupList[0].stageList[0] && res.groupList[0].stageList[0].productList;
          var data = [];
          var skus = [];
          if (productList && productList.length > 0) {
            var num = 5;
            if (productList.length < 5) {
              num = productList.length;
            }
            for (var m = 0; m < num; m++) {
              productList[m] && data.push({
                img: productList[m].image,
                title: productList[m].name,
                price: '',
                uri: '//item.jd.com/' + productList[m].skuId + '.html',
                skuId: productList[m].skuId,
                groupId: groupId
              });
              productList[m] && skus.push(productList[m].skuId);
            }
          }
          _this2.getPrice(skus, data);
        }
      });
    }
  }, {
    key: 'getPrice',
    value: function getPrice(skus, data) {
      var _this3 = this;

      skus.length > 0 && jsonp('//p.3.cn/prices/mgets', {
        params: {
          type: 1,
          skuIds: skus.join(',')
        },
        name: 'jquery'
      }, function (error, res) {
        if (error) {
          return null;
        } else {
          res.forEach(function (element) {
            data.forEach(function (item) {
              if (element.id === 'J_' + item.skuId) {
                item.price = element.p;
              }
            });
          });
          _this3.setState({
            data: data
          });
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var clos = 1200;
      if (this.state.smallerScreen) {
        clos = 1190;
      }
      return Nerv.createElement(
        'section',
        { className: 'linkage', 'data-role': 'LinkAge', 'data-lift': '\u5185\u5916\u8054\u52A8' },
        Nerv.createElement(
          'div',
          { className: 'body--' + clos + ' body' },
          Nerv.createElement(
            'ul',
            null,
            this.state.data && this.state.data.map(function (item, index) {
              return Nerv.createElement(
                'li',
                { key: index },
                Nerv.createElement(
                  'div',
                  { className: 'img' },
                  Nerv.createElement(
                    'a',
                    { href: item.uri, target: '_blank', title: item.title, clstag: 'channel|keycount|' + item.groupId + '|home_product_' + item.skuId },
                    Nerv.createElement('img', { src: item.img, alt: '' })
                  )
                ),
                Nerv.createElement(
                  'div',
                  { className: 'title' },
                  Nerv.createElement(
                    'a',
                    { href: item.uri, target: '_blank', title: item.title, clstag: 'channel|keycount|' + item.groupId + '|home_product_' + item.skuId },
                    item.title
                  )
                ),
                Nerv.createElement(
                  'div',
                  { className: 'priceBox' },
                  Nerv.createElement(
                    'span',
                    { className: 'yen' },
                    '\xA5'
                  ),
                  item.price
                )
              );
            })
          )
        )
      );
    }
  }]);
  

  return Link;
}(Nerv.Component);
Nerv.render(Nerv.createElement(Link, null), document.getElementById('J_container'));

// module.exports = Link;
// })
// 
// Nerv.Module.use(['link'],function(){
// 	alert('dddd')
// })