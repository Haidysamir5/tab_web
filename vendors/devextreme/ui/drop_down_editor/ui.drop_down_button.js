/**
 * DevExtreme (ui/drop_down_editor/ui.drop_down_button.js)
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
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _button = require("../text_box/texteditor_button_collection/button");
var _button2 = _interopRequireDefault(_button);
var _button3 = require("../button");
var _button4 = _interopRequireDefault(_button3);

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
var DROP_DOWN_EDITOR_BUTTON_CLASS = "dx-dropdowneditor-button";
var DROP_DOWN_EDITOR_BUTTON_VISIBLE = "dx-dropdowneditor-button-visible";
var BUTTON_MESSAGE = "dxDropDownEditor-selectLabel";
var ClearButton = function(_TextEditorButton) {
    _inherits(ClearButton, _TextEditorButton);

    function ClearButton() {
        _classCallCheck(this, ClearButton);
        return _possibleConstructorReturn(this, (ClearButton.__proto__ || Object.getPrototypeOf(ClearButton)).apply(this, arguments))
    }
    _createClass(ClearButton, [{
        key: "_attachEvents",
        value: function(instance) {
            var editor = this.editor;
            instance.option("onClick", function(e) {
                !editor.option("openOnFieldClick") && editor._openHandler(e)
            });
            _events_engine2.default.on(instance.$element(), "mousedown", function(e) {
                e.preventDefault()
            })
        }
    }, {
        key: "_create",
        value: function() {
            var editor = this.editor;
            var $element = (0, _renderer2.default)("<div>");
            var options = this._getOptions();
            this._addToContainer($element);
            var instance = editor._createComponent($element, _button4.default, options);
            instance.setAria("label", _message2.default.format(BUTTON_MESSAGE));
            this._legacyRender(editor.$element(), $element, options.visible);
            return {
                $element: $element,
                instance: instance
            }
        }
    }, {
        key: "_getOptions",
        value: function() {
            var editor = this.editor;
            var visible = this._isVisible();
            var isReadOnly = editor.option("readOnly");
            var template = editor._getTemplateByOption("dropDownButtonTemplate");
            return {
                focusStateEnabled: false,
                hoverStateEnabled: false,
                activeStateEnabled: false,
                useInkRipple: false,
                disabled: isReadOnly,
                visible: visible,
                template: template
            }
        }
    }, {
        key: "_isVisible",
        value: function() {
            var editor = this.editor;
            return _get(ClearButton.prototype.__proto__ || Object.getPrototypeOf(ClearButton.prototype), "_isVisible", this).call(this) && editor.option("showDropDownButton")
        }
    }, {
        key: "_legacyRender",
        value: function($editor, $element, isVisible) {
            $editor.toggleClass(DROP_DOWN_EDITOR_BUTTON_VISIBLE, isVisible);
            if ($element) {
                $element.removeClass("dx-button");
                $element.addClass(DROP_DOWN_EDITOR_BUTTON_CLASS)
            }
        }
    }, {
        key: "update",
        value: function() {
            var shouldUpdate = _get(ClearButton.prototype.__proto__ || Object.getPrototypeOf(ClearButton.prototype), "update", this).call(this);
            if (shouldUpdate) {
                var editor = this.editor,
                    instance = this.instance;
                var $editor = editor.$element();
                var options = this._getOptions();
                instance && instance.option(options);
                this._legacyRender($editor, instance && instance.$element(), options.visible)
            }
        }
    }]);
    return ClearButton
}(_button2.default);
exports.default = ClearButton;
