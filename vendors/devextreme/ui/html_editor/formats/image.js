/**
 * DevExtreme (ui/html_editor/formats/image.js)
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
var _quill_importer = require("../quill_importer");
var _type = require("../../../core/utils/type");

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
var quill = (0, _quill_importer.getQuill)();
var Image = quill.import("formats/image");
var ExtImage = function(_Image) {
    _inherits(ExtImage, _Image);

    function ExtImage() {
        _classCallCheck(this, ExtImage);
        return _possibleConstructorReturn(this, (ExtImage.__proto__ || Object.getPrototypeOf(ExtImage)).apply(this, arguments))
    }
    _createClass(ExtImage, [{
        key: "formats",
        value: function formats() {
            var formats = _get(ExtImage.prototype.__proto__ || Object.getPrototypeOf(ExtImage.prototype), "formats", this).call(this);
            var floatValue = this.domNode.style.float;
            if (floatValue) {
                formats.float = floatValue
            }
            return formats
        }
    }, {
        key: "format",
        value: function(name, value) {
            if ("float" === name) {
                this.domNode.style[name] = value
            } else {
                _get(ExtImage.prototype.__proto__ || Object.getPrototypeOf(ExtImage.prototype), "format", this).call(this, name, value)
            }
        }
    }], [{
        key: "create",
        value: function(data) {
            var SRC = data && data.src || data;
            var node = _get(ExtImage.__proto__ || Object.getPrototypeOf(ExtImage), "create", this).call(this, SRC);
            if ((0, _type.isObject)(data)) {
                var setAttribute = function(attr, value) {
                    data[attr] && node.setAttribute(attr, value)
                };
                setAttribute("alt", data.alt);
                setAttribute("width", data.width);
                setAttribute("height", data.height)
            }
            return node
        }
    }, {
        key: "formats",
        value: function formats(domNode) {
            var formats = _get(ExtImage.__proto__ || Object.getPrototypeOf(ExtImage), "formats", this).call(this, domNode);
            formats.imageSrc = domNode.getAttribute("src");
            return formats
        }
    }, {
        key: "value",
        value: function(domNode) {
            return {
                src: domNode.getAttribute("src"),
                width: domNode.getAttribute("width"),
                height: domNode.getAttribute("height"),
                alt: domNode.getAttribute("alt")
            }
        }
    }]);
    return ExtImage
}(Image);
ExtImage.blotName = "extendedImage";
exports.default = ExtImage;
