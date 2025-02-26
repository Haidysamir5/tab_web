/**
 * DevExtreme (events/pointer.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _support = require("../core/utils/support");
var _support2 = _interopRequireDefault(_support);
var _iterator = require("../core/utils/iterator");
var _browser = require("../core/utils/browser");
var _browser2 = _interopRequireDefault(_browser);
var _devices = require("../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _event_registrator = require("./core/event_registrator");
var _event_registrator2 = _interopRequireDefault(_event_registrator);
var _touch = require("./pointer/touch");
var _touch2 = _interopRequireDefault(_touch);
var _mspointer = require("./pointer/mspointer");
var _mspointer2 = _interopRequireDefault(_mspointer);
var _mouse = require("./pointer/mouse");
var _mouse2 = _interopRequireDefault(_mouse);
var _mouse_and_touch = require("./pointer/mouse_and_touch");
var _mouse_and_touch2 = _interopRequireDefault(_mouse_and_touch);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var getStrategy = function(support, device, browser) {
    if (support.pointerEvents && browser.msie) {
        return _mspointer2.default
    }
    var tablet = device.tablet,
        phone = device.phone;
    if (support.touch && !(tablet || phone)) {
        return _mouse_and_touch2.default
    }
    if (support.touch) {
        return _touch2.default
    }
    return _mouse2.default
};
var EventStrategy = getStrategy(_support2.default, _devices2.default.real(), _browser2.default);
(0, _iterator.each)(EventStrategy.map, function(pointerEvent, originalEvents) {
    (0, _event_registrator2.default)(pointerEvent, new EventStrategy(pointerEvent, originalEvents))
});
var pointer = {
    down: "dxpointerdown",
    up: "dxpointerup",
    move: "dxpointermove",
    cancel: "dxpointercancel",
    enter: "dxpointerenter",
    leave: "dxpointerleave",
    over: "dxpointerover",
    out: "dxpointerout"
};
module.exports = pointer;
