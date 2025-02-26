/**
 * DevExtreme (viz/pie_chart.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _consts = require("./components/consts");
var _utils = require("./core/utils");
var _extend2 = require("../core/utils/extend");
var _type = require("../core/utils/type");
var _iterator = require("../core/utils/iterator");
var _range = require("./translators/range");
var _range2 = _interopRequireDefault(_range);
var _component_registrator = require("../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _base_chart = require("./chart_components/base_chart");
var _common = require("../core/utils/common");
var _translator1d = require("./translators/translator1d");
var _translator1d2 = _interopRequireDefault(_translator1d);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var OPTIONS_FOR_REFRESH_SERIES = ["startAngle", "innerRadius", "segmentsDirection", "type"],
    NORMAL_STATE = _consts.states.normalMark,
    MAX_RESOLVE_ITERATION_COUNT = 5,
    LEGEND_ACTIONS = [_consts.states.resetItem, _consts.states.applyHover, _consts.states.applySelected, _consts.states.applySelected];

function getLegendItemAction(points) {
    var state = NORMAL_STATE;
    points.forEach(function(point) {
        state |= point.fullState
    });
    return LEGEND_ACTIONS[state]
}

function correctPercentValue(value) {
    if ((0, _type.isNumeric)(value)) {
        if (value > 1) {
            value = 1
        } else {
            if (value < 0) {
                value = 0
            }
        }
    } else {
        value = void 0
    }
    return value
}
var dxPieChart = _base_chart.BaseChart.inherit({
    _themeSection: "pie",
    _layoutManagerOptions: function() {
        return (0, _extend2.extend)(true, {}, this.callBase(), {
            piePercentage: correctPercentValue(this._themeManager.getOptions("diameter")),
            minPiePercentage: correctPercentValue(this._themeManager.getOptions("minDiameter"))
        })
    },
    _optionChangesMap: {
        diameter: "REINIT",
        minDiameter: "REINIT",
        sizeGroup: "REINIT"
    },
    _disposeCore: function() {
        pieSizeEqualizer.remove(this);
        this.callBase()
    },
    _groupSeries: function() {
        var series = this.series;
        this._groupsData = {
            groups: [{
                series: series,
                valueOptions: {
                    valueType: "numeric"
                }
            }],
            argumentOptions: series[0] && series[0].getOptions()
        }
    },
    getArgumentAxis: function() {
        return null
    },
    _getValueAxis: function() {
        var translator = (new _translator1d2.default.Translator1D).setCodomain(360, 0);
        return {
            getTranslator: function() {
                return translator
            },
            setBusinessRange: function(range) {
                translator.setDomain(range.min, range.max)
            }
        }
    },
    _populateBusinessRange: function() {
        this.series.map(function(series) {
            var range = new _range2.default.Range;
            range.addRange(series.getRangeData().val);
            series.getValueAxis().setBusinessRange(range);
            return range
        })
    },
    _specialProcessSeries: function() {
        (0, _iterator.each)(this.series, function(_, singleSeries) {
            singleSeries.arrangePoints()
        })
    },
    _checkPaneName: function() {
        return true
    },
    _processSingleSeries: function(singleSeries) {
        this.callBase(singleSeries);
        singleSeries.arrangePoints()
    },
    _handleSeriesDataUpdated: function() {
        var maxPointCount = 0;
        this.series.forEach(function(s) {
            maxPointCount = Math.max(s.getPointsCount(), maxPointCount)
        });
        this.series.forEach(function(s) {
            s.setMaxPointsCount(maxPointCount)
        });
        this.callBase()
    },
    _getLegendOptions: function(item) {
        var legendItem = this.callBase(item);
        var legendData = legendItem.legendData;
        legendData.argument = item.argument;
        legendData.argumentIndex = item.argumentIndex;
        legendData.points = [item];
        return legendItem
    },
    _getLegendTargets: function() {
        var that = this;
        var itemsByArgument = {};
        (that.series || []).forEach(function(series) {
            series.getPoints().forEach(function(point) {
                var argument = point.argument.valueOf();
                var index = series.getPointsByArg(argument).indexOf(point);
                var key = argument.valueOf().toString() + index;
                itemsByArgument[key] = itemsByArgument[key] || [];
                var argumentCount = itemsByArgument[key].push(point);
                point.index = itemsByArgument[key][argumentCount - 2] ? itemsByArgument[key][argumentCount - 2].index : Object.keys(itemsByArgument).length - 1;
                point.argumentIndex = index
            })
        });
        var items = [];
        (0, _iterator.each)(itemsByArgument, function(_, points) {
            points.forEach(function(point, index) {
                if (0 === index) {
                    items.push(that._getLegendOptions(point));
                    return
                }
                var item = items[items.length - 1];
                item.legendData.points.push(point);
                if (!item.visible) {
                    item.visible = point.isVisible()
                }
            })
        });
        return items
    },
    _getLayoutTargets: function() {
        return [{
            canvas: this._canvas
        }]
    },
    _getLayoutSeries: function(series, drawOptions) {
        var layout, that = this,
            canvas = that._canvas,
            drawnLabels = false;
        layout = that.layoutManager.applyPieChartSeriesLayout(canvas, series, true);
        series.forEach(function(singleSeries) {
            singleSeries.correctPosition(layout, canvas);
            drawnLabels = singleSeries.drawLabelsWOPoints() || drawnLabels
        });
        if (drawnLabels) {
            layout = that.layoutManager.applyPieChartSeriesLayout(canvas, series, drawOptions.hideLayoutLabels)
        }
        series.forEach(function(singleSeries) {
            singleSeries.hideLabels()
        });
        that._sizeGroupLayout = {
            x: layout.centerX,
            y: layout.centerY,
            radius: layout.radiusOuter,
            drawOptions: drawOptions
        };
        return layout
    },
    _getLayoutSeriesForEqualPies: function(series, sizeGroupLayout) {
        var canvas = this._canvas,
            layout = this.layoutManager.applyEqualPieChartLayout(series, sizeGroupLayout);
        series.forEach(function(s) {
            s.correctPosition(layout, canvas);
            s.drawLabelsWOPoints()
        });
        this.layoutManager.correctPieLabelRadius(series, layout, canvas);
        return layout
    },
    _updateSeriesDimensions: function(drawOptions) {
        var innerRad, delta, layout, that = this,
            visibleSeries = that._getVisibleSeries(),
            lengthVisibleSeries = visibleSeries.length,
            sizeGroupLayout = drawOptions.sizeGroupLayout;
        if (lengthVisibleSeries) {
            layout = sizeGroupLayout ? that._getLayoutSeriesForEqualPies(visibleSeries, sizeGroupLayout) : that._getLayoutSeries(visibleSeries, drawOptions);
            delta = (layout.radiusOuter - layout.radiusInner - _consts.pieSeriesSpacing * (lengthVisibleSeries - 1)) / lengthVisibleSeries;
            innerRad = layout.radiusInner;
            that._setCenter({
                x: layout.centerX,
                y: layout.centerY
            });
            visibleSeries.forEach(function(singleSeries) {
                singleSeries.correctRadius({
                    radiusInner: innerRad,
                    radiusOuter: innerRad + delta
                });
                innerRad += delta + _consts.pieSeriesSpacing
            })
        }
    },
    _renderSeries: function(drawOptions, isRotated, isLegendInside) {
        this._calculateSeriesLayout(drawOptions, isRotated);
        if (!drawOptions.sizeGroupLayout && this.getSizeGroup()) {
            pieSizeEqualizer.queue(this);
            this._clearCanvas();
            return
        }
        this._renderSeriesElements(drawOptions, isRotated, isLegendInside)
    },
    _getLegendCallBack: function() {
        var that = this,
            legend = this._legend,
            items = this._getLegendTargets().map(function(i) {
                return i.legendData
            });
        return function(target) {
            items.forEach(function(data) {
                var points = [],
                    callback = legend.getActionCallback({
                        index: data.id
                    });
                that.series.forEach(function(series) {
                    var seriesPoints = series.getPointsByKeys(data.argument, data.argumentIndex);
                    points.push.apply(points, seriesPoints)
                });
                if (target && target.argument === data.argument && target.argumentIndex === data.argumentIndex) {
                    points.push(target)
                }
                callback(getLegendItemAction(points))
            })
        }
    },
    _locateLabels: function(resolveLabelOverlapping) {
        var iterationCount = 0;
        var labelsWereOverlapped = void 0;
        var wordWrapApplied = void 0;
        do {
            labelsWereOverlapped = this._resolveLabelOverlapping(resolveLabelOverlapping);
            wordWrapApplied = this._adjustSeriesLabels("shift" === resolveLabelOverlapping)
        } while ((labelsWereOverlapped || wordWrapApplied) && ++iterationCount < MAX_RESOLVE_ITERATION_COUNT)
    },
    _adjustSeriesLabels: function(moveLabelsFromCenter) {
        return this.series.reduce(function(r, s) {
            return s.adjustLabels(moveLabelsFromCenter) || r
        }, false)
    },
    _prepareStackPoints: _common.noop,
    _resetStackPoints: _common.noop,
    _applyExtraSettings: _common.noop,
    _resolveLabelOverlappingShift: function() {
        var that = this,
            inverseDirection = "anticlockwise" === that.option("segmentsDirection"),
            seriesByPosition = that.series.reduce(function(r, s) {
                (r[s.getOptions().label.position] || r.outside).push(s);
                return r
            }, {
                inside: [],
                columns: [],
                outside: []
            }),
            labelsOverlapped = false;
        if (seriesByPosition.inside.length > 0) {
            labelsOverlapped = resolve(seriesByPosition.inside.reduce(function(r, singleSeries) {
                return singleSeries.getVisiblePoints().reduce(function(r, point) {
                    r.left.push(point);
                    return r
                }, r)
            }, {
                left: [],
                right: []
            }), shiftInColumnFunction) || labelsOverlapped
        }
        labelsOverlapped = seriesByPosition.columns.reduce(function(r, singleSeries) {
            return resolve(dividePoints(singleSeries), shiftInColumnFunction) || r
        }, labelsOverlapped);
        if (seriesByPosition.outside.length > 0) {
            labelsOverlapped = resolve(seriesByPosition.outside.reduce(function(r, singleSeries) {
                return dividePoints(singleSeries, r)
            }, null), shiftFunction) || labelsOverlapped
        }
        return labelsOverlapped;

        function dividePoints(series, points) {
            return series.getVisiblePoints().reduce(function(r, point) {
                var angle = (0, _utils.normalizeAngle)(point.middleAngle);
                (angle <= 90 || angle >= 270 ? r.right : r.left).push(point);
                return r
            }, points || {
                left: [],
                right: []
            })
        }

        function resolve(points, shiftCallback) {
            var overlapped = false;
            if (inverseDirection) {
                points.left.reverse();
                points.right.reverse()
            }
            overlapped = _base_chart.overlapping.resolveLabelOverlappingInOneDirection(points.left, that._canvas, false, shiftCallback);
            return _base_chart.overlapping.resolveLabelOverlappingInOneDirection(points.right, that._canvas, false, shiftCallback) || overlapped
        }

        function shiftFunction(box, length) {
            return (0, _utils.getVerticallyShiftedAngularCoords)(box, -length, that._center)
        }

        function shiftInColumnFunction(box, length) {
            return {
                x: box.x,
                y: box.y - length
            }
        }
    },
    _setCenter: function(center) {
        this._center = center
    },
    _disposeSeries: function(seriesIndex) {
        this.callBase.apply(this, arguments);
        this._abstractSeries = null
    },
    _legendDataField: "point",
    _legendItemTextField: "argument",
    _applyPointMarkersAutoHiding: _common.noop,
    _renderTrackers: _common.noop,
    _trackerType: "PieTracker",
    _createScrollBar: _common.noop,
    _updateAxesLayout: _common.noop,
    _applyClipRects: _common.noop,
    _appendAdditionalSeriesGroups: _common.noop,
    _prepareToRender: _common.noop,
    _isLegendInside: _common.noop,
    _renderAxes: _common.noop,
    _shrinkAxes: _common.noop,
    _isRotated: _common.noop,
    _seriesPopulatedHandlerCore: _common.noop,
    _reinitAxes: _common.noop,
    _correctAxes: _common.noop,
    _getExtraOptions: function() {
        var that = this;
        return {
            startAngle: that.option("startAngle"),
            innerRadius: that.option("innerRadius"),
            segmentsDirection: that.option("segmentsDirection"),
            type: that.option("type")
        }
    },
    getSizeGroup: function() {
        return this._themeManager.getOptions("sizeGroup")
    },
    getSizeGroupLayout: function() {
        return this._sizeGroupLayout || {}
    }
});
(0, _iterator.each)(OPTIONS_FOR_REFRESH_SERIES, function(_, name) {
    dxPieChart.prototype._optionChangesMap[name] = "REFRESH_SERIES_DATA_INIT"
});
(0, _component_registrator2.default)("dxPieChart", dxPieChart);
module.exports = dxPieChart;
var pieSizeEqualizer = function() {
    function equalize(group, allPies) {
        var pies = allPies.filter(function(p) {
                return p._isVisible() && p.getSizeGroup() === group
            }),
            minRadius = Math.min.apply(null, pies.map(function(p) {
                return p.getSizeGroupLayout().radius
            })),
            minPie = pies.filter(function(p) {
                return p.getSizeGroupLayout().radius === minRadius
            });
        pies.forEach(function(p) {
            return p.render({
                force: true,
                sizeGroupLayout: minPie.length ? minPie[0].getSizeGroupLayout() : {}
            })
        })
    }

    function removeFromList(list, item) {
        return list.filter(function(li) {
            return li !== item
        })
    }

    function addToList(list, item) {
        return removeFromList(list, item).concat(item)
    }
    var pies = [],
        timers = {};
    return {
        queue: function(pie) {
            var group = pie.getSizeGroup();
            pies = addToList(pies, pie);
            clearTimeout(timers[group]);
            timers[group] = setTimeout(function() {
                equalize(group, pies)
            })
        },
        remove: function(pie) {
            pies = removeFromList(pies, pie);
            if (!pies.length) {
                timers = {}
            }
        }
    }
}();
module.exports.default = module.exports;
