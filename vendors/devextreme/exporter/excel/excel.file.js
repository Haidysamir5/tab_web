/**
 * DevExtreme (exporter/excel/excel.file.js)
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
var _type = require("../../core/utils/type");
var _excel = require("./excel.tag_helper");
var _excel2 = _interopRequireDefault(_excel);
var _excel3 = require("./excel.cell_format_helper");
var _excel4 = _interopRequireDefault(_excel3);
var _excel5 = require("./excel.fill_helper");
var _excel6 = _interopRequireDefault(_excel5);
var _excel7 = require("./excel.font_helper");
var _excel8 = _interopRequireDefault(_excel7);
var _excel9 = require("./excel.number_format_helper");
var _excel10 = _interopRequireDefault(_excel9);

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
var ExcelFile = function() {
    function ExcelFile() {
        _classCallCheck(this, ExcelFile);
        this._cellFormatTags = [];
        this._fillTags = [];
        this._fontTags = [];
        this._numberFormatTags = [];
        this._fillTags.push(_excel6.default.tryCreateTag({
            patternFill: {
                patternType: "none"
            }
        }))
    }
    _createClass(ExcelFile, [{
        key: "registerCellFormat",
        value: function(cellFormat) {
            var result = void 0;
            var cellFormatTag = _excel4.default.tryCreateTag(cellFormat, {
                registerFill: this.registerFill.bind(this),
                registerFont: this.registerFont.bind(this),
                registerNumberFormat: this.registerNumberFormat.bind(this)
            });
            if ((0, _type.isDefined)(cellFormatTag)) {
                for (var i = 0; i < this._cellFormatTags.length; i++) {
                    if (_excel4.default.areEqual(this._cellFormatTags[i], cellFormatTag)) {
                        result = i;
                        break
                    }
                }
                if (void 0 === result) {
                    result = this._cellFormatTags.push(cellFormatTag) - 1
                }
            }
            return result
        }
    }, {
        key: "generateCellFormatsXml",
        value: function() {
            var cellFormatTagsAsXmlStringsArray = this._cellFormatTags.map(function(tag) {
                return _excel4.default.toXml(tag)
            });
            return _excel2.default.toXml("cellXfs", {
                count: cellFormatTagsAsXmlStringsArray.length
            }, cellFormatTagsAsXmlStringsArray.join(""))
        }
    }, {
        key: "registerFill",
        value: function(fill) {
            var result = void 0;
            var fillTag = _excel6.default.tryCreateTag(fill);
            if ((0, _type.isDefined)(fillTag)) {
                for (var i = 0; i < this._fillTags.length; i++) {
                    if (_excel6.default.areEqual(this._fillTags[i], fillTag)) {
                        result = i;
                        break
                    }
                }
                if (void 0 === result) {
                    if (this._fillTags.length < 2) {
                        this._fillTags.push(_excel6.default.tryCreateTag({
                            patternFill: {
                                patternType: "Gray125"
                            }
                        }))
                    }
                    result = this._fillTags.push(fillTag) - 1
                }
            }
            return result
        }
    }, {
        key: "generateFillsXml",
        value: function() {
            var tagsAsXmlStringsArray = this._fillTags.map(function(tag) {
                return _excel6.default.toXml(tag)
            });
            return _excel2.default.toXml("fills", {
                count: tagsAsXmlStringsArray.length
            }, tagsAsXmlStringsArray.join(""))
        }
    }, {
        key: "registerFont",
        value: function(font) {
            var result = void 0;
            var fontTag = _excel8.default.tryCreateTag(font);
            if ((0, _type.isDefined)(fontTag)) {
                for (var i = 0; i < this._fontTags.length; i++) {
                    if (_excel8.default.areEqual(this._fontTags[i], fontTag)) {
                        result = i;
                        break
                    }
                }
                if (void 0 === result) {
                    result = this._fontTags.push(fontTag) - 1
                }
            }
            return result
        }
    }, {
        key: "generateFontsXml",
        value: function() {
            var xmlStringsArray = this._fontTags.map(function(tag) {
                return _excel8.default.toXml(tag)
            });
            return _excel2.default.toXml("fonts", {
                count: xmlStringsArray.length
            }, xmlStringsArray.join(""))
        }
    }, {
        key: "_convertNumberFormatIndexToId",
        value: function(index) {
            var CUSTOM_FORMAT_ID_START_VALUE = 165;
            return CUSTOM_FORMAT_ID_START_VALUE + index
        }
    }, {
        key: "registerNumberFormat",
        value: function(numberFormat) {
            var result = void 0;
            var tag = _excel10.default.tryCreateTag(numberFormat);
            if ((0, _type.isDefined)(tag)) {
                for (var i = 0; i < this._numberFormatTags.length; i++) {
                    if (_excel10.default.areEqual(this._numberFormatTags[i], tag)) {
                        result = this._numberFormatTags[i][_excel10.default.ID_PROPERTY_NAME];
                        break
                    }
                }
                if (void 0 === result) {
                    tag[_excel10.default.ID_PROPERTY_NAME] = this._convertNumberFormatIndexToId(this._numberFormatTags.length);
                    result = tag[_excel10.default.ID_PROPERTY_NAME];
                    this._numberFormatTags.push(tag)
                }
            }
            return result
        }
    }, {
        key: "generateNumberFormatsXml",
        value: function() {
            if (this._numberFormatTags.length > 0) {
                var xmlStringsArray = this._numberFormatTags.map(function(tag) {
                    return _excel10.default.toXml(tag)
                });
                return _excel2.default.toXml("numFmts", {
                    count: xmlStringsArray.length
                }, xmlStringsArray.join(""))
            } else {
                return ""
            }
        }
    }], [{
        key: "copyCellFormat",
        value: function(source) {
            return _excel4.default.copy(source)
        }
    }]);
    return ExcelFile
}();
exports.default = ExcelFile;
module.exports = ExcelFile;
