/**
 * DevExtreme (ui/scheduler/tooltip_strategies/mobileTooltipStrategy.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MobileTooltipStrategy = void 0;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
                descriptor.writable = true
            }
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Constructor.prototype, protoProps)
        }
        if (staticProps) {
            defineProperties(Constructor, staticProps)
        }
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (null === object) {
        object = Function.prototype
    }
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (void 0 === desc) {
        var parent = Object.getPrototypeOf(object);
        if (null === parent) {
            return
        } else {
            return get(parent, property, receiver)
        }
    } else {
        if ("value" in desc) {
            return desc.value
        } else {
            var getter = desc.get;
            if (void 0 === getter) {
                return
            }
            return getter.call(receiver)
        }
    }
};
var _overlay = require("../../overlay");
var _overlay2 = _interopRequireDefault(_overlay);
var _tooltipStrategyBase = require("./tooltipStrategyBase");
var _renderer = require("../../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _window = require("../../../core/utils/window");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && ("object" === typeof call || "function" === typeof call) ? call : self
}

function _inherits(subClass, superClass) {
    if ("function" !== typeof superClass && null !== superClass) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
    }
}
var SLIDE_PANEL_CLASS_NAME = "dx-scheduler-overlay-panel";
var MAX_OVERLAY_HEIGHT = 250;
var animationConfig = {
    show: {
        type: "slide",
        duration: 300,
        from: {
            position: {
                my: "top",
                at: "bottom",
                of: (0, _window.getWindow)()
            }
        },
        to: {
            position: {
                my: "center",
                at: "center",
                of: (0, _window.getWindow)()
            }
        }
    },
    hide: {
        type: "slide",
        duration: 300,
        to: {
            position: {
                my: "top",
                at: "bottom",
                of: (0, _window.getWindow)()
            }
        },
        from: {
            position: {
                my: "center",
                at: "center",
                of: (0, _window.getWindow)()
            }
        }
    }
};
var positionConfig = {
    my: "bottom",
    at: "bottom",
    of: (0, _window.getWindow)()
};
var MobileTooltipStrategy = exports.MobileTooltipStrategy = function(_TooltipStrategyBase) {
    _inherits(MobileTooltipStrategy, _TooltipStrategyBase);

    function MobileTooltipStrategy() {
        _classCallCheck(this, MobileTooltipStrategy);
        return _possibleConstructorReturn(this, (MobileTooltipStrategy.__proto__ || Object.getPrototypeOf(MobileTooltipStrategy)).apply(this, arguments))
    }
    _createClass(MobileTooltipStrategy, [{
        key: "_onListItemClick",
        value: function(e) {
            _get(MobileTooltipStrategy.prototype.__proto__ || Object.getPrototypeOf(MobileTooltipStrategy.prototype), "_onListItemClick", this).call(this, e);
            this.scheduler.showAppointmentPopup(e.itemData.data, false, e.itemData.currentData)
        }
    }, {
        key: "_shouldUseTarget",
        value: function() {
            return false
        }
    }, {
        key: "_onShowing",
        value: function() {
            this.tooltip.option("height", "auto");
            var height = this.list.$element().outerHeight();
            this.tooltip.option("height", height > MAX_OVERLAY_HEIGHT ? MAX_OVERLAY_HEIGHT : "auto")
        }
    }, {
        key: "_createTooltip",
        value: function(target, list) {
            var _this2 = this;
            var $overlay = (0, _renderer2.default)("<div>").addClass(SLIDE_PANEL_CLASS_NAME).appendTo(this.scheduler.$element());
            return this.scheduler._createComponent($overlay, _overlay2.default, {
                shading: false,
                position: positionConfig,
                animation: animationConfig,
                target: this.scheduler.$element(),
                container: this.scheduler.$element(),
                closeOnOutsideClick: true,
                width: "100%",
                height: "auto",
                onShowing: function() {
                    return _this2._onShowing()
                },
                contentTemplate: function() {
                    return list.$element()
                }
            })
        }
    }]);
    return MobileTooltipStrategy
}(_tooltipStrategyBase.TooltipStrategyBase);
