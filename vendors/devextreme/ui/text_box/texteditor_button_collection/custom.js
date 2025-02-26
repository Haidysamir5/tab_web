/**
 * DevExtreme (ui/text_box/texteditor_button_collection/custom.js)
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
var _renderer = require("../../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _button = require("./button");
var _button2 = _interopRequireDefault(_button);
var _button3 = require("../../button");
var _button4 = _interopRequireDefault(_button3);
var _extend = require("../../../core/utils/extend");
var _events_engine = require("../../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _hover = require("../../../events/hover");
var _hover2 = _interopRequireDefault(_hover);
var _click = require("../../../events/click");
var _click2 = _interopRequireDefault(_click);

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
var CUSTOM_BUTTON_HOVERED_CLASS = "dx-custom-button-hovered";
var CustomButton = function(_TextEditorButton) {
    _inherits(CustomButton, _TextEditorButton);

    function CustomButton() {
        _classCallCheck(this, CustomButton);
        return _possibleConstructorReturn(this, (CustomButton.__proto__ || Object.getPrototypeOf(CustomButton)).apply(this, arguments))
    }
    _createClass(CustomButton, [{
        key: "_attachEvents",
        value: function(instance, $element) {
            var editor = this.editor;
            _events_engine2.default.on($element, _hover2.default.start, function() {
                editor.$element().addClass(CUSTOM_BUTTON_HOVERED_CLASS)
            });
            _events_engine2.default.on($element, _hover2.default.end, function() {
                editor.$element().removeClass(CUSTOM_BUTTON_HOVERED_CLASS)
            });
            _events_engine2.default.on($element, _click2.default.name, function(e) {
                e.stopPropagation()
            })
        }
    }, {
        key: "_create",
        value: function() {
            var editor = this.editor;
            var $element = (0, _renderer2.default)("<div>");
            this._addToContainer($element);
            var instance = editor._createComponent($element, _button4.default, (0, _extend.extend)({}, this.options, {
                disabled: this._isDisabled()
            }));
            return {
                $element: $element,
                instance: instance
            }
        }
    }, {
        key: "update",
        value: function() {
            var isUpdated = _get(CustomButton.prototype.__proto__ || Object.getPrototypeOf(CustomButton.prototype), "update", this).call(this);
            if (this.instance) {
                this.instance.option("disabled", this._isDisabled())
            }
            return isUpdated
        }
    }, {
        key: "_isVisible",
        value: function() {
            var editor = this.editor;
            return editor.option("visible")
        }
    }, {
        key: "_isDisabled",
        value: function() {
            var isDefinedByUser = void 0 !== this.options.disabled;
            if (isDefinedByUser) {
                return this.instance ? this.instance.option("disabled") : this.options.disabled
            } else {
                return this.editor.option("readOnly")
            }
        }
    }]);
    return CustomButton
}(_button2.default);
exports.default = CustomButton;
