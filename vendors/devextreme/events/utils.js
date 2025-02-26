/**
 * DevExtreme (events/utils.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("./core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _errors = require("../core/errors");
var _errors2 = _interopRequireDefault(_errors);
var _selectors = require("../ui/widget/selectors");
var _extend = require("../core/utils/extend");
var _iterator = require("../core/utils/iterator");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var KEY_MAP = {
    backspace: "backspace",
    tab: "tab",
    enter: "enter",
    escape: "escape",
    pageup: "pageUp",
    pagedown: "pageDown",
    end: "end",
    home: "home",
    arrowleft: "leftArrow",
    arrowup: "upArrow",
    arrowright: "rightArrow",
    arrowdown: "downArrow",
    "delete": "del",
    " ": "space",
    f: "F",
    a: "A",
    "*": "asterisk",
    "-": "minus",
    alt: "alt",
    control: "control",
    shift: "shift",
    left: "leftArrow",
    up: "upArrow",
    right: "rightArrow",
    down: "downArrow",
    multiply: "asterisk",
    spacebar: "space",
    del: "del",
    subtract: "minus"
};
var LEGACY_KEY_CODES = {
    8: "backspace",
    9: "tab",
    13: "enter",
    27: "escape",
    33: "pageUp",
    34: "pageDown",
    35: "end",
    36: "home",
    37: "leftArrow",
    38: "upArrow",
    39: "rightArrow",
    40: "downArrow",
    46: "del",
    32: "space",
    70: "F",
    65: "A",
    106: "asterisk",
    109: "minus",
    189: "minus",
    173: "minus",
    16: "shift",
    17: "control",
    18: "alt"
};
var eventSource = function() {
    var EVENT_SOURCES_REGEX = {
        dx: /^dx/i,
        mouse: /(mouse|wheel)/i,
        touch: /^touch/i,
        keyboard: /^key/i,
        pointer: /^(ms)?pointer/i
    };
    return function(e) {
        var result = "other";
        (0, _iterator.each)(EVENT_SOURCES_REGEX, function(key) {
            if (this.test(e.type)) {
                result = key;
                return false
            }
        });
        return result
    }
}();
var isDxEvent = function(e) {
    return "dx" === eventSource(e)
};
var isNativeMouseEvent = function(e) {
    return "mouse" === eventSource(e)
};
var isNativeTouchEvent = function(e) {
    return "touch" === eventSource(e)
};
var isPointerEvent = function(e) {
    return "pointer" === eventSource(e)
};
var isMouseEvent = function(e) {
    return isNativeMouseEvent(e) || (isPointerEvent(e) || isDxEvent(e)) && "mouse" === e.pointerType
};
var isDxMouseWheelEvent = function(e) {
    return e && "dxmousewheel" === e.type
};
var isTouchEvent = function(e) {
    return isNativeTouchEvent(e) || (isPointerEvent(e) || isDxEvent(e)) && "touch" === e.pointerType
};
var isKeyboardEvent = function(e) {
    return "keyboard" === eventSource(e)
};
var isFakeClickEvent = function(e) {
    return 0 === e.screenX && !e.offsetX && 0 === e.pageX
};
var eventData = function(e) {
    return {
        x: e.pageX,
        y: e.pageY,
        time: e.timeStamp
    }
};
var eventDelta = function(from, to) {
    return {
        x: to.x - from.x,
        y: to.y - from.y,
        time: to.time - from.time || 1
    }
};
var hasTouches = function(e) {
    if (isNativeTouchEvent(e)) {
        return (e.originalEvent.touches || []).length
    }
    if (isDxEvent(e)) {
        return (e.pointers || []).length
    }
    return 0
};
var needSkipEvent = function(e) {
    var target = e.target;
    var $target = (0, _renderer2.default)(target);
    var touchInInput = $target.is("input, textarea, select");
    if ($target.is(".dx-skip-gesture-event *, .dx-skip-gesture-event")) {
        return true
    }
    if (isDxMouseWheelEvent(e)) {
        var isContentEditableFocused = target.isContentEditable && $target.closest("div[contenteditable='true']").is(":focus");
        var isInputFocused = $target.is("input[type='number'], textarea, select") && $target.is(":focus");
        return isInputFocused || isContentEditableFocused
    }
    if (isMouseEvent(e)) {
        return touchInInput || e.which > 1
    }
    if (isTouchEvent(e)) {
        return touchInInput && (0, _selectors.focused)($target)
    }
};
var fixMethod = function(e) {
    return e
};
var setEventFixMethod = function(func) {
    fixMethod = func
};
var copyEvent = function(originalEvent) {
    return fixMethod(_events_engine2.default.Event(originalEvent, originalEvent), originalEvent)
};
var createEvent = function(originalEvent, args) {
    var event = copyEvent(originalEvent);
    if (args) {
        (0, _extend.extend)(event, args)
    }
    return event
};
var fireEvent = function(props) {
    var event = createEvent(props.originalEvent, props);
    _events_engine2.default.trigger(props.delegateTarget || event.target, event);
    return event
};
var addNamespace = function addNamespace(eventNames, namespace) {
    if (!namespace) {
        throw _errors2.default.Error("E0017")
    }
    if ("string" === typeof eventNames) {
        if (eventNames.indexOf(" ") === -1) {
            return eventNames + "." + namespace
        }
        return addNamespace(eventNames.split(/\s+/g), namespace)
    }(0, _iterator.each)(eventNames, function(index, eventName) {
        eventNames[index] = eventName + "." + namespace
    });
    return eventNames.join(" ")
};
var normalizeKeyName = function(event) {
    var isKeySupported = !!event.key;
    var key = isKeySupported ? event.key : event.which;
    if (!key) {
        return
    }
    if (isKeySupported) {
        key = KEY_MAP[key.toLowerCase()] || key
    } else {
        key = LEGACY_KEY_CODES[key] || String.fromCharCode(key)
    }
    return key
};
var getChar = function(event) {
    return event.key || String.fromCharCode(event.which)
};
module.exports = {
    eventSource: eventSource,
    isPointerEvent: isPointerEvent,
    isMouseEvent: isMouseEvent,
    isDxMouseWheelEvent: isDxMouseWheelEvent,
    isTouchEvent: isTouchEvent,
    isKeyboardEvent: isKeyboardEvent,
    isFakeClickEvent: isFakeClickEvent,
    hasTouches: hasTouches,
    eventData: eventData,
    eventDelta: eventDelta,
    needSkipEvent: needSkipEvent,
    createEvent: createEvent,
    fireEvent: fireEvent,
    addNamespace: addNamespace,
    setEventFixMethod: setEventFixMethod,
    normalizeKeyName: normalizeKeyName,
    getChar: getChar
};
