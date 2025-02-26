/**
 * DevExtreme (exporter/excel/excel.pattern_fill_helper.js)
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
var patternFillHelper = {
    tryCreateTag: function(sourceObj) {
        var result = null;
        if ((0, _type.isDefined)(sourceObj)) {
            result = {
                patternType: sourceObj.patternType,
                backgroundColor: _excel4.default.tryCreateTag(sourceObj.backgroundColor),
                foregroundColor: _excel4.default.tryCreateTag(sourceObj.foregroundColor)
            };
            if (patternFillHelper.isEmpty(result)) {
                result = null
            }
        }
        return result
    },
    copy: function(source) {
        var result = null;
        if ((0, _type.isDefined)(source)) {
            result = {};
            if (void 0 !== source.patternType) {
                result.patternType = source.patternType
            }
            if (void 0 !== source.backgroundColor) {
                result.backgroundColor = _excel4.default.copy(source.backgroundColor)
            }
            if (void 0 !== source.foregroundColor) {
                result.foregroundColor = _excel4.default.copy(source.foregroundColor)
            }
        }
        return result
    },
    areEqual: function(leftTag, rightTag) {
        return patternFillHelper.isEmpty(leftTag) && patternFillHelper.isEmpty(rightTag) || (0, _type.isDefined)(leftTag) && (0, _type.isDefined)(rightTag) && leftTag.patternType === rightTag.patternType && _excel4.default.areEqual(leftTag.backgroundColor, rightTag.backgroundColor) && _excel4.default.areEqual(leftTag.foregroundColor, rightTag.foregroundColor)
    },
    isEmpty: function(tag) {
        return !(0, _type.isDefined)(tag) || !(0, _type.isDefined)(tag.patternType)
    },
    toXml: function(tag) {
        var content = [(0, _type.isDefined)(tag.foregroundColor) ? _excel4.default.toXml("fgColor", tag.foregroundColor) : "", (0, _type.isDefined)(tag.backgroundColor) ? _excel4.default.toXml("bgColor", tag.backgroundColor) : ""].join("");
        return _excel2.default.toXml("patternFill", {
            patternType: tag.patternType
        }, content)
    }
};
exports.default = patternFillHelper;
