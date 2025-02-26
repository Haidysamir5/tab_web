/**
 * DevExtreme (exporter/excel/excel.number_format_helper.js)
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

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var numberFormatHelper = {
    ID_PROPERTY_NAME: "id",
    tryCreateTag: function(sourceObj) {
        var result = null;
        if ("string" === typeof sourceObj) {
            result = {
                formatCode: sourceObj
            };
            if (numberFormatHelper.isEmpty(result)) {
                result = null
            }
        }
        return result
    },
    areEqual: function(leftTag, rightTag) {
        return numberFormatHelper.isEmpty(leftTag) && numberFormatHelper.isEmpty(rightTag) || (0, _type.isDefined)(leftTag) && (0, _type.isDefined)(rightTag) && leftTag.formatCode === rightTag.formatCode
    },
    isEmpty: function(tag) {
        return !(0, _type.isDefined)(tag) || !(0, _type.isDefined)(tag.formatCode) || "" === tag.formatCode
    },
    toXml: function(tag) {
        return _excel2.default.toXml("numFmt", {
            numFmtId: tag[numberFormatHelper.ID_PROPERTY_NAME],
            formatCode: tag.formatCode
        })
    }
};
exports.default = numberFormatHelper;
