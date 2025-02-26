/**
 * DevExtreme (ui/toast.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    window = require("../core/utils/window").getWindow(),
    domAdapter = require("../core/dom_adapter"),
    eventsEngine = require("../events/core/events_engine"),
    ready = require("../core/utils/ready_callbacks").add,
    commonUtils = require("../core/utils/common"),
    typeUtils = require("../core/utils/type"),
    extend = require("../core/utils/extend").extend,
    inArray = require("../core/utils/array").inArray,
    pointerEvents = require("../events/pointer"),
    registerComponent = require("../core/component_registrator"),
    Overlay = require("./overlay"),
    themes = require("./themes");
var TOAST_CLASS = "dx-toast",
    TOAST_CLASS_PREFIX = TOAST_CLASS + "-",
    TOAST_WRAPPER_CLASS = TOAST_CLASS_PREFIX + "wrapper",
    TOAST_CONTENT_CLASS = TOAST_CLASS_PREFIX + "content",
    TOAST_MESSAGE_CLASS = TOAST_CLASS_PREFIX + "message",
    TOAST_ICON_CLASS = TOAST_CLASS_PREFIX + "icon",
    WIDGET_NAME = "dxToast",
    toastTypes = ["info", "warning", "error", "success"],
    TOAST_STACK = [],
    FIRST_Z_INDEX_OFFSET = 8e3,
    visibleToastInstance = null,
    POSITION_ALIASES = {
        top: {
            my: "top",
            at: "top",
            of: null,
            offset: "0 0"
        },
        bottom: {
            my: "bottom",
            at: "bottom",
            of: null,
            offset: "0 -20"
        },
        center: {
            my: "center",
            at: "center",
            of: null,
            offset: "0 0"
        },
        right: {
            my: "center right",
            at: "center right",
            of: null,
            offset: "0 0"
        },
        left: {
            my: "center left",
            at: "center left",
            of: null,
            offset: "0 0"
        }
    };
ready(function() {
    eventsEngine.subscribeGlobal(domAdapter.getDocument(), pointerEvents.down, function(e) {
        for (var i = TOAST_STACK.length - 1; i >= 0; i--) {
            if (!TOAST_STACK[i]._proxiedDocumentDownHandler(e)) {
                return
            }
        }
    })
});
var Toast = Overlay.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            message: "",
            type: "info",
            displayTime: 2e3,
            position: "bottom center",
            animation: {
                show: {
                    type: "fade",
                    duration: 400,
                    from: 0,
                    to: 1
                },
                hide: {
                    type: "fade",
                    duration: 400,
                    to: 0
                }
            },
            shading: false,
            height: "auto",
            closeOnBackButton: false,
            closeOnSwipe: true,
            closeOnClick: false,
            resizeEnabled: false
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function(_device) {
                return "win" === _device.platform && _device.version && 8 === _device.version[0]
            },
            options: {
                position: "top center",
                width: function() {
                    return $(window).width()
                }
            }
        }, {
            device: function(_device2) {
                return "win" === _device2.platform && _device2.version && 10 === _device2.version[0]
            },
            options: {
                position: "bottom right",
                width: "auto"
            }
        }, {
            device: {
                platform: "android"
            },
            options: {
                closeOnOutsideClick: true,
                width: "auto",
                position: {
                    at: "bottom left",
                    my: "bottom left",
                    offset: "20 -20"
                },
                animation: {
                    show: {
                        type: "slide",
                        duration: 200,
                        from: {
                            position: {
                                my: "top",
                                at: "bottom",
                                of: window
                            }
                        }
                    },
                    hide: {
                        type: "slide",
                        duration: 200,
                        to: {
                            position: {
                                my: "top",
                                at: "bottom",
                                of: window
                            }
                        }
                    }
                }
            }
        }, {
            device: function(_device3) {
                var isPhone = "phone" === _device3.deviceType,
                    isAndroid = "android" === _device3.platform,
                    isWin10 = "win" === _device3.platform && _device3.version && 10 === _device3.version[0];
                return isPhone && (isAndroid || isWin10)
            },
            options: {
                width: function() {
                    return $(window).width()
                },
                position: {
                    at: "bottom center",
                    my: "bottom center",
                    offset: "0 0"
                }
            }
        }, {
            device: function() {
                return themes.isMaterial()
            },
            options: {
                minWidth: 344,
                maxWidth: 568,
                displayTime: 4e3
            }
        }])
    },
    _init: function() {
        this.callBase();
        this._posStringToObject()
    },
    _renderContentImpl: function() {
        if (this.option("message")) {
            this._message = $("<div>").addClass(TOAST_MESSAGE_CLASS).text(this.option("message")).appendTo(this.$content())
        }
        this.setAria("role", "alert", this._message);
        if (inArray(this.option("type").toLowerCase(), toastTypes) > -1) {
            this.$content().prepend($("<div>").addClass(TOAST_ICON_CLASS))
        }
        this.callBase()
    },
    _render: function() {
        this.callBase();
        this.$element().addClass(TOAST_CLASS);
        this._wrapper().addClass(TOAST_WRAPPER_CLASS);
        this._$content.addClass(TOAST_CLASS_PREFIX + String(this.option("type")).toLowerCase());
        this.$content().addClass(TOAST_CONTENT_CLASS);
        this._toggleCloseEvents("Swipe");
        this._toggleCloseEvents("Click")
    },
    _renderScrollTerminator: commonUtils.noop,
    _toggleCloseEvents: function(event) {
        var dxEvent = "dx" + event.toLowerCase();
        eventsEngine.off(this._$content, dxEvent);
        this.option("closeOn" + event) && eventsEngine.on(this._$content, dxEvent, this.hide.bind(this))
    },
    _posStringToObject: function() {
        if (!typeUtils.isString(this.option("position"))) {
            return
        }
        var verticalPosition = this.option("position").split(" ")[0],
            horizontalPosition = this.option("position").split(" ")[1];
        this.option("position", extend({}, POSITION_ALIASES[verticalPosition]));
        switch (horizontalPosition) {
            case "center":
            case "left":
            case "right":
                this.option("position").at += " " + horizontalPosition;
                this.option("position").my += " " + horizontalPosition
        }
    },
    _show: function() {
        if (visibleToastInstance && visibleToastInstance !== this) {
            clearTimeout(visibleToastInstance._hideTimeout);
            visibleToastInstance.hide()
        }
        visibleToastInstance = this;
        return this.callBase.apply(this, arguments).done(function() {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = setTimeout(this.hide.bind(this), this.option("displayTime"))
        }.bind(this))
    },
    _hide: function() {
        visibleToastInstance = null;
        return this.callBase.apply(this, arguments)
    },
    _overlayStack: function() {
        return TOAST_STACK
    },
    _zIndexInitValue: function() {
        return this.callBase() + FIRST_Z_INDEX_OFFSET
    },
    _dispose: function() {
        clearTimeout(this._hideTimeout);
        visibleToastInstance = null;
        this.callBase()
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "type":
                this._$content.removeClass(TOAST_CLASS_PREFIX + args.previousValue);
                this._$content.addClass(TOAST_CLASS_PREFIX + String(args.value).toLowerCase());
                break;
            case "message":
                if (this._message) {
                    this._message.text(args.value)
                }
                break;
            case "closeOnSwipe":
                this._toggleCloseEvents("Swipe");
                break;
            case "closeOnClick":
                this._toggleCloseEvents("Click");
                break;
            case "displayTime":
            case "position":
                break;
            default:
                this.callBase(args)
        }
    }
});
registerComponent(WIDGET_NAME, Toast);
module.exports = Toast;
module.exports.default = module.exports;
