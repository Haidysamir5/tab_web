/**
 * DevExtreme (events/contextmenu.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    eventsEngine = require("../events/core/events_engine"),
    support = require("../core/utils/support"),
    devices = require("../core/devices"),
    Class = require("../core/class"),
    registerEvent = require("./core/event_registrator"),
    eventUtils = require("./utils"),
    holdEvent = require("./hold");
var CONTEXTMENU_NAMESPACE = "dxContexMenu",
    CONTEXTMENU_NAMESPACED_EVENT_NAME = eventUtils.addNamespace("contextmenu", CONTEXTMENU_NAMESPACE),
    HOLD_NAMESPACED_EVENT_NAME = eventUtils.addNamespace(holdEvent.name, CONTEXTMENU_NAMESPACE),
    CONTEXTMENU_EVENT_NAME = "dxcontextmenu";
var ContextMenu = Class.inherit({
    setup: function(element) {
        var $element = $(element);
        eventsEngine.on($element, CONTEXTMENU_NAMESPACED_EVENT_NAME, this._contextMenuHandler.bind(this));
        if (support.touch || devices.isSimulator()) {
            eventsEngine.on($element, HOLD_NAMESPACED_EVENT_NAME, this._holdHandler.bind(this))
        }
    },
    _holdHandler: function(e) {
        if (eventUtils.isMouseEvent(e) && !devices.isSimulator()) {
            return
        }
        this._fireContextMenu(e)
    },
    _contextMenuHandler: function(e) {
        this._fireContextMenu(e)
    },
    _fireContextMenu: function(e) {
        return eventUtils.fireEvent({
            type: CONTEXTMENU_EVENT_NAME,
            originalEvent: e
        })
    },
    teardown: function(element) {
        eventsEngine.off(element, "." + CONTEXTMENU_NAMESPACE)
    }
});
registerEvent(CONTEXTMENU_EVENT_NAME, new ContextMenu);
exports.name = CONTEXTMENU_EVENT_NAME;
