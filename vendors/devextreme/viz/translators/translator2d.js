/**
 * DevExtreme (viz/translators/translator2d.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var extend = require("../../core/utils/extend").extend,
    each = require("../../core/utils/iterator").each,
    Range = require("./range").Range,
    categoryTranslator = require("./category_translator"),
    intervalTranslator = require("./interval_translator"),
    datetimeTranslator = require("./datetime_translator"),
    logarithmicTranslator = require("./logarithmic_translator"),
    vizUtils = require("../core/utils"),
    typeUtils = require("../../core/utils/type"),
    getLog = vizUtils.getLog,
    getPower = vizUtils.getPower,
    isDefined = typeUtils.isDefined,
    adjust = require("../../core/utils/math").adjust,
    _abs = Math.abs,
    CANVAS_PROP = ["width", "height", "left", "top", "bottom", "right"],
    _Translator2d, addInterval = require("../../core/utils/date").addInterval;
var dummyTranslator = {
    to: function(value) {
        var coord = this._canvasOptions.startPoint + (this._options.conversionValue ? value : Math.round(value));
        return coord > this._canvasOptions.endPoint ? this._canvasOptions.endPoint : coord
    },
    from: function(value) {
        return value - this._canvasOptions.startPoint
    }
};
var validateCanvas = function(canvas) {
    each(CANVAS_PROP, function(_, prop) {
        canvas[prop] = parseInt(canvas[prop]) || 0
    });
    return canvas
};
var makeCategoriesToPoints = function(categories) {
    var categoriesToPoints = {};
    categories.forEach(function(item, i) {
        categoriesToPoints[item.valueOf()] = i
    });
    return categoriesToPoints
};
var validateBusinessRange = function(businessRange) {
    if (!(businessRange instanceof Range)) {
        businessRange = new Range(businessRange)
    }

    function validate(valueSelector, baseValueSelector) {
        if (!isDefined(businessRange[valueSelector]) && isDefined(businessRange[baseValueSelector])) {
            businessRange[valueSelector] = businessRange[baseValueSelector]
        }
    }
    validate("minVisible", "min");
    validate("maxVisible", "max");
    return businessRange
};

function prepareBreaks(breaks, range) {
    var br, transformFrom, transformTo, i, transform = "logarithmic" === range.axisType ? function(value) {
            return getLog(value, range.base)
        } : function(value) {
            return value
        },
        array = [],
        length = breaks.length,
        sum = 0;
    for (i = 0; i < length; i++) {
        br = breaks[i];
        transformFrom = transform(br.from);
        transformTo = transform(br.to);
        sum += transformTo - transformFrom;
        array.push({
            trFrom: transformFrom,
            trTo: transformTo,
            from: br.from,
            to: br.to,
            length: sum,
            cumulativeWidth: br.cumulativeWidth
        })
    }
    return array
}

function getCanvasBounds(range) {
    var min = range.min;
    var max = range.max;
    var minVisible = range.minVisible;
    var maxVisible = range.maxVisible;
    var isLogarithmic = "logarithmic" === range.axisType;
    if (isLogarithmic) {
        maxVisible = getLog(maxVisible, range.base);
        minVisible = getLog(minVisible, range.base);
        min = getLog(min, range.base);
        max = getLog(max, range.base)
    }
    return {
        base: range.base,
        rangeMin: min,
        rangeMax: max,
        rangeMinVisible: minVisible,
        rangeMaxVisible: maxVisible
    }
}

function getCheckingMethodsAboutBreaks(inverted) {
    return {
        isStartSide: !inverted ? function(pos, breaks, start, end) {
            return pos < breaks[0][start]
        } : function(pos, breaks, start, end) {
            return pos <= breaks[breaks.length - 1][end]
        },
        isEndSide: !inverted ? function(pos, breaks, start, end) {
            return pos >= breaks[breaks.length - 1][end]
        } : function(pos, breaks, start, end) {
            return pos > breaks[0][start]
        },
        isInBreak: !inverted ? function(pos, br, start, end) {
            return pos >= br[start] && pos < br[end]
        } : function(pos, br, start, end) {
            return pos > br[end] && pos <= br[start]
        },
        isBetweenBreaks: !inverted ? function(pos, br, prevBreak, start, end) {
            return pos < br[start] && pos >= prevBreak[end]
        } : function(pos, br, prevBreak, start, end) {
            return pos >= br[end] && pos < prevBreak[start]
        },
        getLength: !inverted ? function(br) {
            return br.length
        } : function(br, lastBreak) {
            return lastBreak.length - br.length
        },
        getBreaksSize: !inverted ? function(br) {
            return br.cumulativeWidth
        } : function(br, lastBreak) {
            return lastBreak.cumulativeWidth - br.cumulativeWidth
        }
    }
}
exports.Translator2D = _Translator2d = function(businessRange, canvas, options) {
    this.update(businessRange, canvas, options)
};
_Translator2d.prototype = {
    constructor: _Translator2d,
    reinit: function() {
        var that = this,
            options = that._options,
            range = that._businessRange,
            categories = range.categories || [],
            script = {},
            canvasOptions = that._prepareCanvasOptions(),
            visibleCategories = vizUtils.getCategoriesInfo(categories, range.minVisible, range.maxVisible).categories,
            categoriesLength = visibleCategories.length;
        if (range.isEmpty()) {
            script = dummyTranslator
        } else {
            switch (range.axisType) {
                case "logarithmic":
                    script = logarithmicTranslator;
                    break;
                case "semidiscrete":
                    script = intervalTranslator;
                    canvasOptions.ratioOfCanvasRange = canvasOptions.canvasLength / (addInterval(canvasOptions.rangeMaxVisible, options.interval) - canvasOptions.rangeMinVisible);
                    break;
                case "discrete":
                    script = categoryTranslator;
                    that._categories = categories;
                    canvasOptions.interval = that._getDiscreteInterval(options.addSpiderCategory ? categoriesLength + 1 : categoriesLength, canvasOptions);
                    that._categoriesToPoints = makeCategoriesToPoints(categories, canvasOptions.invert);
                    if (categoriesLength) {
                        canvasOptions.startPointIndex = that._categoriesToPoints[visibleCategories[0].valueOf()];
                        that.visibleCategories = visibleCategories
                    }
                    break;
                default:
                    if ("datetime" === range.dataType) {
                        script = datetimeTranslator
                    }
            }
        }(that._oldMethods || []).forEach(function(methodName) {
            delete that[methodName]
        });
        that._oldMethods = Object.keys(script);
        extend(that, script);
        that._conversionValue = options.conversionValue ? function(value) {
            return value
        } : function(value) {
            return Math.round(value)
        };
        that.sc = {};
        that._checkingMethodsAboutBreaks = [getCheckingMethodsAboutBreaks(false), getCheckingMethodsAboutBreaks(that.isInverted())];
        that._translateBreaks();
        that._calculateSpecialValues()
    },
    _translateBreaks: function() {
        var i, b, end, length, breaks = this._breaks,
            size = this._options.breaksSize;
        if (void 0 === breaks) {
            return
        }
        for (i = 0, length = breaks.length; i < length; i++) {
            b = breaks[i];
            end = this.translate(b.to);
            b.end = end;
            b.start = !b.gapSize ? !this.isInverted() ? end - size : end + size : end
        }
    },
    _checkValueAboutBreaks: function(breaks, pos, start, end, methods) {
        var i, length, br, prevBreak, prop = {
                length: 0,
                breaksSize: void 0,
                inBreak: false
            },
            lastBreak = breaks[breaks.length - 1];
        if (methods.isStartSide(pos, breaks, start, end)) {
            return prop
        } else {
            if (methods.isEndSide(pos, breaks, start, end)) {
                return {
                    length: lastBreak.length,
                    breaksSize: lastBreak.cumulativeWidth,
                    inBreak: false
                }
            }
        }
        for (i = 0, length = breaks.length; i < length; i++) {
            br = breaks[i];
            prevBreak = breaks[i - 1];
            if (methods.isInBreak(pos, br, start, end)) {
                prop.inBreak = true;
                prop.break = br;
                break
            }
            if (prevBreak && methods.isBetweenBreaks(pos, br, prevBreak, start, end)) {
                prop = {
                    length: methods.getLength(prevBreak, lastBreak),
                    breaksSize: methods.getBreaksSize(prevBreak, lastBreak),
                    inBreak: false
                };
                break
            }
        }
        return prop
    },
    isInverted: function() {
        return !(this._options.isHorizontal ^ this._businessRange.invert)
    },
    _getDiscreteInterval: function(categoriesLength, canvasOptions) {
        var correctedCategoriesCount = categoriesLength - (this._options.stick ? 1 : 0);
        return correctedCategoriesCount > 0 ? canvasOptions.canvasLength / correctedCategoriesCount : canvasOptions.canvasLength
    },
    _prepareCanvasOptions: function() {
        var that = this;
        var businessRange = that._businessRange;
        var canvasOptions = that._canvasOptions = getCanvasBounds(businessRange);
        var canvas = that._canvas;
        var breaks = that._breaks;
        var length = void 0;
        canvasOptions.startPadding = canvas.startPadding || 0;
        canvasOptions.endPadding = canvas.endPadding || 0;
        if (that._options.isHorizontal) {
            canvasOptions.startPoint = canvas.left + canvasOptions.startPadding;
            length = canvas.width;
            canvasOptions.endPoint = canvas.width - canvas.right - canvasOptions.endPadding;
            canvasOptions.invert = businessRange.invert
        } else {
            canvasOptions.startPoint = canvas.top + canvasOptions.startPadding;
            length = canvas.height;
            canvasOptions.endPoint = canvas.height - canvas.bottom - canvasOptions.endPadding;
            canvasOptions.invert = !businessRange.invert
        }
        that.canvasLength = canvasOptions.canvasLength = canvasOptions.endPoint - canvasOptions.startPoint;
        canvasOptions.rangeDoubleError = Math.pow(10, getPower(canvasOptions.rangeMax - canvasOptions.rangeMin) - getPower(length) - 2);
        canvasOptions.ratioOfCanvasRange = canvasOptions.canvasLength / (canvasOptions.rangeMaxVisible - canvasOptions.rangeMinVisible);
        if (void 0 !== breaks) {
            canvasOptions.ratioOfCanvasRange = (canvasOptions.canvasLength - breaks[breaks.length - 1].cumulativeWidth) / (canvasOptions.rangeMaxVisible - canvasOptions.rangeMinVisible - breaks[breaks.length - 1].length)
        }
        return canvasOptions
    },
    updateCanvas: function(canvas) {
        this._canvas = validateCanvas(canvas);
        this.reinit()
    },
    updateBusinessRange: function(businessRange) {
        var that = this,
            breaks = businessRange.breaks || [];
        that._businessRange = validateBusinessRange(businessRange);
        that._breaks = breaks.length ? prepareBreaks(breaks, that._businessRange) : void 0;
        that.reinit()
    },
    update: function(businessRange, canvas, options) {
        var that = this;
        that._options = extend(that._options || {}, options);
        that._canvas = validateCanvas(canvas);
        that.updateBusinessRange(businessRange)
    },
    getBusinessRange: function() {
        return this._businessRange
    },
    getEventScale: function(zoomEvent) {
        return zoomEvent.deltaScale || 1
    },
    getCanvasVisibleArea: function() {
        return {
            min: this._canvasOptions.startPoint,
            max: this._canvasOptions.endPoint
        }
    },
    _calculateSpecialValues: function() {
        var that = this;
        var canvasOptions = that._canvasOptions;
        var startPoint = canvasOptions.startPoint - canvasOptions.startPadding;
        var endPoint = canvasOptions.endPoint + canvasOptions.endPadding;
        var range = that._businessRange;
        var minVisible = range.minVisible;
        var maxVisible = range.maxVisible;
        var canvas_position_center_middle = startPoint + canvasOptions.canvasLength / 2;
        var canvas_position_default = void 0;
        if (minVisible < 0 && maxVisible > 0 && minVisible !== maxVisible) {
            canvas_position_default = that.translate(0, 1)
        }
        if (!isDefined(canvas_position_default)) {
            var invert = range.invert ^ (minVisible < 0 && maxVisible <= 0);
            if (that._options.isHorizontal) {
                canvas_position_default = invert ? endPoint : startPoint
            } else {
                canvas_position_default = invert ? startPoint : endPoint
            }
        }
        that.sc = {
            canvas_position_default: canvas_position_default,
            canvas_position_left: startPoint,
            canvas_position_top: startPoint,
            canvas_position_center: canvas_position_center_middle,
            canvas_position_middle: canvas_position_center_middle,
            canvas_position_right: endPoint,
            canvas_position_bottom: endPoint,
            canvas_position_start: canvasOptions.invert ? endPoint : startPoint,
            canvas_position_end: canvasOptions.invert ? startPoint : endPoint
        }
    },
    translateSpecialCase: function(value) {
        return this.sc[value]
    },
    _calculateProjection: function(distance) {
        var canvasOptions = this._canvasOptions;
        return canvasOptions.invert ? canvasOptions.endPoint - distance : canvasOptions.startPoint + distance
    },
    _calculateUnProjection: function(distance) {
        var canvasOptions = this._canvasOptions;
        return canvasOptions.invert ? canvasOptions.rangeMaxVisible.valueOf() - distance : canvasOptions.rangeMinVisible.valueOf() + distance
    },
    getMinBarSize: function(minBarSize) {
        var visibleArea = this.getCanvasVisibleArea(),
            minValue = this.from(visibleArea.min + minBarSize);
        return _abs(this.from(visibleArea.min) - (!isDefined(minValue) ? this.from(visibleArea.max) : minValue))
    },
    checkMinBarSize: function(value, minShownValue, stackValue) {
        return _abs(value) < minShownValue ? value >= 0 ? minShownValue : -minShownValue : value
    },
    translate: function(bp, direction) {
        var specialValue = this.translateSpecialCase(bp);
        if (isDefined(specialValue)) {
            return Math.round(specialValue)
        }
        if (isNaN(bp)) {
            return null
        }
        return this.to(bp, direction)
    },
    getInterval: function(interval) {
        var canvasOptions = this._canvasOptions;
        interval = isDefined(interval) ? interval : this._businessRange.interval;
        if (interval) {
            return Math.round(canvasOptions.ratioOfCanvasRange * interval)
        }
        return Math.round(canvasOptions.endPoint - canvasOptions.startPoint)
    },
    zoom: function(translate, scale, wholeRange) {
        var canvasOptions = this._canvasOptions;
        if (canvasOptions.rangeMinVisible.valueOf() === canvasOptions.rangeMaxVisible.valueOf() && 0 !== translate) {
            return this.zoomZeroLengthRange(translate, scale)
        }
        var startPoint = canvasOptions.startPoint;
        var endPoint = canvasOptions.endPoint;
        var isInverted = this.isInverted();
        var newStart = (startPoint + translate) / scale;
        var newEnd = (endPoint + translate) / scale;
        wholeRange = wholeRange || {};
        var minPoint = this.to(isInverted ? wholeRange.endValue : wholeRange.startValue);
        var maxPoint = this.to(isInverted ? wholeRange.startValue : wholeRange.endValue);
        var min = void 0;
        var max = void 0;
        if (minPoint > newStart) {
            newEnd -= newStart - minPoint;
            newStart = minPoint;
            min = isInverted ? wholeRange.endValue : wholeRange.startValue
        }
        if (maxPoint < newEnd) {
            newStart -= newEnd - maxPoint;
            newEnd = maxPoint;
            max = isInverted ? wholeRange.startValue : wholeRange.endValue
        }
        if (maxPoint - minPoint < newEnd - newStart) {
            newStart = minPoint;
            newEnd = maxPoint
        }
        translate = (endPoint - startPoint) * newStart / (newEnd - newStart) - startPoint;
        scale = (startPoint + translate) / newStart || 1;
        min = isDefined(min) ? min : adjust(this.from(newStart, 1));
        max = isDefined(max) ? max : adjust(this.from(newEnd, -1));
        if (min > max) {
            min = min > wholeRange.endValue ? wholeRange.endValue : min;
            max = max < wholeRange.startValue ? wholeRange.startValue : max
        } else {
            min = min < wholeRange.startValue ? wholeRange.startValue : min;
            max = max > wholeRange.endValue ? wholeRange.endValue : max
        }
        return {
            min: min,
            max: max,
            translate: adjust(translate),
            scale: adjust(scale)
        }
    },
    zoomZeroLengthRange: function(translate, scale) {
        var canvasOptions = this._canvasOptions;
        var min = canvasOptions.rangeMin;
        var max = canvasOptions.rangeMax;
        var correction = (max.valueOf() !== min.valueOf() ? max.valueOf() - min.valueOf() : _abs(canvasOptions.rangeMinVisible.valueOf() - min.valueOf())) / canvasOptions.canvasLength;
        var isDateTime = typeUtils.isDate(max) || typeUtils.isDate(min);
        var isLogarithmic = "logarithmic" === this._businessRange.axisType;
        var newMin = canvasOptions.rangeMinVisible.valueOf() - correction;
        var newMax = canvasOptions.rangeMaxVisible.valueOf() + correction;
        newMin = isLogarithmic ? adjust(Math.pow(canvasOptions.base, newMin)) : isDateTime ? new Date(newMin) : newMin;
        newMax = isLogarithmic ? adjust(Math.pow(canvasOptions.base, newMax)) : isDateTime ? new Date(newMax) : newMax;
        return {
            min: newMin,
            max: newMax,
            translate: translate,
            scale: scale
        }
    },
    getMinScale: function(zoom) {
        return zoom ? 1.1 : .9
    },
    getScale: function(val1, val2) {
        var canvasOptions = this._canvasOptions;
        if (canvasOptions.rangeMax === canvasOptions.rangeMin) {
            return 1
        }
        val1 = isDefined(val1) ? this._fromValue(val1) : canvasOptions.rangeMin;
        val2 = isDefined(val2) ? this._fromValue(val2) : canvasOptions.rangeMax;
        return (canvasOptions.rangeMax - canvasOptions.rangeMin) / Math.abs(val1 - val2)
    },
    isValid: function(value) {
        var co = this._canvasOptions;
        value = this._fromValue(value);
        return null !== value && !isNaN(value) && value.valueOf() + co.rangeDoubleError >= co.rangeMin && value.valueOf() - co.rangeDoubleError <= co.rangeMax
    },
    getCorrectValue: function(value, direction) {
        var prop, that = this,
            breaks = that._breaks;
        value = that._fromValue(value);
        if (that._breaks) {
            prop = that._checkValueAboutBreaks(breaks, value, "trFrom", "trTo", that._checkingMethodsAboutBreaks[0]);
            if (true === prop.inBreak) {
                return that._toValue(direction > 0 ? prop.break.trTo : prop.break.trFrom)
            }
        }
        return that._toValue(value)
    },
    to: function(bp, direction) {
        var range = this.getBusinessRange();
        if (isDefined(range.maxVisible) && isDefined(range.minVisible) && range.maxVisible.valueOf() === range.minVisible.valueOf()) {
            if (!isDefined(bp) || range.maxVisible.valueOf() !== bp.valueOf()) {
                return null
            }
            return this.translateSpecialCase(0 === bp && this._options.shiftZeroValue ? "canvas_position_default" : "canvas_position_middle")
        }
        bp = this._fromValue(bp);
        var that = this,
            canvasOptions = that._canvasOptions,
            breaks = that._breaks,
            prop = {
                length: 0
            },
            commonBreakSize = 0;
        if (void 0 !== breaks) {
            prop = that._checkValueAboutBreaks(breaks, bp, "trFrom", "trTo", that._checkingMethodsAboutBreaks[0]);
            commonBreakSize = isDefined(prop.breaksSize) ? prop.breaksSize : 0
        }
        if (true === prop.inBreak) {
            if (direction > 0) {
                return prop.break.start
            } else {
                if (direction < 0) {
                    return prop.break.end
                } else {
                    return null
                }
            }
        }
        return that._conversionValue(that._calculateProjection((bp - canvasOptions.rangeMinVisible - prop.length) * canvasOptions.ratioOfCanvasRange + commonBreakSize))
    },
    from: function(pos, direction) {
        var that = this,
            breaks = that._breaks,
            prop = {
                length: 0
            },
            canvasOptions = that._canvasOptions,
            startPoint = canvasOptions.startPoint,
            commonBreakSize = 0;
        if (void 0 !== breaks) {
            prop = that._checkValueAboutBreaks(breaks, pos, "start", "end", that._checkingMethodsAboutBreaks[1]);
            commonBreakSize = isDefined(prop.breaksSize) ? prop.breaksSize : 0
        }
        if (true === prop.inBreak) {
            if (direction > 0) {
                return that._toValue(prop.break.trTo)
            } else {
                if (direction < 0) {
                    return that._toValue(prop.break.trFrom)
                } else {
                    return null
                }
            }
        }
        return that._toValue(that._calculateUnProjection((pos - startPoint - commonBreakSize) / canvasOptions.ratioOfCanvasRange + prop.length))
    },
    isValueProlonged: false,
    getRange: function() {
        return [this._toValue(this._canvasOptions.rangeMin), this._toValue(this._canvasOptions.rangeMax)]
    },
    getScreenRange: function() {
        return [this._canvasOptions.startPoint, this._canvasOptions.endPoint]
    },
    add: function(value, diff, dir) {
        return this._add(value, diff, (this._businessRange.invert ? -1 : 1) * dir)
    },
    _add: function(value, diff, coeff) {
        return this._toValue(this._fromValue(value) + diff * coeff)
    },
    _fromValue: function(value) {
        return null !== value ? Number(value) : null
    },
    _toValue: function(value) {
        return null !== value ? Number(value) : null
    },
    ratioOfCanvasRange: function() {
        return this._canvasOptions.ratioOfCanvasRange
    }
};
