/**
 * DevExtreme (ui/number_box/number_box.spins.js)
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
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _button = require("../text_box/texteditor_button_collection/button");
var _button2 = _interopRequireDefault(_button);
var _number_box = require("./number_box.spin");
var _number_box2 = _interopRequireDefault(_number_box);
var _utils = require("../../events/utils");
var _pointer = require("../../events/pointer");
var _extend = require("../../core/utils/extend");

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
var SPIN_CLASS = "dx-numberbox-spin";
var SPIN_CONTAINER_CLASS = "dx-numberbox-spin-container";
var SPIN_TOUCH_FRIENDLY_CLASS = "dx-numberbox-spin-touch-friendly";
var SpinButtons = function(_TextEditorButton) {
    _inherits(SpinButtons, _TextEditorButton);

    function SpinButtons() {
        _classCallCheck(this, SpinButtons);
        return _possibleConstructorReturn(this, (SpinButtons.__proto__ || Object.getPrototypeOf(SpinButtons)).apply(this, arguments))
    }
    _createClass(SpinButtons, [{
        key: "_attachEvents",
        value: function(instance, $spinContainer) {
            var editor = this.editor;
            var eventName = (0, _utils.addNamespace)(_pointer.down, editor.NAME);
            var $spinContainerChildren = $spinContainer.children();
            var pointerDownAction = editor._createAction(function(e) {
                return editor._spinButtonsPointerDownHandler(e)
            });
            _events_engine2.default.off($spinContainer, eventName);
            _events_engine2.default.on($spinContainer, eventName, function(e) {
                return pointerDownAction({
                    event: e
                })
            });
            _number_box2.default.getInstance($spinContainerChildren.eq(0)).option("onChange", function(e) {
                return editor._spinUpChangeHandler(e)
            });
            _number_box2.default.getInstance($spinContainerChildren.eq(1)).option("onChange", function(e) {
                return editor._spinDownChangeHandler(e)
            })
        }
    }, {
        key: "_create",
        value: function() {
            var editor = this.editor;
            var $spinContainer = (0, _renderer2.default)("<div>").addClass(SPIN_CONTAINER_CLASS);
            var $spinUp = (0, _renderer2.default)("<div>").appendTo($spinContainer);
            var $spinDown = (0, _renderer2.default)("<div>").appendTo($spinContainer);
            var options = this._getOptions();
            this._addToContainer($spinContainer);
            editor._createComponent($spinUp, _number_box2.default, (0, _extend.extend)({
                direction: "up"
            }, options));
            editor._createComponent($spinDown, _number_box2.default, (0, _extend.extend)({
                direction: "down"
            }, options));
            this._legacyRender(editor.$element(), this._isTouchFriendly(), options.visible);
            return {
                instance: $spinContainer,
                $element: $spinContainer
            }
        }
    }, {
        key: "_getOptions",
        value: function() {
            var editor = this.editor;
            var visible = this._isVisible();
            var disabled = editor.option("disabled");
            return {
                visible: visible,
                disabled: disabled
            }
        }
    }, {
        key: "_isVisible",
        value: function() {
            var editor = this.editor;
            return _get(SpinButtons.prototype.__proto__ || Object.getPrototypeOf(SpinButtons.prototype), "_isVisible", this).call(this) && editor.option("showSpinButtons")
        }
    }, {
        key: "_isTouchFriendly",
        value: function() {
            var editor = this.editor;
            return editor.option("showSpinButtons") && editor.option("useLargeSpinButtons")
        }
    }, {
        key: "_legacyRender",
        value: function($editor, isTouchFriendly, isVisible) {
            $editor.toggleClass(SPIN_TOUCH_FRIENDLY_CLASS, isTouchFriendly);
            $editor.toggleClass(SPIN_CLASS, isVisible)
        }
    }, {
        key: "update",
        value: function() {
            var shouldUpdate = _get(SpinButtons.prototype.__proto__ || Object.getPrototypeOf(SpinButtons.prototype), "update", this).call(this);
            if (shouldUpdate) {
                var editor = this.editor,
                    instance = this.instance;
                var $editor = editor.$element();
                var isVisible = this._isVisible();
                var isTouchFriendly = this._isTouchFriendly();
                var $spinButtons = instance.children();
                var spinUp = _number_box2.default.getInstance($spinButtons.eq(0));
                var spinDown = _number_box2.default.getInstance($spinButtons.eq(1));
                var options = this._getOptions();
                spinUp.option(options);
                spinDown.option(options);
                this._legacyRender($editor, isTouchFriendly, isVisible)
            }
        }
    }]);
    return SpinButtons
}(_button2.default);
exports.default = SpinButtons;
