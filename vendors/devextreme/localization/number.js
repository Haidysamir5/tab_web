/**
 * DevExtreme (localization/number.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _slicedToArray = function() {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = void 0;
        try {
            for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) {
                    break
                }
            }
        } catch (err) {
            _d = true;
            _e = err
        } finally {
            try {
                if (!_n && _i.return) {
                    _i.return()
                }
            } finally {
                if (_d) {
                    throw _e
                }
            }
        }
        return _arr
    }
    return function(arr, i) {
        if (Array.isArray(arr)) {
            return arr
        } else {
            if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i)
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            }
        }
    }
}();
var dependencyInjector = require("../core/utils/dependency_injector"),
    inArray = require("../core/utils/array").inArray,
    escapeRegExp = require("../core/utils/common").escapeRegExp,
    each = require("../core/utils/iterator").each,
    isPlainObject = require("../core/utils/type").isPlainObject,
    ldmlNumber = require("./ldml/number"),
    config = require("../core/config"),
    errors = require("../core/errors"),
    toFixed = require("./utils").toFixed;
var MAX_LARGE_NUMBER_POWER = 4,
    DECIMAL_BASE = 10;
var NUMERIC_FORMATS = ["currency", "fixedpoint", "exponential", "percent", "decimal"];
var LargeNumberFormatPostfixes = {
    1: "K",
    2: "M",
    3: "B",
    4: "T"
};
var LargeNumberFormatPowers = {
    largenumber: "auto",
    thousands: 1,
    millions: 2,
    billions: 3,
    trillions: 4
};
var numberLocalization = dependencyInjector({
    numericFormats: NUMERIC_FORMATS,
    defaultLargeNumberFormatPostfixes: LargeNumberFormatPostfixes,
    _parseNumberFormatString: function(formatType) {
        var formatList, formatObject = {};
        if (!formatType || "string" !== typeof formatType) {
            return
        }
        formatList = formatType.toLowerCase().split(" ");
        each(formatList, function(index, value) {
            if (inArray(value, NUMERIC_FORMATS) > -1) {
                formatObject.formatType = value
            } else {
                if (value in LargeNumberFormatPowers) {
                    formatObject.power = LargeNumberFormatPowers[value]
                }
            }
        });
        if (formatObject.power && !formatObject.formatType) {
            formatObject.formatType = "fixedpoint"
        }
        if (formatObject.formatType) {
            return formatObject
        }
    },
    _calculateNumberPower: function(value, base, minPower, maxPower) {
        var number = Math.abs(value),
            power = 0;
        if (number > 1) {
            while (number && number >= base && (void 0 === maxPower || power < maxPower)) {
                power++;
                number /= base
            }
        } else {
            if (number > 0 && number < 1) {
                while (number < 1 && (void 0 === minPower || power > minPower)) {
                    power--;
                    number *= base
                }
            }
        }
        return power
    },
    _getNumberByPower: function(number, power, base) {
        var result = number;
        while (power > 0) {
            result /= base;
            power--
        }
        while (power < 0) {
            result *= base;
            power++
        }
        return result
    },
    _formatNumber: function(value, formatObject, formatConfig) {
        var powerPostfix;
        var result;
        if ("auto" === formatObject.power) {
            formatObject.power = this._calculateNumberPower(value, 1e3, 0, MAX_LARGE_NUMBER_POWER)
        }
        if (formatObject.power) {
            value = this._getNumberByPower(value, formatObject.power, 1e3)
        }
        powerPostfix = this.defaultLargeNumberFormatPostfixes[formatObject.power] || "";
        result = this._formatNumberCore(value, formatObject.formatType, formatConfig);
        result = result.replace(/(\d|.$)(\D*)$/, "$1" + powerPostfix + "$2");
        return result
    },
    _formatNumberExponential: function(value, formatConfig) {
        var powString, power = this._calculateNumberPower(value, DECIMAL_BASE),
            number = this._getNumberByPower(value, power, DECIMAL_BASE);
        if (void 0 === formatConfig.precision) {
            formatConfig.precision = 1
        }
        if (number.toFixed(formatConfig.precision || 0) >= DECIMAL_BASE) {
            power++;
            number /= DECIMAL_BASE
        }
        powString = (power >= 0 ? "+" : "") + power.toString();
        return this._formatNumberCore(number, "fixedpoint", formatConfig) + "E" + powString
    },
    _addZeroes: function(value, precision) {
        var multiplier = Math.pow(10, precision);
        var sign = value < 0 ? "-" : "";
        value = (Math.abs(value) * multiplier >>> 0) / multiplier;
        var result = value.toString();
        while (result.length < precision) {
            result = "0" + result
        }
        return sign + result
    },
    _addGroupSeparators: function(value) {
        var parts = value.toString().split(".");
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config().thousandsSeparator) + (parts[1] ? config().decimalSeparator + parts[1] : "")
    },
    _formatNumberCore: function(value, format, formatConfig) {
        if ("exponential" === format) {
            return this._formatNumberExponential(value, formatConfig)
        }
        if ("decimal" !== format && null !== formatConfig.precision) {
            formatConfig.precision = formatConfig.precision || 0
        }
        if ("percent" === format) {
            value = 100 * value
        }
        if (void 0 !== formatConfig.precision) {
            if ("decimal" === format) {
                value = this._addZeroes(value, formatConfig.precision)
            } else {
                value = null === formatConfig.precision ? value.toPrecision() : toFixed(value, formatConfig.precision)
            }
        }
        if ("decimal" !== format) {
            value = this._addGroupSeparators(value)
        } else {
            value = value.toString().replace(".", config().decimalSeparator)
        }
        if ("percent" === format) {
            value += "%"
        }
        return value
    },
    _normalizeFormat: function(format) {
        if (!format) {
            return {}
        }
        if ("function" === typeof format) {
            return format
        }
        if (!isPlainObject(format)) {
            format = {
                type: format
            }
        }
        return format
    },
    _getSeparators: function() {
        return {
            decimalSeparator: this.getDecimalSeparator(),
            thousandsSeparator: this.getThousandsSeparator()
        }
    },
    getThousandsSeparator: function() {
        return this.format(1e3, "fixedPoint")[1]
    },
    getDecimalSeparator: function() {
        return this.format(1.2, {
            type: "fixedPoint",
            precision: 1
        })[1]
    },
    convertDigits: function(value, toStandard) {
        var digits = this.format(90, "decimal");
        if ("string" !== typeof value || "0" === digits[1]) {
            return value
        }
        var fromFirstDigit = toStandard ? digits[1] : "0",
            toFirstDigit = toStandard ? "0" : digits[1],
            fromLastDigit = toStandard ? digits[0] : "9",
            regExp = new RegExp("[" + fromFirstDigit + "-" + fromLastDigit + "]", "g");
        return value.replace(regExp, function(char) {
            return String.fromCharCode(char.charCodeAt(0) + (toFirstDigit.charCodeAt(0) - fromFirstDigit.charCodeAt(0)))
        })
    },
    getSign: function(text, format) {
        if ("-" === text.replace(/[^0-9-]/g, "").charAt(0)) {
            return -1
        }
        if (!format) {
            return 1
        }
        var separators = this._getSeparators(),
            regExp = new RegExp("[0-9" + escapeRegExp(separators.decimalSeparator + separators.thousandsSeparator) + "]+", "g"),
            negativeEtalon = this.format(-1, format).replace(regExp, "1"),
            cleanedText = text.replace(regExp, "1");
        return cleanedText === negativeEtalon ? -1 : 1
    },
    format: function(value, _format) {
        if ("number" !== typeof value) {
            return value
        }
        if ("number" === typeof _format) {
            return value
        }
        _format = _format && _format.formatter || _format;
        if ("function" === typeof _format) {
            return _format(value)
        }
        _format = this._normalizeFormat(_format);
        if (!_format.type) {
            _format.type = "decimal"
        }
        var numberConfig = this._parseNumberFormatString(_format.type);
        if (!numberConfig) {
            return this.convertDigits(ldmlNumber.getFormatter(_format.type, this._getSeparators())(value))
        }
        return this._formatNumber(value, numberConfig, _format)
    },
    parse: function(text, format) {
        if (!text) {
            return
        }
        if (format && format.parser) {
            return format.parser(text)
        }
        text = this.convertDigits(text, true);
        if (format && "string" !== typeof format) {
            errors.log("W0011")
        }
        var decimalSeparator = this.getDecimalSeparator(),
            regExp = new RegExp("[^0-9" + escapeRegExp(decimalSeparator) + "]", "g"),
            cleanedText = text.replace(regExp, "").replace(decimalSeparator, ".").replace(/\.$/g, "");
        if ("." === cleanedText || "" === cleanedText) {
            return null
        }
        if (this._calcSignificantDigits(cleanedText) > 15) {
            return NaN
        }
        var parsed = +cleanedText;
        return parsed * this.getSign(text, format)
    },
    _calcSignificantDigits: function(text) {
        var _text$split = text.split("."),
            _text$split2 = _slicedToArray(_text$split, 2),
            integer = _text$split2[0],
            fractional = _text$split2[1];
        var calcDigitsAfterLeadingZeros = function(digits) {
            var index = -1;
            for (var i = 0; i < digits.length; i++) {
                if ("0" !== digits[i]) {
                    index = i;
                    break
                }
            }
            return index > -1 ? digits.length - index : 0
        };
        var result = 0;
        if (integer) {
            result += calcDigitsAfterLeadingZeros(integer.split(""))
        }
        if (fractional) {
            result += calcDigitsAfterLeadingZeros(fractional.split("").reverse())
        }
        return result
    }
});
module.exports = numberLocalization;
