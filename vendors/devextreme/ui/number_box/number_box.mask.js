/**
 * DevExtreme (ui/number_box/number_box.mask.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var eventsEngine = require("../../events/core/events_engine"),
    extend = require("../../core/utils/extend").extend,
    isNumeric = require("../../core/utils/type").isNumeric,
    browser = require("../../core/utils/browser"),
    devices = require("../../core/devices"),
    fitIntoRange = require("../../core/utils/math").fitIntoRange,
    inRange = require("../../core/utils/math").inRange,
    escapeRegExp = require("../../core/utils/common").escapeRegExp,
    number = require("../../localization/number"),
    maskCaret = require("./number_box.caret"),
    getLDMLFormat = require("../../localization/ldml/number").getFormat,
    NumberBoxBase = require("./number_box.base"),
    eventUtils = require("../../events/utils"),
    typeUtils = require("../../core/utils/type");
var NUMBER_FORMATTER_NAMESPACE = "dxNumberFormatter",
    MOVE_FORWARD = 1,
    MOVE_BACKWARD = -1,
    MINUS = "-",
    MINUS_KEY = "minus",
    NUMPUD_MINUS_KEY_IE = "Subtract",
    INPUT_EVENT = "input";
var CARET_TIMEOUT_DURATION = browser.msie ? 300 : 0;
var ensureDefined = function(value, defaultValue) {
    return void 0 === value ? defaultValue : value
};
var NumberBoxMask = NumberBoxBase.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            useMaskBehavior: true,
            format: null
        })
    },
    _isDeleteKey: function(key) {
        return "del" === key
    },
    _supportedKeys: function() {
        if (!this._useMaskBehavior()) {
            return this.callBase()
        }
        var that = this;
        return extend(this.callBase(), {
            minus: that._revertSign.bind(that),
            del: that._removeHandler.bind(that),
            backspace: that._removeHandler.bind(that),
            leftArrow: that._arrowHandler.bind(that, MOVE_BACKWARD),
            rightArrow: that._arrowHandler.bind(that, MOVE_FORWARD),
            home: that._moveCaretToBoundaryEventHandler.bind(that, MOVE_FORWARD),
            enter: that._updateFormattedValue.bind(that),
            end: that._moveCaretToBoundaryEventHandler.bind(that, MOVE_BACKWARD)
        })
    },
    _focusInHandler: function(e) {
        this.callBase(e);
        this.clearCaretTimeout();
        this._caretTimeout = setTimeout(function() {
            this._caretTimeout = null;
            var caret = this._caret();
            if (caret.start === caret.end && this._useMaskBehavior()) {
                var text = this._getInputVal(),
                    decimalSeparator = number.getDecimalSeparator(),
                    decimalSeparatorIndex = text.indexOf(decimalSeparator);
                if (decimalSeparatorIndex >= 0) {
                    this._caret({
                        start: decimalSeparatorIndex,
                        end: decimalSeparatorIndex
                    })
                } else {
                    this._moveCaretToBoundaryEventHandler(MOVE_BACKWARD, e)
                }
            }
        }.bind(this), CARET_TIMEOUT_DURATION)
    },
    _focusOutHandler: function(e) {
        this._focusOutOccurs = true;
        if (this._useMaskBehavior()) {
            this._updateFormattedValue()
        }
        this.callBase(e);
        this._focusOutOccurs = false
    },
    _hasValueBeenChanged: function(inputValue) {
        var format = this._getFormatPattern(),
            value = this.option("value"),
            formatted = this._format(value, format) || "";
        return formatted !== inputValue
    },
    _updateFormattedValue: function() {
        var inputValue = this._getInputVal();
        if (this._hasValueBeenChanged(inputValue)) {
            this._parsedValue = this._tryParse(inputValue, this._caret());
            this._adjustParsedValue();
            this._setTextByParsedValue();
            if (this._parsedValue !== this.option("value")) {
                eventsEngine.trigger(this._input(), "change")
            }
        }
    },
    _arrowHandler: function(step, e) {
        if (!this._useMaskBehavior()) {
            return
        }
        var text = this._getInputVal(),
            format = this._getFormatPattern(),
            nextCaret = maskCaret.getCaretWithOffset(this._caret(), step);
        if (!maskCaret.isCaretInBoundaries(nextCaret, text, format)) {
            nextCaret = step === MOVE_FORWARD ? nextCaret.end : nextCaret.start;
            e.preventDefault();
            this._caret(maskCaret.getCaretInBoundaries(nextCaret, text, format))
        }
    },
    _moveCaretToBoundary: function(direction) {
        var boundaries = maskCaret.getCaretBoundaries(this._getInputVal(), this._getFormatPattern()),
            newCaret = maskCaret.getCaretWithOffset(direction === MOVE_FORWARD ? boundaries.start : boundaries.end, 0);
        this._caret(newCaret)
    },
    _moveCaretToBoundaryEventHandler: function(direction, e) {
        if (!this._useMaskBehavior() || e && e.shiftKey) {
            return
        }
        this._moveCaretToBoundary(direction);
        e && e.preventDefault()
    },
    _shouldMoveCaret: function(text, caret) {
        var decimalSeparator = number.getDecimalSeparator(),
            isDecimalSeparatorNext = text.charAt(caret.end) === decimalSeparator,
            isZeroNext = "0" === text.charAt(caret.end),
            moveToFloat = (this._lastKey === decimalSeparator || "." === this._lastKey) && isDecimalSeparatorNext,
            zeroToZeroReplace = "0" === this._lastKey && isZeroNext;
        return moveToFloat || zeroToZeroReplace
    },
    _getInputVal: function() {
        return number.convertDigits(this._input().val(), true)
    },
    _keyboardHandler: function(e) {
        this.clearCaretTimeout();
        this._lastKey = number.convertDigits(eventUtils.getChar(e), true);
        this._lastKeyName = eventUtils.normalizeKeyName(e);
        if (!this._shouldHandleKey(e.originalEvent)) {
            return this.callBase(e)
        }
        var normalizedText = this._getInputVal(),
            caret = this._caret();
        var enteredChar = this._lastKeyName === MINUS_KEY ? "" : this._lastKey,
            newValue = this._tryParse(normalizedText, caret, enteredChar);
        if (void 0 === newValue) {
            if (this._lastKeyName !== MINUS_KEY) {
                e.originalEvent.preventDefault()
            }
            if (this._shouldMoveCaret(normalizedText, caret)) {
                this._moveCaret(1)
            }
        } else {
            this._parsedValue = newValue
        }
        return this.callBase(e)
    },
    _keyPressHandler: function(e) {
        if (!this._useMaskBehavior()) {
            this.callBase(e)
        }
    },
    _removeHandler: function(e) {
        var caret = this._caret(),
            text = this._getInputVal(),
            start = caret.start,
            end = caret.end;
        this._lastKey = eventUtils.getChar(e);
        this._lastKeyName = eventUtils.normalizeKeyName(e);
        var isDeleteKey = this._isDeleteKey(this._lastKeyName);
        var isBackspaceKey = !isDeleteKey;
        if (start === end) {
            var caretPosition = start;
            var canDelete = isBackspaceKey && caretPosition > 0 || isDeleteKey && caretPosition < text.length;
            if (canDelete) {
                isDeleteKey && end++;
                isBackspaceKey && start--
            } else {
                e.preventDefault();
                return
            }
        }
        var char = text.slice(start, end);
        if (this._isStub(char)) {
            this._moveCaret(isDeleteKey ? 1 : -1);
            if (this._parsedValue < 0 || 1 / this._parsedValue === -(1 / 0)) {
                this._revertSign(e);
                this._setTextByParsedValue()
            }
            e.preventDefault();
            return
        }
        var decimalSeparator = number.getDecimalSeparator();
        if (char === decimalSeparator) {
            var decimalSeparatorIndex = text.indexOf(decimalSeparator);
            if (this._isNonStubAfter(decimalSeparatorIndex + 1)) {
                this._moveCaret(isDeleteKey ? 1 : -1);
                e.preventDefault()
            }
            return
        }
        if (end - start < text.length) {
            var editedText = this._replaceSelectedText(text, {
                    start: start,
                    end: end
                }, ""),
                noDigits = editedText.search(/[0-9]/) < 0;
            if (noDigits && this._isValueInRange(0)) {
                this._parsedValue = this._parsedValue < 0 || 1 / this._parsedValue === -(1 / 0) ? -0 : 0;
                return
            }
        }
        var valueAfterRemoving = this._tryParse(text, {
            start: start,
            end: end
        }, "");
        if (void 0 === valueAfterRemoving) {
            e.preventDefault()
        } else {
            this._parsedValue = valueAfterRemoving
        }
    },
    _isPercentFormat: function() {
        var format = this._getFormatPattern(),
            noEscapedFormat = format.replace(/'[^']+'/g, "");
        return noEscapedFormat.indexOf("%") !== -1
    },
    _parse: function(text, format) {
        var formatOption = this.option("format"),
            isCustomParser = typeUtils.isFunction(formatOption.parser),
            parser = isCustomParser ? formatOption.parser : number.parse;
        return parser(text, format)
    },
    _format: function(value, format) {
        var formatOption = this.option("format"),
            isCustomFormatter = typeUtils.isFunction(formatOption.formatter),
            formatter = isCustomFormatter ? formatOption.formatter : number.format;
        return formatter(value, format)
    },
    _getFormatPattern: function() {
        var format = this.option("format"),
            isLDMLPattern = "string" === typeof format && (format.indexOf("0") >= 0 || format.indexOf("#") >= 0);
        if (isLDMLPattern) {
            return format
        } else {
            return getLDMLFormat(function(value) {
                var text = this._format(value, format);
                return number.convertDigits(text, true)
            }.bind(this))
        }
    },
    _getFormatForSign: function(text) {
        var format = this._getFormatPattern(),
            signParts = format.split(";"),
            sign = number.getSign(text, format);
        signParts[1] = signParts[1] || "-" + signParts[0];
        return sign < 0 ? signParts[1] : signParts[0]
    },
    _removeStubs: function(text, excludeComma) {
        var format = this._getFormatForSign(text),
            thousandsSeparator = number.getThousandsSeparator(),
            stubs = format.replace(/[#0.,]/g, ""),
            regExp = new RegExp("[-" + escapeRegExp((excludeComma ? "" : thousandsSeparator) + stubs) + "]", "g");
        return text.replace(regExp, "")
    },
    _truncateToPrecision: function(value, maxPrecision) {
        if (typeUtils.isDefined(value)) {
            var strValue = value.toString(),
                decimalSeparatorIndex = strValue.indexOf(".");
            if (strValue && decimalSeparatorIndex > -1) {
                var parsedValue = parseFloat(strValue.substr(0, decimalSeparatorIndex + maxPrecision + 1));
                return isNaN(parsedValue) ? value : parsedValue
            }
        }
        return value
    },
    _tryParse: function(text, selection, char) {
        var editedText = this._replaceSelectedText(text, selection, char),
            format = this._getFormatPattern(),
            isTextSelected = selection.start !== selection.end,
            parsed = this._parse(editedText, format),
            maxPrecision = this._getPrecisionLimits(format, editedText).max,
            isValueChanged = parsed !== this._parsedValue,
            decimalSeparator = number.getDecimalSeparator();
        var isDecimalPointRestricted = char === decimalSeparator && 0 === maxPrecision,
            isUselessCharRestricted = !isTextSelected && !isValueChanged && char !== MINUS && !this._isValueIncomplete(editedText) && this._isStub(char);
        if (isDecimalPointRestricted || isUselessCharRestricted) {
            return
        }
        if ("" === this._removeStubs(editedText)) {
            parsed = 0 * this._parsedValue
        }
        if (isNaN(parsed)) {
            return
        }
        var value = null === parsed ? this._parsedValue : parsed;
        parsed = this._truncateToPrecision(value, maxPrecision);
        return this._isPercentFormat() ? parsed && parsed / 100 : parsed
    },
    _isValueIncomplete: function(text) {
        if (!this._useMaskBehavior()) {
            return this.callBase(text)
        }
        var caret = this._caret(),
            point = number.getDecimalSeparator(),
            pointIndex = text.indexOf(point),
            isCaretOnFloat = pointIndex >= 0 && pointIndex < caret.start,
            textParts = this._removeStubs(text, true).split(point);
        if (!isCaretOnFloat || 2 !== textParts.length) {
            return false
        }
        var floatLength = textParts[1].length,
            precision = this._getPrecisionLimits(this._getFormatPattern(), text),
            isPrecisionInRange = inRange(floatLength, precision.min, precision.max),
            endsWithZero = "0" === textParts[1].charAt(floatLength - 1);
        return isPrecisionInRange && (endsWithZero || !floatLength)
    },
    _isValueInRange: function(value) {
        var min = ensureDefined(this.option("min"), -(1 / 0)),
            max = ensureDefined(this.option("max"), 1 / 0);
        return inRange(value, min, max)
    },
    _setInputText: function(text) {
        var normalizedText = number.convertDigits(text, true),
            newCaret = maskCaret.getCaretAfterFormat(this._getInputVal(), normalizedText, this._caret(), this._getFormatPattern());
        this._input().val(text);
        this._toggleEmptinessEventHandler();
        this._formattedValue = text;
        if (!this._focusOutOccurs) {
            this._caret(newCaret)
        }
    },
    _useMaskBehavior: function() {
        return !!this.option("format") && this.option("useMaskBehavior")
    },
    _renderInputType: function() {
        var isNumberType = "number" === this.option("mode"),
            isDesktop = "desktop" === devices.real().deviceType;
        if (this._useMaskBehavior() && isNumberType) {
            this._setInputType(isDesktop || this._isSupportInputMode() ? "text" : "tel")
        } else {
            this.callBase()
        }
    },
    _isChar: function(str) {
        return "string" === typeof str && 1 === str.length
    },
    _moveCaret: function(offset) {
        if (!offset) {
            return
        }
        var newCaret = maskCaret.getCaretWithOffset(this._caret(), offset),
            adjustedCaret = maskCaret.getCaretInBoundaries(newCaret, this._getInputVal(), this._getFormatPattern());
        this._caret(adjustedCaret)
    },
    _shouldHandleKey: function(e) {
        var keyName = eventUtils.normalizeKeyName(e),
            isSpecialChar = e.ctrlKey || e.shiftKey || e.altKey || !this._isChar(keyName),
            isMinusKey = keyName === MINUS_KEY,
            useMaskBehavior = this._useMaskBehavior();
        return useMaskBehavior && !isSpecialChar && !isMinusKey
    },
    _renderInput: function() {
        this.callBase();
        this._renderFormatter()
    },
    _renderFormatter: function() {
        this._clearCache();
        this._detachFormatterEvents();
        if (this._useMaskBehavior()) {
            this._attachFormatterEvents()
        }
    },
    _detachFormatterEvents: function() {
        eventsEngine.off(this._input(), "." + NUMBER_FORMATTER_NAMESPACE)
    },
    _isInputFromPaste: function(e) {
        var inputType = e.originalEvent && e.originalEvent.inputType;
        if (typeUtils.isDefined(inputType)) {
            return "insertFromPaste" === inputType
        } else {
            return this._isValuePasted
        }
    },
    _attachFormatterEvents: function() {
        var $input = this._input();
        eventsEngine.on($input, eventUtils.addNamespace(INPUT_EVENT, NUMBER_FORMATTER_NAMESPACE), function(e) {
            this._formatValue(e);
            this._isValuePasted = false
        }.bind(this));
        if (browser.msie && browser.version < 12) {
            eventsEngine.on($input, eventUtils.addNamespace("paste", NUMBER_FORMATTER_NAMESPACE), function() {
                this._isValuePasted = true
            }.bind(this))
        }
        eventsEngine.on($input, eventUtils.addNamespace("dxclick", NUMBER_FORMATTER_NAMESPACE), function() {
            if (!this._caretTimeout) {
                this._caretTimeout = setTimeout(function() {
                    this._caret(maskCaret.getCaretInBoundaries(this._caret(), this._getInputVal(), this._getFormatPattern()))
                }.bind(this), CARET_TIMEOUT_DURATION)
            }
        }.bind(this));
        eventsEngine.on($input, "dxdblclick", function() {
            this.clearCaretTimeout()
        }.bind(this))
    },
    clearCaretTimeout: function() {
        clearTimeout(this._caretTimeout);
        this._caretTimeout = null
    },
    _forceRefreshInputValue: function() {
        if (!this._useMaskBehavior()) {
            return this.callBase()
        }
    },
    _isNonStubAfter: function(index, text) {
        text = (text || this._getInputVal()).slice(index);
        return text && !this._isStub(text, true)
    },
    _isStub: function(str, isString) {
        var escapedDecimalSeparator = escapeRegExp(number.getDecimalSeparator()),
            regExpString = "^[^0-9" + escapedDecimalSeparator + "]+$",
            stubRegExp = new RegExp(regExpString, "g");
        return stubRegExp.test(str) && (isString || this._isChar(str))
    },
    _parseValue: function(text) {
        if (!this._useMaskBehavior()) {
            return this.callBase(text)
        }
        return this._parsedValue
    },
    _getPrecisionLimits: function(text) {
        var currentFormat = this._getFormatForSign(text),
            floatPart = (currentFormat.split(".")[1] || "").replace(/[^#0]/g, ""),
            minPrecision = floatPart.replace(/^(0*)#*/, "$1").length,
            maxPrecision = floatPart.length;
        return {
            min: minPrecision,
            max: maxPrecision
        }
    },
    _revertSign: function(e) {
        if (!this._useMaskBehavior()) {
            return
        }
        var caret = this._caret();
        if (caret.start !== caret.end) {
            if (eventUtils.normalizeKeyName(e) === MINUS_KEY) {
                this._applyRevertedSign(e, caret, true);
                return
            } else {
                this._caret(maskCaret.getCaretInBoundaries(0, this._getInputVal(), this._getFormatPattern()))
            }
        }
        this._applyRevertedSign(e, caret)
    },
    _applyRevertedSign: function(e, caret, preserveSelectedText) {
        var newValue = -1 * ensureDefined(this._parsedValue, null);
        if (this._isValueInRange(newValue)) {
            this._parsedValue = newValue;
            if (preserveSelectedText) {
                var format = this._getFormatPattern(),
                    previousText = this._getInputVal();
                this._setTextByParsedValue();
                e.preventDefault();
                var currentText = this._getInputVal(),
                    offset = maskCaret.getCaretOffset(previousText, currentText, format);
                caret = maskCaret.getCaretWithOffset(caret, offset);
                var caretInBoundaries = maskCaret.getCaretInBoundaries(caret, currentText, format);
                if (browser.msie) {
                    clearTimeout(this._caretTimeout);
                    this._caretTimeout = setTimeout(this._caret.bind(this, caretInBoundaries))
                } else {
                    this._caret(caretInBoundaries)
                }
            }
            if (e.key === NUMPUD_MINUS_KEY_IE) {
                eventsEngine.trigger(this._input(), INPUT_EVENT)
            }
        }
    },
    _removeMinusFromText: function(text, caret) {
        var isMinusPressed = this._lastKeyName === MINUS_KEY && text.charAt(caret.start - 1) === MINUS;
        return isMinusPressed ? this._replaceSelectedText(text, {
            start: caret.start - 1,
            end: caret.start
        }, "") : text
    },
    _setTextByParsedValue: function() {
        var format = this._getFormatPattern(),
            parsed = this._parseValue(),
            formatted = this._format(parsed, format) || "";
        this._setInputText(formatted)
    },
    _formatValue: function(e) {
        var normalizedText = this._getInputVal(),
            caret = this._caret(),
            textWithoutMinus = this._removeMinusFromText(normalizedText, caret),
            wasMinusRemoved = textWithoutMinus !== normalizedText;
        normalizedText = textWithoutMinus;
        if (!this._isInputFromPaste(e) && this._isValueIncomplete(textWithoutMinus)) {
            this._formattedValue = normalizedText;
            if (wasMinusRemoved) {
                this._setTextByParsedValue()
            }
            return
        }
        var textWasChanged = number.convertDigits(this._formattedValue, true) !== normalizedText;
        if (textWasChanged) {
            var value = this._tryParse(normalizedText, caret, "");
            if (typeUtils.isDefined(value)) {
                this._parsedValue = value
            }
        }
        this._setTextByParsedValue()
    },
    _renderDisplayText: function() {
        if (this._useMaskBehavior()) {
            this._toggleEmptinessEventHandler()
        } else {
            this.callBase.apply(this, arguments)
        }
    },
    _renderValue: function() {
        if (this._useMaskBehavior()) {
            this._parsedValue = this.option("value");
            this._setTextByParsedValue()
        }
        return this.callBase()
    },
    _adjustParsedValue: function() {
        if (!this._useMaskBehavior()) {
            return
        }
        var clearedText = this._removeStubs(this._getInputVal()),
            parsedValue = clearedText ? this._parseValue() : null;
        if (!isNumeric(parsedValue)) {
            this._parsedValue = parsedValue;
            return
        }
        this._parsedValue = fitIntoRange(parsedValue, this.option("min"), this.option("max"))
    },
    _valueChangeEventHandler: function(e) {
        if (!this._useMaskBehavior()) {
            return this.callBase(e)
        }
        var caret = this._caret();
        this._saveValueChangeEvent(e);
        this._lastKey = null;
        this._lastKeyName = null;
        this._adjustParsedValue();
        this.option("value", this._parsedValue);
        if (caret) {
            this._caret(caret)
        }
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "format":
            case "useMaskBehavior":
                this._renderFormatter();
                this._renderValue();
                break;
            case "min":
            case "max":
                this._adjustParsedValue();
                this.callBase(args);
                break;
            default:
                this.callBase(args)
        }
    },
    _optionValuesEqual: function(name, oldValue, newValue) {
        if ("value" === name && 0 === oldValue && 0 === newValue) {
            return 1 / oldValue === 1 / newValue
        }
        return this.callBase.apply(this, arguments)
    },
    _clearCache: function() {
        delete this._formattedValue;
        delete this._lastKey;
        delete this._lastKeyName;
        delete this._parsedValue;
        delete this._focusOutOccurs;
        clearTimeout(this._caretTimeout);
        delete this._caretTimeout
    },
    _clean: function() {
        this._clearCache();
        this.callBase()
    }
});
module.exports = NumberBoxMask;
