/**
 * DevExtreme (viz/series/scatter_series.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        })
    } else {
        obj[key] = value
    }
    return obj
}
var _extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    _each = require("../../core/utils/iterator").each,
    rangeCalculator = require("./helpers/range_data_calculator"),
    typeUtils = require("../../core/utils/type"),
    vizUtils = require("../core/utils"),
    _noop = require("../../core/utils/common").noop,
    _isDefined = typeUtils.isDefined,
    _isString = typeUtils.isString,
    _map = vizUtils.map,
    _normalizeEnum = vizUtils.normalizeEnum,
    math = Math,
    _abs = math.abs,
    _sqrt = math.sqrt,
    _max = math.max,
    DEFAULT_TRACKER_WIDTH = 12,
    DEFAULT_DURATION = 400,
    HIGH_ERROR = "highError",
    LOW_ERROR = "lowError",
    VARIANCE = "variance",
    STANDARD_DEVIATION = "stddeviation",
    STANDARD_ERROR = "stderror",
    PERCENT = "percent",
    FIXED = "fixed",
    UNDEFINED = "undefined",
    DISCRETE = "discrete",
    LOGARITHMIC = "logarithmic",
    DATETIME = "datetime";
exports.chart = {};
exports.polar = {};

function sum(array) {
    var result = 0;
    _each(array, function(_, value) {
        result += value
    });
    return result
}

function isErrorBarTypeCorrect(type) {
    return inArray(type, [FIXED, PERCENT, VARIANCE, STANDARD_DEVIATION, STANDARD_ERROR]) !== -1
}

function variance(array, expectedValue) {
    return sum(_map(array, function(value) {
        return (value - expectedValue) * (value - expectedValue)
    })) / array.length
}

function calculateAvgErrorBars(result, data, series) {
    var errorBarsOptions = series.getOptions().valueErrorBar,
        valueField = series.getValueFields()[0],
        lowValueField = errorBarsOptions.lowValueField || LOW_ERROR,
        highValueField = errorBarsOptions.highValueField || HIGH_ERROR;
    if (series.areErrorBarsVisible() && void 0 === errorBarsOptions.type) {
        var fusionData = data.reduce(function(result, item) {
            if (_isDefined(item[lowValueField])) {
                result[0] += item[valueField] - item[lowValueField];
                result[1]++
            }
            if (_isDefined(item[highValueField])) {
                result[2] += item[highValueField] - item[valueField];
                result[3]++
            }
            return result
        }, [0, 0, 0, 0]);
        if (fusionData[1]) {
            result[lowValueField] = result[valueField] - fusionData[0] / fusionData[1]
        }
        if (fusionData[2]) {
            result[highValueField] = result[valueField] + fusionData[2] / fusionData[3]
        }
    }
    return result
}

function calculateSumErrorBars(result, data, series) {
    var errorBarsOptions = series.getOptions().valueErrorBar,
        lowValueField = errorBarsOptions.lowValueField || LOW_ERROR,
        highValueField = errorBarsOptions.highValueField || HIGH_ERROR;
    if (series.areErrorBarsVisible() && void 0 === errorBarsOptions.type) {
        result[lowValueField] = 0;
        result[highValueField] = 0;
        result = data.reduce(function(result, item) {
            result[lowValueField] += item[lowValueField];
            result[highValueField] += item[highValueField];
            return result
        }, result)
    }
    return result
}

function getMinMaxAggregator(compare) {
    return function(_ref, series) {
        var intervalStart = _ref.intervalStart,
            data = _ref.data;
        var valueField = series.getValueFields()[0];
        var targetData = data[0];
        targetData = data.reduce(function(result, item) {
            var value = item[valueField];
            if (null === result[valueField]) {
                result = item
            }
            if (null !== value && compare(value, result[valueField])) {
                return item
            }
            return result
        }, targetData);
        return _extend({}, targetData, _defineProperty({}, series.getArgumentField(), intervalStart))
    }
}

function checkFields(data, fieldsToCheck, skippedFields) {
    var allFieldsIsValid = true;
    for (var field in fieldsToCheck) {
        var isArgument = "argument" === field;
        if (isArgument || "size" === field ? !_isDefined(data[field]) : void 0 === data[field]) {
            var selector = fieldsToCheck[field];
            if (!isArgument) {
                skippedFields[selector] = (skippedFields[selector] || 0) + 1
            }
            allFieldsIsValid = false
        }
    }
    return allFieldsIsValid
}
var baseScatterMethods = {
    _defaultDuration: DEFAULT_DURATION,
    _defaultTrackerWidth: DEFAULT_TRACKER_WIDTH,
    _applyStyle: _noop,
    _updateOptions: _noop,
    _parseStyle: _noop,
    _prepareSegment: _noop,
    _drawSegment: _noop,
    _appendInGroup: function() {
        this._group.append(this._extGroups.seriesGroup)
    },
    _createLegendState: function(styleOptions, defaultColor) {
        return {
            fill: styleOptions.color || defaultColor,
            hatching: styleOptions.hatching ? _extend({}, styleOptions.hatching, {
                direction: "right"
            }) : void 0
        }
    },
    _applyElementsClipRect: function(settings) {
        settings["clip-path"] = this._paneClipRectID
    },
    _applyMarkerClipRect: function(settings) {
        settings["clip-path"] = this._forceClipping ? this._paneClipRectID : null
    },
    _createGroup: function(groupName, parent, target, settings) {
        var group = parent[groupName] = parent[groupName] || this._renderer.g();
        target && group.append(target);
        settings && group.attr(settings)
    },
    _applyClearingSettings: function(settings) {
        settings.opacity = null;
        settings.scale = null;
        if (this._options.rotated) {
            settings.translateX = null
        } else {
            settings.translateY = null
        }
    },
    _createGroups: function() {
        var that = this;
        that._createGroup("_markersGroup", that, that._group);
        that._createGroup("_labelsGroup", that)
    },
    _setMarkerGroupSettings: function() {
        var that = this,
            settings = that._createPointStyles(that._getMarkerGroupOptions()).normal;
        settings.class = "dxc-markers";
        settings.opacity = 1;
        that._applyMarkerClipRect(settings);
        that._markersGroup.attr(settings)
    },
    getVisibleArea: function() {
        return this._visibleArea
    },
    areErrorBarsVisible: function() {
        var errorBarOptions = this._options.valueErrorBar;
        return errorBarOptions && this._errorBarsEnabled() && "none" !== errorBarOptions.displayMode && (isErrorBarTypeCorrect(_normalizeEnum(errorBarOptions.type)) || _isDefined(errorBarOptions.lowValueField) || _isDefined(errorBarOptions.highValueField))
    },
    groupPointsByCoords: function(rotated) {
        var cat = [];
        _each(this.getVisiblePoints(), function(_, p) {
            var pointCoord = parseInt(rotated ? p.vy : p.vx);
            if (!cat[pointCoord]) {
                cat[pointCoord] = p
            } else {
                Array.isArray(cat[pointCoord]) ? cat[pointCoord].push(p) : cat[pointCoord] = [cat[pointCoord], p]
            }
        });
        return cat
    },
    _createErrorBarGroup: function(animationEnabled) {
        var settings, that = this,
            errorBarOptions = that._options.valueErrorBar;
        if (that.areErrorBarsVisible()) {
            settings = {
                "class": "dxc-error-bars",
                stroke: errorBarOptions.color,
                "stroke-width": errorBarOptions.lineWidth,
                opacity: animationEnabled ? .001 : errorBarOptions.opacity || 1,
                "stroke-linecap": "square",
                sharp: true,
                "clip-path": that._forceClipping ? that._paneClipRectID : that._widePaneClipRectID
            };
            that._createGroup("_errorBarGroup", that, that._group, settings)
        }
    },
    _setGroupsSettings: function(animationEnabled) {
        var that = this;
        that._setMarkerGroupSettings();
        that._setLabelGroupSettings(animationEnabled);
        that._createErrorBarGroup(animationEnabled)
    },
    _getCreatingPointOptions: function() {
        var defaultPointOptions, normalStyle, that = this,
            creatingPointOptions = that._predefinedPointOptions;
        if (!creatingPointOptions) {
            defaultPointOptions = that._getPointOptions();
            that._predefinedPointOptions = creatingPointOptions = _extend(true, {
                styles: {}
            }, defaultPointOptions);
            normalStyle = defaultPointOptions.styles && defaultPointOptions.styles.normal || {};
            creatingPointOptions.styles = creatingPointOptions.styles || {};
            creatingPointOptions.styles.normal = {
                "stroke-width": normalStyle["stroke-width"],
                r: normalStyle.r,
                opacity: normalStyle.opacity
            }
        }
        return creatingPointOptions
    },
    _getPointOptions: function() {
        return this._parsePointOptions(this._preparePointOptions(), this._options.label)
    },
    _getOptionsForPoint: function() {
        return this._options.point
    },
    _parsePointStyle: function(style, defaultColor, defaultBorderColor, defaultSize) {
        var border = style.border || {},
            sizeValue = void 0 !== style.size ? style.size : defaultSize;
        return {
            fill: style.color || defaultColor,
            stroke: border.color || defaultBorderColor,
            "stroke-width": border.visible ? border.width : 0,
            r: sizeValue / 2 + (border.visible && 0 !== sizeValue ? ~~(border.width / 2) || 0 : 0)
        }
    },
    _createPointStyles: function(pointOptions) {
        var that = this,
            mainPointColor = pointOptions.color || that._options.mainSeriesColor,
            containerColor = that._options.containerBackgroundColor,
            normalStyle = that._parsePointStyle(pointOptions, mainPointColor, mainPointColor);
        normalStyle.visibility = pointOptions.visible ? "visible" : "hidden";
        return {
            normal: normalStyle,
            hover: that._parsePointStyle(pointOptions.hoverStyle, containerColor, mainPointColor, pointOptions.size),
            selection: that._parsePointStyle(pointOptions.selectionStyle, containerColor, mainPointColor, pointOptions.size)
        }
    },
    _checkData: function(data, skippedFields, fieldsToCheck) {
        fieldsToCheck = fieldsToCheck || {
            value: this.getValueFields()[0]
        };
        fieldsToCheck.argument = this.getArgumentField();
        return checkFields(data, fieldsToCheck, skippedFields || {}) && data.value === data.value
    },
    getErrorBarRangeCorrector: function() {
        var mode, func;
        if (this.areErrorBarsVisible()) {
            mode = _normalizeEnum(this._options.valueErrorBar.displayMode);
            func = function(point) {
                var lowError = point.lowError,
                    highError = point.highError;
                switch (mode) {
                    case "low":
                        return [lowError];
                    case "high":
                        return [highError];
                    case "none":
                        return [];
                    default:
                        return [lowError, highError]
                }
            }
        }
        return func
    },
    getValueRangeInitialValue: function() {
        return
    },
    _getRangeData: function() {
        return rangeCalculator.getRangeData(this)
    },
    _getPointDataSelector: function() {
        var _this = this;
        var valueField = this.getValueFields()[0];
        var argumentField = this.getArgumentField();
        var tagField = this.getTagField();
        var areErrorBarsVisible = this.areErrorBarsVisible();
        var lowValueField = void 0,
            highValueField = void 0;
        if (areErrorBarsVisible) {
            var errorBarOptions = this._options.valueErrorBar;
            lowValueField = errorBarOptions.lowValueField || LOW_ERROR;
            highValueField = errorBarOptions.highValueField || HIGH_ERROR
        }
        return function(data) {
            var pointData = {
                value: _this._processEmptyValue(data[valueField]),
                argument: data[argumentField],
                tag: data[tagField],
                data: data
            };
            if (areErrorBarsVisible) {
                pointData.lowError = data[lowValueField];
                pointData.highError = data[highValueField]
            }
            return pointData
        }
    },
    _errorBarsEnabled: function() {
        return this.valueAxisType !== DISCRETE && this.valueAxisType !== LOGARITHMIC && this.valueType !== DATETIME
    },
    _drawPoint: function(options) {
        var point = options.point;
        if (point.isInVisibleArea()) {
            point.clearVisibility();
            point.draw(this._renderer, options.groups, options.hasAnimation, options.firstDrawing);
            this._drawnPoints.push(point)
        } else {
            point.setInvisibility()
        }
    },
    _animateComplete: function() {
        var that = this,
            animationSettings = {
                duration: that._defaultDuration
            };
        that._labelsGroup && that._labelsGroup.animate({
            opacity: 1
        }, animationSettings);
        that._errorBarGroup && that._errorBarGroup.animate({
            opacity: that._options.valueErrorBar.opacity || 1
        }, animationSettings)
    },
    _animate: function() {
        var that = this,
            lastPointIndex = that._drawnPoints.length - 1;
        _each(that._drawnPoints || [], function(i, p) {
            p.animate(i === lastPointIndex ? function() {
                that._animateComplete()
            } : void 0, {
                translateX: p.x,
                translateY: p.y
            })
        })
    },
    _defaultAggregator: "avg",
    _aggregators: {
        avg: function(_ref2, series) {
            var _calculateAvgErrorBar;
            var data = _ref2.data,
                intervalStart = _ref2.intervalStart;
            if (!data.length) {
                return
            }
            var valueField = series.getValueFields()[0];
            var aggregationResult = data.reduce(function(result, item) {
                var value = item[valueField];
                if (_isDefined(value)) {
                    result[0] += value;
                    result[1]++
                } else {
                    if (null === value) {
                        result[2]++
                    }
                }
                return result
            }, [0, 0, 0]);
            return calculateAvgErrorBars((_calculateAvgErrorBar = {}, _defineProperty(_calculateAvgErrorBar, valueField, aggregationResult[2] === data.length ? null : aggregationResult[0] / aggregationResult[1]), _defineProperty(_calculateAvgErrorBar, series.getArgumentField(), intervalStart), _calculateAvgErrorBar), data, series)
        },
        sum: function(_ref3, series) {
            var _calculateSumErrorBar;
            var intervalStart = _ref3.intervalStart,
                data = _ref3.data;
            if (!data.length) {
                return
            }
            var valueField = series.getValueFields()[0];
            var aggregationResult = data.reduce(function(result, item) {
                var value = item[valueField];
                if (void 0 !== value) {
                    result[0] += value
                }
                if (null === value) {
                    result[1]++
                } else {
                    if (void 0 === value) {
                        result[2]++
                    }
                }
                return result
            }, [0, 0, 0]);
            var value = aggregationResult[0];
            if (aggregationResult[1] === data.length) {
                value = null
            }
            if (aggregationResult[2] === data.length) {
                return
            }
            return calculateSumErrorBars((_calculateSumErrorBar = {}, _defineProperty(_calculateSumErrorBar, valueField, value), _defineProperty(_calculateSumErrorBar, series.getArgumentField(), intervalStart), _calculateSumErrorBar), data, series)
        },
        count: function(_ref4, series) {
            var _ref5;
            var data = _ref4.data,
                intervalStart = _ref4.intervalStart;
            var valueField = series.getValueFields()[0];
            return _ref5 = {}, _defineProperty(_ref5, series.getArgumentField(), intervalStart), _defineProperty(_ref5, valueField, data.filter(function(i) {
                return void 0 !== i[valueField]
            }).length), _ref5
        },
        min: getMinMaxAggregator(function(a, b) {
            return a < b
        }),
        max: getMinMaxAggregator(function(a, b) {
            return a > b
        })
    },
    _endUpdateData: function() {
        delete this._predefinedPointOptions
    },
    getArgumentField: function() {
        return this._options.argumentField || "arg"
    },
    getValueFields: function() {
        var lowValueField, highValueField, options = this._options,
            errorBarsOptions = options.valueErrorBar,
            valueFields = [options.valueField || "val"];
        if (errorBarsOptions) {
            lowValueField = errorBarsOptions.lowValueField;
            highValueField = errorBarsOptions.highValueField;
            _isString(lowValueField) && valueFields.push(lowValueField);
            _isString(highValueField) && valueFields.push(highValueField)
        }
        return valueFields
    },
    _calculateErrorBars: function(data) {
        if (!this.areErrorBarsVisible()) {
            return
        }
        var value, valueArray, valueArrayLength, meanValue, processDataItem, that = this,
            options = that._options,
            errorBarsOptions = options.valueErrorBar,
            errorBarType = _normalizeEnum(errorBarsOptions.type),
            floatErrorValue = parseFloat(errorBarsOptions.value),
            valueField = that.getValueFields()[0],
            lowValueField = errorBarsOptions.lowValueField || LOW_ERROR,
            highValueField = errorBarsOptions.highValueField || HIGH_ERROR,
            addSubError = function(_i, item) {
                value = item.value;
                item.lowError = value - floatErrorValue;
                item.highError = value + floatErrorValue
            };
        switch (errorBarType) {
            case FIXED:
                processDataItem = addSubError;
                break;
            case PERCENT:
                processDataItem = function(_, item) {
                    value = item.value;
                    var error = value * floatErrorValue / 100;
                    item.lowError = value - error;
                    item.highError = value + error
                };
                break;
            case UNDEFINED:
                processDataItem = function(_, item) {
                    item.lowError = item.data[lowValueField];
                    item.highError = item.data[highValueField]
                };
                break;
            default:
                valueArray = _map(data, function(item) {
                    return _isDefined(item.data[valueField]) ? item.data[valueField] : null
                });
                valueArrayLength = valueArray.length;
                floatErrorValue = floatErrorValue || 1;
                switch (errorBarType) {
                    case VARIANCE:
                        floatErrorValue = variance(valueArray, sum(valueArray) / valueArrayLength) * floatErrorValue;
                        processDataItem = addSubError;
                        break;
                    case STANDARD_DEVIATION:
                        meanValue = sum(valueArray) / valueArrayLength;
                        floatErrorValue = _sqrt(variance(valueArray, meanValue)) * floatErrorValue;
                        processDataItem = function(_, item) {
                            item.lowError = meanValue - floatErrorValue;
                            item.highError = meanValue + floatErrorValue
                        };
                        break;
                    case STANDARD_ERROR:
                        floatErrorValue = _sqrt(variance(valueArray, sum(valueArray) / valueArrayLength) / valueArrayLength) * floatErrorValue;
                        processDataItem = addSubError
                }
        }
        processDataItem && _each(data, processDataItem)
    },
    _patchMarginOptions: function(options) {
        var pointOptions = this._getCreatingPointOptions(),
            styles = pointOptions.styles,
            maxSize = [styles.normal, styles.hover, styles.selection].reduce(function(max, style) {
                return _max(max, 2 * style.r + style["stroke-width"])
            }, 0);
        options.size = pointOptions.visible ? maxSize : 0;
        options.sizePointNormalState = pointOptions.visible ? 2 * styles.normal.r + styles.normal["stroke-width"] : 2;
        return options
    },
    usePointsToDefineAutoHiding: function() {
        return true
    }
};
exports.chart = _extend({}, baseScatterMethods, {
    drawTrackers: function() {
        var trackers, trackersGroup, that = this,
            segments = that._segments || [],
            rotated = that._options.rotated;
        if (!that.isVisible()) {
            return
        }
        if (segments.length) {
            trackers = that._trackers = that._trackers || [];
            trackersGroup = that._trackersGroup = (that._trackersGroup || that._renderer.g().attr({
                fill: "gray",
                opacity: .001,
                stroke: "gray",
                "class": "dxc-trackers"
            })).attr({
                "clip-path": this._paneClipRectID || null
            }).append(that._group);
            _each(segments, function(i, segment) {
                if (!trackers[i]) {
                    trackers[i] = that._drawTrackerElement(segment).data({
                        "chart-data-series": that
                    }).append(trackersGroup)
                } else {
                    that._updateTrackerElement(segment, trackers[i])
                }
            })
        }
        that._trackersTranslator = that.groupPointsByCoords(rotated)
    },
    checkAxisVisibleAreaCoord: function(isArgument, coord) {
        var axis = isArgument ? this.getArgumentAxis() : this.getValueAxis();
        var visibleArea = axis.getVisibleArea();
        return _isDefined(coord) && visibleArea[0] <= coord && visibleArea[1] >= coord
    },
    checkSeriesViewportCoord: function(axis, coord) {
        return true
    },
    getSeriesPairCoord: function(coord, isArgument) {
        var oppositeCoord = null;
        var isOpposite = !isArgument && !this._options.rotated || isArgument && this._options.rotated;
        var coordName = !isOpposite ? "vx" : "vy";
        var oppositeCoordName = !isOpposite ? "vy" : "vx";
        var points = this.getVisiblePoints();
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var tmpCoord = p[coordName] === coord ? p[oppositeCoordName] : void 0;
            if (this.checkAxisVisibleAreaCoord(!isArgument, tmpCoord)) {
                oppositeCoord = tmpCoord;
                break
            }
        }
        return oppositeCoord
    },
    getNearestPointsByCoord: function(coord, isArgument) {
        var that = this;
        var rotated = that.getOptions().rotated;
        var isOpposite = !isArgument && !rotated || isArgument && rotated;
        var coordName = isOpposite ? "vy" : "vx";
        var points = that.getVisiblePoints();
        var allPoints = that.getPoints();
        var nearestPoints = [];
        if (that.isVisible() && allPoints.length > 0) {
            if (allPoints.length > 1) {
                that.findNeighborPointsByCoord(coord, coordName, points.slice(0), allPoints, function(point, nextPoint) {
                    nearestPoints.push([point, nextPoint])
                })
            } else {
                if (allPoints[0][coordName] === coord) {
                    nearestPoints.push([allPoints[0], allPoints[0]])
                }
            }
        }
        return nearestPoints
    },
    findNeighborPointsByCoord: function(coord, coordName, points, allPoints, pushNeighborPoints) {
        var searchPoints = allPoints;
        if (points.length > 0) {
            points.splice(0, 0, allPoints[allPoints.indexOf(points[0]) - 1]);
            points.splice(points.length, 0, allPoints[allPoints.indexOf(points[points.length - 1]) + 1]);
            searchPoints = points
        }
        searchPoints.forEach(function(p, i) {
            var np = searchPoints[i + 1];
            if (p && np && (p[coordName] <= coord && np[coordName] >= coord || p[coordName] >= coord && np[coordName] <= coord)) {
                pushNeighborPoints(p, np)
            }
        })
    },
    getNeighborPoint: function(x, y) {
        var minDistance, pCoord = this._options.rotated ? y : x,
            nCoord = pCoord,
            cat = this._trackersTranslator,
            point = null,
            oppositeCoord = this._options.rotated ? x : y,
            oppositeCoordName = this._options.rotated ? "vx" : "vy";
        if (this.isVisible() && cat) {
            point = cat[pCoord];
            do {
                point = cat[nCoord] || cat[pCoord];
                pCoord--;
                nCoord++
            } while ((pCoord >= 0 || nCoord < cat.length) && !point);
            if (Array.isArray(point)) {
                minDistance = _abs(point[0][oppositeCoordName] - oppositeCoord);
                _each(point, function(i, p) {
                    var distance = _abs(p[oppositeCoordName] - oppositeCoord);
                    if (minDistance >= distance) {
                        minDistance = distance;
                        point = p
                    }
                })
            }
        }
        return point
    },
    _applyVisibleArea: function() {
        var that = this,
            rotated = that._options.rotated,
            visibleX = (rotated ? that.getValueAxis() : that.getArgumentAxis()).getVisibleArea(),
            visibleY = (rotated ? that.getArgumentAxis() : that.getValueAxis()).getVisibleArea();
        that._visibleArea = {
            minX: visibleX[0],
            maxX: visibleX[1],
            minY: visibleY[0],
            maxY: visibleY[1]
        }
    },
    getPointCenterByArg: function(arg) {
        var point = this.getPointsByArg(arg)[0];
        return point ? point.getCenterCoord() : void 0
    }
});
exports.polar = _extend({}, baseScatterMethods, {
    drawTrackers: function() {
        exports.chart.drawTrackers.call(this);
        var index, cat = this._trackersTranslator;
        if (!this.isVisible()) {
            return
        }
        _each(cat, function(i, category) {
            if (category) {
                index = i;
                return false
            }
        });
        cat[index + 360] = cat[index]
    },
    getNeighborPoint: function(x, y) {
        var pos = vizUtils.convertXYToPolar(this.getValueAxis().getCenter(), x, y);
        return exports.chart.getNeighborPoint.call(this, pos.phi, pos.r)
    },
    _applyVisibleArea: function() {
        var that = this,
            canvas = that.getValueAxis().getCanvas();
        that._visibleArea = {
            minX: canvas.left,
            maxX: canvas.width - canvas.right,
            minY: canvas.top,
            maxY: canvas.height - canvas.bottom
        }
    }
});
