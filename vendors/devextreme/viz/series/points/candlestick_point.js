/**
 * DevExtreme (viz/series/points/candlestick_point.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../../core/utils/extend").extend,
    symbolPoint = require("./symbol_point"),
    barPoint = require("./bar_point"),
    _math = Math,
    _abs = _math.abs,
    _min = _math.min,
    _max = _math.max,
    _round = _math.round,
    DEFAULT_FINANCIAL_TRACKER_MARGIN = 2;
module.exports = _extend({}, barPoint, {
    _getContinuousPoints: function(openCoord, closeCoord) {
        var points, that = this,
            x = that.x,
            createPoint = that._options.rotated ? function(x, y) {
                return [y, x]
            } : function(x, y) {
                return [x, y]
            },
            width = that.width,
            highCoord = that.highY,
            max = _abs(highCoord - openCoord) < _abs(highCoord - closeCoord) ? openCoord : closeCoord,
            min = max === closeCoord ? openCoord : closeCoord;
        if (min === max) {
            points = [].concat(createPoint(x, that.highY)).concat(createPoint(x, that.lowY)).concat(createPoint(x, that.closeY)).concat(createPoint(x - width / 2, that.closeY)).concat(createPoint(x + width / 2, that.closeY)).concat(createPoint(x, that.closeY))
        } else {
            points = [].concat(createPoint(x, that.highY)).concat(createPoint(x, max)).concat(createPoint(x + width / 2, max)).concat(createPoint(x + width / 2, min)).concat(createPoint(x, min)).concat(createPoint(x, that.lowY)).concat(createPoint(x, min)).concat(createPoint(x - width / 2, min)).concat(createPoint(x - width / 2, max)).concat(createPoint(x, max))
        }
        return points
    },
    _getCrockPoints: function(y) {
        var that = this,
            x = that.x,
            createPoint = that._options.rotated ? function(x, y) {
                return [y, x]
            } : function(x, y) {
                return [x, y]
            };
        return [].concat(createPoint(x, that.highY)).concat(createPoint(x, that.lowY)).concat(createPoint(x, y)).concat(createPoint(x - that.width / 2, y)).concat(createPoint(x + that.width / 2, y)).concat(createPoint(x, y))
    },
    _getPoints: function() {
        var points, that = this,
            closeCoord = that.closeY,
            openCoord = that.openY;
        if (null !== closeCoord && null !== openCoord) {
            points = that._getContinuousPoints(openCoord, closeCoord)
        } else {
            if (openCoord === closeCoord) {
                points = [that.x, that.highY, that.x, that.lowY]
            } else {
                points = that._getCrockPoints(null !== openCoord ? openCoord : closeCoord)
            }
        }
        return points
    },
    getColor: function() {
        var that = this;
        return that._isReduction ? that._options.reduction.color : that._styles.normal.stroke || that.series.getColor()
    },
    _drawMarkerInGroup: function(group, attributes, renderer) {
        var that = this;
        that.graphic = renderer.path(that._getPoints(), "area").attr({
            "stroke-linecap": "square"
        }).attr(attributes).data({
            "chart-data-point": that
        }).sharp().append(group)
    },
    _fillStyle: function() {
        var that = this,
            styles = that._options.styles;
        if (that._isReduction && that._isPositive) {
            that._styles = styles.reductionPositive
        } else {
            if (that._isReduction) {
                that._styles = styles.reduction
            } else {
                if (that._isPositive) {
                    that._styles = styles.positive
                } else {
                    that._styles = styles
                }
            }
        }
    },
    _getMinTrackerWidth: function() {
        return 2 + 2 * this._styles.normal["stroke-width"]
    },
    correctCoordinates: function(correctOptions) {
        var minWidth = this._getMinTrackerWidth(),
            maxWidth = 10,
            width = correctOptions.width;
        width = width < minWidth ? minWidth : width > maxWidth ? maxWidth : width;
        this.width = width + width % 2;
        this.xCorrection = correctOptions.offset
    },
    _getMarkerGroup: function(group) {
        var markerGroup, that = this;
        if (that._isReduction && that._isPositive) {
            markerGroup = group.reductionPositiveMarkersGroup
        } else {
            if (that._isReduction) {
                markerGroup = group.reductionMarkersGroup
            } else {
                if (that._isPositive) {
                    markerGroup = group.defaultPositiveMarkersGroup
                } else {
                    markerGroup = group.defaultMarkersGroup
                }
            }
        }
        return markerGroup
    },
    _drawMarker: function(renderer, group) {
        this._drawMarkerInGroup(this._getMarkerGroup(group), this._getStyle(), renderer)
    },
    _getSettingsForTracker: function() {
        var x, y, width, height, that = this,
            highY = that.highY,
            lowY = that.lowY,
            rotated = that._options.rotated;
        if (highY === lowY) {
            highY = rotated ? highY + DEFAULT_FINANCIAL_TRACKER_MARGIN : highY - DEFAULT_FINANCIAL_TRACKER_MARGIN;
            lowY = rotated ? lowY - DEFAULT_FINANCIAL_TRACKER_MARGIN : lowY + DEFAULT_FINANCIAL_TRACKER_MARGIN
        }
        if (rotated) {
            x = _min(lowY, highY);
            y = that.x - that.width / 2;
            width = _abs(lowY - highY);
            height = that.width
        } else {
            x = that.x - that.width / 2;
            y = _min(lowY, highY);
            width = that.width;
            height = _abs(lowY - highY)
        }
        return {
            x: x,
            y: y,
            width: width,
            height: height
        }
    },
    _getGraphicBBox: function() {
        var that = this,
            rotated = that._options.rotated,
            x = that.x,
            width = that.width,
            lowY = that.lowY,
            highY = that.highY;
        return {
            x: !rotated ? x - _round(width / 2) : lowY,
            y: !rotated ? highY : x - _round(width / 2),
            width: !rotated ? width : highY - lowY,
            height: !rotated ? lowY - highY : width
        }
    },
    getTooltipParams: function(location) {
        var that = this;
        if (that.graphic) {
            var minValue = _min(that.lowY, that.highY),
                maxValue = _max(that.lowY, that.highY),
                visibleArea = that._getVisibleArea(),
                rotated = that._options.rotated,
                minVisible = rotated ? visibleArea.minX : visibleArea.minY,
                maxVisible = rotated ? visibleArea.maxX : visibleArea.maxY,
                min = _max(minVisible, minValue),
                max = _min(maxVisible, maxValue);
            var centerCoord = that.getCenterCoord();
            if ("edge" === location) {
                centerCoord[rotated ? "x" : "y"] = rotated ? max : min
            }
            centerCoord.offset = 0;
            return centerCoord
        }
    },
    getCenterCoord: function() {
        if (this.graphic) {
            var x, y, that = this,
                minValue = _min(that.lowY, that.highY),
                maxValue = _max(that.lowY, that.highY),
                visibleArea = that._getVisibleArea(),
                rotated = that._options.rotated,
                minVisible = rotated ? visibleArea.minX : visibleArea.minY,
                maxVisible = rotated ? visibleArea.maxX : visibleArea.maxY,
                min = _max(minVisible, minValue),
                max = _min(maxVisible, maxValue),
                center = min + (max - min) / 2;
            if (rotated) {
                y = that.x;
                x = center
            } else {
                x = that.x;
                y = center
            }
            return {
                x: x,
                y: y
            }
        }
    },
    hasValue: function() {
        return null !== this.highValue && null !== this.lowValue
    },
    hasCoords: function() {
        return null !== this.x && null !== this.lowY && null !== this.highY
    },
    _translate: function() {
        var centerValue, that = this,
            rotated = that._options.rotated,
            valTranslator = that._getValTranslator(),
            x = that._getArgTranslator().translate(that.argument);
        that.vx = that.vy = that.x = null === x ? x : x + (that.xCorrection || 0);
        that.openY = null !== that.openValue ? valTranslator.translate(that.openValue) : null;
        that.highY = valTranslator.translate(that.highValue);
        that.lowY = valTranslator.translate(that.lowValue);
        that.closeY = null !== that.closeValue ? valTranslator.translate(that.closeValue) : null;
        centerValue = _min(that.lowY, that.highY) + _abs(that.lowY - that.highY) / 2;
        that._calculateVisibility(!rotated ? that.x : centerValue, !rotated ? centerValue : that.x)
    },
    getCrosshairData: function(x, y) {
        var yValue, coords, that = this,
            rotated = that._options.rotated,
            origY = rotated ? x : y,
            argument = that.argument,
            coord = "low";
        if (_abs(that.lowY - origY) < _abs(that.closeY - origY)) {
            yValue = that.lowY
        } else {
            yValue = that.closeY;
            coord = "close"
        }
        if (_abs(yValue - origY) >= _abs(that.openY - origY)) {
            yValue = that.openY;
            coord = "open"
        }
        if (_abs(yValue - origY) >= _abs(that.highY - origY)) {
            yValue = that.highY;
            coord = "high"
        }
        if (rotated) {
            coords = {
                y: that.vy,
                x: yValue,
                xValue: that[coord + "Value"],
                yValue: argument
            }
        } else {
            coords = {
                x: that.vx,
                y: yValue,
                xValue: argument,
                yValue: that[coord + "Value"]
            }
        }
        coords.axis = that.series.axis;
        return coords
    },
    _updateData: function(data) {
        var that = this,
            label = that._label,
            reductionColor = this._options.reduction.color;
        that.value = that.initialValue = data.reductionValue;
        that.originalValue = data.value;
        that.lowValue = that.originalLowValue = data.lowValue;
        that.highValue = that.originalHighValue = data.highValue;
        that.openValue = that.originalOpenValue = data.openValue;
        that.closeValue = that.originalCloseValue = data.closeValue;
        that._isPositive = data.openValue < data.closeValue;
        that._isReduction = data.isReduction;
        if (that._isReduction) {
            label.setColor(reductionColor)
        }
    },
    _updateMarker: function(animationEnabled, style, group) {
        var that = this,
            graphic = that.graphic;
        graphic.attr({
            points: that._getPoints()
        }).smartAttr(style).sharp();
        group && graphic.append(that._getMarkerGroup(group))
    },
    _getLabelFormatObject: function() {
        var that = this;
        return {
            openValue: that.openValue,
            highValue: that.highValue,
            lowValue: that.lowValue,
            closeValue: that.closeValue,
            reductionValue: that.initialValue,
            argument: that.initialArgument,
            value: that.initialValue,
            seriesName: that.series.name,
            originalOpenValue: that.originalOpenValue,
            originalCloseValue: that.originalCloseValue,
            originalLowValue: that.originalLowValue,
            originalHighValue: that.originalHighValue,
            originalArgument: that.originalArgument,
            point: that
        }
    },
    _getFormatObject: function(tooltip) {
        var that = this,
            highValue = tooltip.formatValue(that.highValue),
            openValue = tooltip.formatValue(that.openValue),
            closeValue = tooltip.formatValue(that.closeValue),
            lowValue = tooltip.formatValue(that.lowValue),
            symbolMethods = symbolPoint,
            formatObject = symbolMethods._getFormatObject.call(that, tooltip);
        return _extend({}, formatObject, {
            valueText: "h: " + highValue + ("" !== openValue ? " o: " + openValue : "") + ("" !== closeValue ? " c: " + closeValue : "") + " l: " + lowValue,
            highValueText: highValue,
            openValueText: openValue,
            closeValueText: closeValue,
            lowValueText: lowValue
        })
    },
    getMaxValue: function() {
        return this.highValue
    },
    getMinValue: function() {
        return this.lowValue
    }
});
