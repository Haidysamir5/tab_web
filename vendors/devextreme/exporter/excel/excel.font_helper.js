/**
 * DevExtreme (exporter/excel/excel.font_helper.js)
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
var _type = require("../../core/utils/type");
var _excel = require("./excel.tag_helper");
var _excel2 = _interopRequireDefault(_excel);
var _excel3 = require("./excel.color_helper");
var _excel4 = _interopRequireDefault(_excel3);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var fontHelper = {
    tryCreateTag: function(sourceObj) {
        var result = null;
        if ((0, _type.isDefined)(sourceObj)) {
            result = {
                size: sourceObj.size,
                name: sourceObj.name,
                family: sourceObj.family,
                scheme: sourceObj.scheme,
                bold: sourceObj.bold,
                italic: sourceObj.italic,
                underline: sourceObj.underline,
                color: _excel4.default.tryCreateTag(sourceObj.color)
            };
            if (fontHelper.isEmpty(result)) {
                result = null
            }
        }
        return result
    },
    copy: function(source) {
        var result = null;
        if ((0, _type.isDefined)(source)) {
            result = {};
            if (void 0 !== source.size) {
                result.size = source.size
            }
            if (void 0 !== source.name) {
                result.name = source.name
            }
            if (void 0 !== source.family) {
                result.family = source.family
            }
            if (void 0 !== source.scheme) {
                result.scheme = source.scheme
            }
            if (void 0 !== source.bold) {
                result.bold = source.bold
            }
            if (void 0 !== source.italic) {
                result.italic = source.italic
            }
            if (void 0 !== source.underline) {
                result.underline = source.underline
            }
            if (void 0 !== source.color) {
                result.color = _excel4.default.copy(source.color)
            }
        }
        return result
    },
    areEqual: function(leftTag, rightTag) {
        return fontHelper.isEmpty(leftTag) && fontHelper.isEmpty(rightTag) || (0, _type.isDefined)(leftTag) && (0, _type.isDefined)(rightTag) && leftTag.size === rightTag.size && leftTag.name === rightTag.name && leftTag.family === rightTag.family && leftTag.scheme === rightTag.scheme && (leftTag.bold === rightTag.bold || !leftTag.bold === !rightTag.bold) && (leftTag.italic === rightTag.italic || !leftTag.italic === !rightTag.italic) && leftTag.underline === rightTag.underline && _excel4.default.areEqual(leftTag.color, rightTag.color)
    },
    isEmpty: function(tag) {
        return !(0, _type.isDefined)(tag) || !(0, _type.isDefined)(tag.size) && !(0, _type.isDefined)(tag.name) && !(0, _type.isDefined)(tag.family) && !(0, _type.isDefined)(tag.scheme) && (!(0, _type.isDefined)(tag.bold) || !tag.bold) && (!(0, _type.isDefined)(tag.italic) || !tag.italic) && !(0, _type.isDefined)(tag.underline) && _excel4.default.isEmpty(tag.color)
    },
    toXml: function(tag) {
        var content = [(0, _type.isDefined)(tag.bold) && tag.bold ? _excel2.default.toXml("b", {}) : "", (0, _type.isDefined)(tag.size) ? _excel2.default.toXml("sz", {
            val: tag.size
        }) : "", (0, _type.isDefined)(tag.color) ? _excel4.default.toXml("color", tag.color) : "", (0, _type.isDefined)(tag.name) ? _excel2.default.toXml("name", {
            val: tag.name
        }) : "", (0, _type.isDefined)(tag.family) ? _excel2.default.toXml("family", {
            val: tag.family
        }) : "", (0, _type.isDefined)(tag.scheme) ? _excel2.default.toXml("scheme", {
            val: tag.scheme
        }) : "", (0, _type.isDefined)(tag.italic) && tag.italic ? _excel2.default.toXml("i", {}) : "", (0, _type.isDefined)(tag.underline) ? _excel2.default.toXml("u", {
            val: tag.underline
        }) : ""].join("");
        return _excel2.default.toXml("font", {}, content)
    }
};
exports.default = fontHelper;
