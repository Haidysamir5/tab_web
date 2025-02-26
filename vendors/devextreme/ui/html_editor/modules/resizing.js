/**
 * DevExtreme (ui/html_editor/modules/resizing.js)
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
var _renderer = require("../../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _click = require("../../../events/click");
var _utils = require("../../../events/utils");
var _translator = require("../../../animation/translator");
var _devices = require("../../../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _resizable = require("../../resizable");
var _resizable2 = _interopRequireDefault(_resizable);

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
var DX_RESIZE_FRAME_CLASS = "dx-resize-frame";
var DX_TOUCH_DEVICE_CLASS = "dx-touch-device";
var MODULE_NAMESPACE = "dxHtmlResizingModule";
var KEYDOWN_EVENT = (0, _utils.addNamespace)("keydown", MODULE_NAMESPACE);
var SCROLL_EVENT = (0, _utils.addNamespace)("scroll", MODULE_NAMESPACE);
var FRAME_PADDING = 1;
var ResizingModule = function() {
    function ResizingModule(quill, options) {
        _classCallCheck(this, ResizingModule);
        this.quill = quill;
        this.editorInstance = options.editorInstance;
        this.allowedTargets = options.allowedTargets || ["image"];
        this.enabled = !!options.enabled;
        if (this.enabled) {
            this._attachEvents();
            this._createResizeFrame()
        }
    }
    _createClass(ResizingModule, [{
        key: "_attachEvents",
        value: function() {
            _events_engine2.default.on(this.quill.root, (0, _utils.addNamespace)(_click.name, MODULE_NAMESPACE), this._clickHandler.bind(this));
            _events_engine2.default.on(this.quill.root, SCROLL_EVENT, this._scrollHandler.bind(this))
        }
    }, {
        key: "_detachEvents",
        value: function() {
            _events_engine2.default.off(this.quill.root, MODULE_NAMESPACE)
        }
    }, {
        key: "_clickHandler",
        value: function(e) {
            if (this._isAllowedTarget(e.target)) {
                if (this._$target === e.target) {
                    return
                }
                this._$target = e.target;
                this.updateFramePosition();
                this.showFrame()
            } else {
                if (this._$target) {
                    this.hideFrame()
                }
            }
        }
    }, {
        key: "_scrollHandler",
        value: function(e) {
            if (this._$target) {
                this.updateFramePosition()
            }
        }
    }, {
        key: "_isAllowedTarget",
        value: function(targetElement) {
            return this._isImage(targetElement)
        }
    }, {
        key: "_isImage",
        value: function(targetElement) {
            return this.allowedTargets.indexOf("image") !== -1 && "IMG" === targetElement.tagName.toUpperCase()
        }
    }, {
        key: "showFrame",
        value: function() {
            this._$resizeFrame.show();
            _events_engine2.default.on(this.quill.root, KEYDOWN_EVENT, this.hideFrame.bind(this))
        }
    }, {
        key: "hideFrame",
        value: function() {
            this._$target = null;
            this._$resizeFrame.hide();
            _events_engine2.default.off(this.quill.root, KEYDOWN_EVENT)
        }
    }, {
        key: "updateFramePosition",
        value: function() {
            var _$target = this._$target,
                height = _$target.height,
                width = _$target.width,
                offsetTop = _$target.offsetTop,
                offsetLeft = _$target.offsetLeft;
            var _quill$root = this.quill.root,
                scrollTop = _quill$root.scrollTop,
                scrollLeft = _quill$root.scrollLeft;
            var borderWidth = this._getBorderWidth();
            this._$resizeFrame.css({
                height: height,
                width: width,
                padding: FRAME_PADDING,
                top: offsetTop - borderWidth - scrollTop - FRAME_PADDING,
                left: offsetLeft - borderWidth - scrollLeft - FRAME_PADDING
            });
            (0, _translator.move)(this._$resizeFrame, {
                left: 0,
                top: 0
            })
        }
    }, {
        key: "_getBorderWidth",
        value: function() {
            return parseInt(this._$resizeFrame.css("borderTopWidth"))
        }
    }, {
        key: "_createResizeFrame",
        value: function() {
            var _this = this;
            if (this._$resizeFrame) {
                return
            }
            var _devices$current = _devices2.default.current(),
                deviceType = _devices$current.deviceType;
            this._$resizeFrame = (0, _renderer2.default)("<div>").addClass(DX_RESIZE_FRAME_CLASS).toggleClass(DX_TOUCH_DEVICE_CLASS, "desktop" !== deviceType).appendTo(this.editorInstance._getQuillContainer()).hide();
            this.editorInstance._createComponent(this._$resizeFrame, _resizable2.default, {
                onResize: function(e) {
                    if (!_this._$target) {
                        return
                    }
                    var correction = 2 * (FRAME_PADDING + _this._getBorderWidth());
                    (0, _renderer2.default)(_this._$target).attr({
                        height: e.height - correction,
                        width: e.width - correction
                    });
                    _this.updateFramePosition()
                }
            })
        }
    }, {
        key: "option",
        value: function(_option, value) {
            var _this2 = this;
            if ("mediaResizing" === _option) {
                Object.keys(value).forEach(function(optionName) {
                    return _this2.option(optionName, value[optionName])
                });
                return
            }
            if ("enabled" === _option) {
                this.enabled = value;
                value ? this._attachEvents() : this._detachEvents()
            } else {
                if ("allowedTargets" === _option && Array.isArray(value)) {
                    this.allowedTargets = value
                }
            }
        }
    }, {
        key: "clean",
        value: function() {
            this._detachEvents();
            this._$resizeFrame.remove();
            this._$resizeFrame = void 0
        }
    }]);
    return ResizingModule
}();
exports.default = ResizingModule;
