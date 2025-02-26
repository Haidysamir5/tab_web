/**
 * DevExtreme (exporter/excel/excel.fill_helper.js)
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
var _excel3 = require("./excel.pattern_fill_helper");
var _excel4 = _interopRequireDefault(_excel3);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var fillHelper = {
    tryCreateTag: function(sourceObj) {
        var result = null;
        if ((0, _type.isDefined)(sourceObj)) {
            result = {
                patternFill: _excel4.default.tryCreateTag(sourceObj.patternFill)
            };
            if (fillHelper.isEmpty(result)) {
                result = null
            }
        }
        return result
    },
    tryCreateFillFromSimpleFormat: function() {
        var _ref = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            backgroundColor = _ref.backgroundColor,
            fillPatternType = _ref.fillPatternType,
            fillPatternColor = _ref.fillPatternColor;
        if ((0, _type.isDefined)(backgroundColor) && !((0, _type.isDefined)(fillPatternType) && (0, _type.isDefined)(fillPatternColor))) {
            return {
                patternFill: {
                    patternType: "solid",
                    foregroundColor: {
                        rgb: backgroundColor
                    }
                }
            }
        } else {
            if ((0, _type.isDefined)(fillPatternType) && (0, _type.isDefined)(fillPatternColor)) {
                return {
                    patternFill: {
                        patternType: fillPatternType,
                        foregroundColor: {
                            rgb: fillPatternColor
                        },
                        backgroundColor: {
                            rgb: backgroundColor
                        }
                    }
                }
            }
        }
    },
    copySimpleFormat: function(source, target) {
        if (void 0 !== source.backgroundColor) {
            target.backgroundColor = source.backgroundColor
        }
        if (void 0 !== source.fillPatternType) {
            target.fillPatternType = source.fillPatternType
        }
        if (void 0 !== source.fillPatternColor) {
            target.fillPatternColor = source.fillPatternColor
        }
    },
    copy: function(source) {
        var result = null;
        if ((0, _type.isDefined)(source)) {
            result = {};
            if (void 0 !== source.patternFill) {
                result.patternFill = _excel4.default.copy(source.patternFill)
            }
        }
        return result
    },
    areEqual: function(leftTag, rightTag) {
        return fillHelper.isEmpty(leftTag) && fillHelper.isEmpty(rightTag) || (0, _type.isDefined)(leftTag) && (0, _type.isDefined)(rightTag) && _excel4.default.areEqual(leftTag.patternFill, rightTag.patternFill)
    },
    isEmpty: function(tag) {
        return !(0, _type.isDefined)(tag) || _excel4.default.isEmpty(tag.patternFill)
    },
    toXml: function(tag) {
        return _excel2.default.toXml("fill", {}, _excel4.default.toXml(tag.patternFill))
    }
};
exports.default = fillHelper;
