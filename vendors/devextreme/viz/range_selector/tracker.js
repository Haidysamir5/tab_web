/**
 * DevExtreme (viz/range_selector/tracker.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var eventsEngine = require("../../events/core/events_engine"),
    pointerEvents = require("../../events/pointer"),
    window = require("../../core/utils/window").getWindow(),
    domAdapter = require("../../core/dom_adapter"),
    each = require("../../core/utils/iterator").each,
    msPointerEnabled = require("../../core/utils/support").pointer,
    MIN_MANUAL_SELECTING_WIDTH = 10;

function isLeftButtonPressed(event) {
    var e = event || window.event,
        originalEvent = e.originalEvent,
        touches = e.touches,
        pointerType = originalEvent ? originalEvent.pointerType : false,
        eventTouches = originalEvent ? originalEvent.touches : false,
        isMSPointerLeftClick = originalEvent && void 0 !== pointerType && (pointerType === (originalEvent.MSPOINTER_TYPE_TOUCH || "touch") || pointerType === (originalEvent.MSPOINTER_TYPE_MOUSE || "mouse") && 1 === originalEvent.buttons),
        isTouches = touches && touches.length > 0 || eventTouches && eventTouches.length > 0;
    return 1 === e.which || isMSPointerLeftClick || isTouches
}

function isMultiTouches(event) {
    var originalEvent = event.originalEvent,
        touches = event.touches,
        eventTouches = originalEvent && originalEvent.touches;
    return touches && touches.length > 1 || eventTouches && eventTouches.length > 1 || null
}

function preventDefault(e) {
    if (!isMultiTouches(e)) {
        e.preventDefault()
    }
}

function stopPropagationAndPreventDefault(e) {
    if (!isMultiTouches(e)) {
        e.stopPropagation();
        e.preventDefault()
    }
}

function isTouchEventArgs(e) {
    return e && e.type && 0 === e.type.indexOf("touch")
}

function getEventPageX(event) {
    var originalEvent = event.originalEvent,
        result = 0;
    if (event.pageX) {
        result = event.pageX
    } else {
        if (originalEvent && originalEvent.pageX) {
            result = originalEvent.pageX
        }
    }
    if (originalEvent && originalEvent.touches) {
        if (originalEvent.touches.length > 0) {
            result = originalEvent.touches[0].pageX
        } else {
            if (originalEvent.changedTouches.length > 0) {
                result = originalEvent.changedTouches[0].pageX
            }
        }
    }
    return result
}

function initializeAreaEvents(controller, area, state, getRootOffsetLeft) {
    var isTouchEvent, initialPosition, isActive = false,
        movingHandler = null,
        docEvents = {};
    docEvents[pointerEvents.move] = function(e) {
        var position, offset;
        if (isTouchEvent !== isTouchEventArgs(e)) {
            return
        }
        if (!isLeftButtonPressed(e)) {
            cancel()
        }
        if (isActive) {
            position = getEventPageX(e);
            offset = getRootOffsetLeft();
            if (movingHandler) {
                movingHandler(position - offset)
            } else {
                if (state.manualRangeSelectionEnabled && Math.abs(initialPosition - position) >= MIN_MANUAL_SELECTING_WIDTH) {
                    movingHandler = controller.placeSliderAndBeginMoving(initialPosition - offset, position - offset)
                }
            }
        }
    };
    docEvents[pointerEvents.up] = function(e) {
        var position;
        if (isActive) {
            position = getEventPageX(e);
            if (!movingHandler && state.moveSelectedRangeByClick && Math.abs(initialPosition - position) < MIN_MANUAL_SELECTING_WIDTH) {
                controller.moveSelectedArea(position - getRootOffsetLeft())
            }
            cancel()
        }
    };

    function cancel() {
        if (isActive) {
            isActive = false;
            if (movingHandler) {
                movingHandler.complete();
                movingHandler = null
            }
        }
    }
    area.on(pointerEvents.down, function(e) {
        if (!state.enabled || !isLeftButtonPressed(e) || isActive) {
            return
        }
        isActive = true;
        isTouchEvent = isTouchEventArgs(e);
        initialPosition = getEventPageX(e)
    });
    return docEvents
}

function initializeSelectedAreaEvents(controller, area, state, getRootOffsetLeft) {
    var isTouchEvent, isActive = false,
        movingHandler = null,
        docEvents = {};
    docEvents[pointerEvents.move] = function(e) {
        if (isTouchEvent !== isTouchEventArgs(e)) {
            return
        }
        if (!isLeftButtonPressed(e)) {
            cancel()
        }
        if (isActive) {
            preventDefault(e);
            movingHandler(getEventPageX(e) - getRootOffsetLeft())
        }
    };
    docEvents[pointerEvents.up] = cancel;

    function cancel() {
        if (isActive) {
            isActive = false;
            movingHandler.complete();
            movingHandler = null
        }
    }
    area.on(pointerEvents.down, function(e) {
        if (!state.enabled || !isLeftButtonPressed(e) || isActive) {
            return
        }
        isActive = true;
        isTouchEvent = isTouchEventArgs(e);
        movingHandler = controller.beginSelectedAreaMoving(getEventPageX(e) - getRootOffsetLeft());
        stopPropagationAndPreventDefault(e)
    });
    return docEvents
}

function initializeSliderEvents(controller, sliders, state, getRootOffsetLeft) {
    var isTouchEvent, isActive = false,
        movingHandler = null,
        docEvents = {};
    docEvents[pointerEvents.move] = function(e) {
        if (isTouchEvent !== isTouchEventArgs(e)) {
            return
        }
        if (!isLeftButtonPressed(e)) {
            cancel()
        }
        if (isActive) {
            preventDefault(e);
            movingHandler(getEventPageX(e) - getRootOffsetLeft())
        }
    };
    docEvents[pointerEvents.up] = cancel;
    each(sliders, function(i, slider) {
        var events = {};
        events[pointerEvents.down] = function(e) {
            if (!state.enabled || !isLeftButtonPressed(e) || isActive) {
                return
            }
            isActive = true;
            isTouchEvent = isTouchEventArgs(e);
            movingHandler = controller.beginSliderMoving(i, getEventPageX(e) - getRootOffsetLeft());
            stopPropagationAndPreventDefault(e)
        };
        events[pointerEvents.move] = function() {
            if (!movingHandler) {
                controller.foregroundSlider(i)
            }
        };
        slider.on(events)
    });

    function cancel() {
        if (isActive) {
            isActive = false;
            movingHandler.complete();
            movingHandler = null
        }
    }
    return docEvents
}

function Tracker(params) {
    var state = this._state = {},
        targets = params.controller.getTrackerTargets();
    if (msPointerEnabled) {
        params.renderer.root.css({
            msTouchAction: "pinch-zoom"
        })
    }
    this._docEvents = [initializeSelectedAreaEvents(params.controller, targets.selectedArea, state, getRootOffsetLeft), initializeAreaEvents(params.controller, targets.area, state, getRootOffsetLeft), initializeSliderEvents(params.controller, targets.sliders, state, getRootOffsetLeft)];
    each(this._docEvents, function(_, events) {
        eventsEngine.on(domAdapter.getDocument(), events)
    });

    function getRootOffsetLeft() {
        return params.renderer.getRootOffset().left
    }
}
Tracker.prototype = {
    constructor: Tracker,
    dispose: function() {
        each(this._docEvents, function(_, events) {
            eventsEngine.off(domAdapter.getDocument(), events)
        })
    },
    update: function(enabled, behavior) {
        var state = this._state;
        state.enabled = enabled;
        state.moveSelectedRangeByClick = behavior.moveSelectedRangeByClick;
        state.manualRangeSelectionEnabled = behavior.manualRangeSelectionEnabled
    }
};
exports.Tracker = Tracker;
