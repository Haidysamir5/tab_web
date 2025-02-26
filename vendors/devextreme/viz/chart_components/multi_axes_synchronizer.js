/**
 * DevExtreme (viz/chart_components/multi_axes_synchronizer.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _console = require("../../core/utils/console");
var _type = require("../../core/utils/type");
var _iterator = require("../../core/utils/iterator");
var _utils = require("../core/utils");
var _math2 = require("../../core/utils/math");
var _math = Math;
var _floor = _math.floor;
var _max = _math.max;
var _abs = _math.abs;

function getValueAxesPerPanes(valueAxes) {
    var result = {};
    valueAxes.forEach(function(axis) {
        var pane = axis.pane;
        if (!result[pane]) {
            result[pane] = []
        }
        result[pane].push(axis)
    });
    return result
}
var linearConverter = {
    transform: function(v, b) {
        return (0, _math2.adjust)((0, _utils.getLog)(v, b))
    },
    addInterval: function(v, i) {
        return (0, _math2.adjust)(v + i)
    },
    getInterval: function(base, tickInterval) {
        return tickInterval
    }
};
var logConverter = {
    transform: function(v, b) {
        return (0, _math2.adjust)((0, _utils.raiseTo)(v, b))
    },
    addInterval: function(v, i) {
        return (0, _math2.adjust)(v * i)
    },
    getInterval: function(base, tickInterval) {
        return _math.pow(base, tickInterval)
    }
};

function convertAxisInfo(axisInfo, converter) {
    if (!axisInfo.isLogarithmic) {
        return
    }
    var tick, interval, base = axisInfo.logarithmicBase,
        tickValues = axisInfo.tickValues,
        ticks = [];
    axisInfo.minValue = converter.transform(axisInfo.minValue, base);
    axisInfo.oldMinValue = converter.transform(axisInfo.oldMinValue, base);
    axisInfo.maxValue = converter.transform(axisInfo.maxValue, base);
    axisInfo.oldMaxValue = converter.transform(axisInfo.oldMaxValue, base);
    axisInfo.tickInterval = _math.round(axisInfo.tickInterval);
    if (axisInfo.tickInterval < 1) {
        axisInfo.tickInterval = 1
    }
    interval = converter.getInterval(base, axisInfo.tickInterval);
    tick = converter.transform(tickValues[0], base);
    while (ticks.length < tickValues.length) {
        ticks.push(tick);
        tick = converter.addInterval(tick, interval)
    }
    ticks.tickInterval = axisInfo.tickInterval;
    axisInfo.tickValues = ticks
}

function populateAxesInfo(axes) {
    return axes.reduce(function(result, axis) {
        var axisInfo, ticksValues = axis.getTicksValues(),
            majorTicks = ticksValues.majorTicksValues,
            options = axis.getOptions(),
            businessRange = axis.getTranslator().getBusinessRange(),
            visibleArea = axis.getVisibleArea(),
            tickInterval = axis._tickInterval,
            synchronizedValue = options.synchronizedValue;
        if (majorTicks && majorTicks.length > 0 && (0, _type.isNumeric)(majorTicks[0]) && "discrete" !== options.type && !businessRange.isEmpty() && !(businessRange.breaks && businessRange.breaks.length) && "zoom" !== axis.getViewport().action) {
            axis.applyMargins();
            var startValue = axis.getTranslator().from(visibleArea[0]);
            var endValue = axis.getTranslator().from(visibleArea[1]);
            var minValue = startValue < endValue ? startValue : endValue;
            var maxValue = startValue < endValue ? endValue : startValue;
            if (minValue === maxValue && (0, _type.isDefined)(synchronizedValue)) {
                tickInterval = _abs(majorTicks[0] - synchronizedValue) || 1;
                minValue = majorTicks[0] - tickInterval;
                maxValue = majorTicks[0] + tickInterval
            }
            axisInfo = {
                axis: axis,
                isLogarithmic: "logarithmic" === options.type,
                logarithmicBase: businessRange.base,
                tickValues: majorTicks,
                minorValues: ticksValues.minorTicksValues,
                minorTickInterval: axis._minorTickInterval,
                minValue: minValue,
                oldMinValue: minValue,
                maxValue: maxValue,
                oldMaxValue: maxValue,
                inverted: businessRange.invert,
                tickInterval: tickInterval,
                synchronizedValue: synchronizedValue
            };
            convertAxisInfo(axisInfo, linearConverter);
            result.push(axisInfo)
        }
        return result
    }, [])
}

function updateTickValues(axesInfo) {
    var maxTicksCount = axesInfo.reduce(function(max, axisInfo) {
        return _max(max, axisInfo.tickValues.length)
    }, 0);
    axesInfo.forEach(function(axisInfo) {
        var ticksMultiplier, ticksCount, additionalStartTicksCount = 0,
            synchronizedValue = axisInfo.synchronizedValue,
            tickValues = axisInfo.tickValues,
            tickInterval = axisInfo.tickInterval;
        if ((0, _type.isDefined)(synchronizedValue)) {
            axisInfo.baseTickValue = axisInfo.invertedBaseTickValue = synchronizedValue;
            axisInfo.tickValues = [axisInfo.baseTickValue]
        } else {
            if (tickValues.length > 1 && tickInterval) {
                ticksMultiplier = _floor((maxTicksCount + 1) / tickValues.length);
                ticksCount = ticksMultiplier > 1 ? _floor((maxTicksCount + 1) / ticksMultiplier) : maxTicksCount;
                additionalStartTicksCount = _floor((ticksCount - tickValues.length) / 2);
                while (additionalStartTicksCount > 0 && 0 !== tickValues[0]) {
                    tickValues.unshift((0, _math2.adjust)(tickValues[0] - tickInterval));
                    additionalStartTicksCount--
                }
                while (tickValues.length < ticksCount) {
                    tickValues.push((0, _math2.adjust)(tickValues[tickValues.length - 1] + tickInterval))
                }
                axisInfo.tickInterval = tickInterval / ticksMultiplier
            }
            axisInfo.baseTickValue = tickValues[0];
            axisInfo.invertedBaseTickValue = tickValues[tickValues.length - 1]
        }
    })
}

function getAxisRange(axisInfo) {
    return axisInfo.maxValue - axisInfo.minValue || 1
}

function getMainAxisInfo(axesInfo) {
    for (var i = 0; i < axesInfo.length; i++) {
        if (!axesInfo[i].stubData) {
            return axesInfo[i]
        }
    }
    return null
}

function correctMinMaxValues(axesInfo) {
    var mainAxisInfo = getMainAxisInfo(axesInfo),
        mainAxisInfoTickInterval = mainAxisInfo.tickInterval;
    axesInfo.forEach(function(axisInfo) {
        var scale, move, mainAxisBaseValueOffset, valueFromAxisInfo;
        if (axisInfo !== mainAxisInfo) {
            if (mainAxisInfoTickInterval && axisInfo.tickInterval) {
                if (axisInfo.stubData && (0, _type.isDefined)(axisInfo.synchronizedValue)) {
                    axisInfo.oldMinValue = axisInfo.minValue = axisInfo.baseTickValue - (mainAxisInfo.baseTickValue - mainAxisInfo.minValue) / mainAxisInfoTickInterval * axisInfo.tickInterval;
                    axisInfo.oldMaxValue = axisInfo.maxValue = axisInfo.baseTickValue - (mainAxisInfo.baseTickValue - mainAxisInfo.maxValue) / mainAxisInfoTickInterval * axisInfo.tickInterval
                }
                scale = mainAxisInfoTickInterval / getAxisRange(mainAxisInfo) / axisInfo.tickInterval * getAxisRange(axisInfo);
                axisInfo.maxValue = axisInfo.minValue + getAxisRange(axisInfo) / scale
            }
            if (mainAxisInfo.inverted && !axisInfo.inverted || !mainAxisInfo.inverted && axisInfo.inverted) {
                mainAxisBaseValueOffset = mainAxisInfo.maxValue - mainAxisInfo.invertedBaseTickValue
            } else {
                mainAxisBaseValueOffset = mainAxisInfo.baseTickValue - mainAxisInfo.minValue
            }
            valueFromAxisInfo = getAxisRange(axisInfo);
            move = (mainAxisBaseValueOffset / getAxisRange(mainAxisInfo) - (axisInfo.baseTickValue - axisInfo.minValue) / valueFromAxisInfo) * valueFromAxisInfo;
            axisInfo.minValue -= move;
            axisInfo.maxValue -= move
        }
    })
}

function calculatePaddings(axesInfo) {
    var minPadding, maxPadding, startPadding = 0,
        endPadding = 0;
    axesInfo.forEach(function(axisInfo) {
        var inverted = axisInfo.inverted;
        minPadding = axisInfo.minValue > axisInfo.oldMinValue ? (axisInfo.minValue - axisInfo.oldMinValue) / getAxisRange(axisInfo) : 0;
        maxPadding = axisInfo.maxValue < axisInfo.oldMaxValue ? (axisInfo.oldMaxValue - axisInfo.maxValue) / getAxisRange(axisInfo) : 0;
        startPadding = _max(startPadding, inverted ? maxPadding : minPadding);
        endPadding = _max(endPadding, inverted ? minPadding : maxPadding)
    });
    return {
        start: startPadding,
        end: endPadding
    }
}

function correctMinMaxValuesByPaddings(axesInfo, paddings) {
    axesInfo.forEach(function(info) {
        var range = getAxisRange(info),
            inverted = info.inverted;
        info.minValue = (0, _math2.adjust)(info.minValue - paddings[inverted ? "end" : "start"] * range);
        info.maxValue = (0, _math2.adjust)(info.maxValue + paddings[inverted ? "start" : "end"] * range)
    })
}

function updateTickValuesIfSynchronizedValueUsed(axesInfo) {
    var hasSynchronizedValue = false;
    axesInfo.forEach(function(info) {
        hasSynchronizedValue = hasSynchronizedValue || (0, _type.isDefined)(info.synchronizedValue)
    });
    axesInfo.forEach(function(info) {
        var tick, tickInterval = info.tickInterval,
            tickValues = info.tickValues,
            maxValue = info.maxValue,
            minValue = info.minValue;
        if (hasSynchronizedValue && tickInterval) {
            while ((tick = (0, _math2.adjust)(tickValues[0] - tickInterval)) >= minValue) {
                tickValues.unshift(tick)
            }
            tick = tickValues[tickValues.length - 1];
            while ((tick = (0, _math2.adjust)(tick + tickInterval)) <= maxValue) {
                tickValues.push(tick)
            }
        }
        while (tickValues[0] + tickInterval / 10 < minValue) {
            tickValues.shift()
        }
        while (tickValues[tickValues.length - 1] - tickInterval / 10 > maxValue) {
            tickValues.pop()
        }
    })
}

function applyMinMaxValues(axesInfo) {
    axesInfo.forEach(function(info) {
        var axis = info.axis,
            range = axis.getTranslator().getBusinessRange();
        if (range.min === range.minVisible) {
            range.min = info.minValue
        }
        if (range.max === range.maxVisible) {
            range.max = info.maxValue
        }
        range.minVisible = info.minValue;
        range.maxVisible = info.maxValue;
        if (range.min > range.minVisible) {
            range.min = range.minVisible
        }
        if (range.max < range.maxVisible) {
            range.max = range.maxVisible
        }
        axis.getTranslator().updateBusinessRange(range);
        axis.setTicks({
            majorTicks: info.tickValues,
            minorTicks: info.minorValues
        })
    })
}

function correctAfterSynchronize(axesInfo) {
    var correctValue, invalidAxisInfo = [];
    axesInfo.forEach(function(info) {
        if (info.oldMaxValue - info.oldMinValue === 0) {
            invalidAxisInfo.push(info)
        } else {
            if (!(0, _type.isDefined)(correctValue) && !(0, _type.isDefined)(info.synchronizedValue)) {
                correctValue = _abs((info.maxValue - info.minValue) / (info.tickValues[_floor(info.tickValues.length / 2)] - info.minValue || info.maxValue))
            }
        }
    });
    if (!(0, _type.isDefined)(correctValue)) {
        return
    }
    invalidAxisInfo.forEach(function(info) {
        var firstTick = info.tickValues[0],
            correctedTick = firstTick * correctValue;
        if (firstTick > 0) {
            info.maxValue = correctedTick;
            info.minValue = 0
        } else {
            if (firstTick < 0) {
                info.minValue = correctedTick;
                info.maxValue = 0
            }
        }
    })
}

function updateMinorTicks(axesInfo) {
    axesInfo.forEach(function(axisInfo) {
        if (!axisInfo.minorTickInterval) {
            return
        }
        var ticks = [];
        var interval = axisInfo.minorTickInterval,
            tickCount = axisInfo.tickInterval / interval - 1;
        for (var i = 1; i < axisInfo.tickValues.length; i++) {
            var tick = axisInfo.tickValues[i - 1];
            for (var j = 0; j < tickCount; j++) {
                tick += interval;
                ticks.push(tick)
            }
        }
        axisInfo.minorValues = ticks
    })
}
var multiAxesSynchronizer = {
    synchronize: function(valueAxes) {
        (0, _iterator.each)(getValueAxesPerPanes(valueAxes), function(_, axes) {
            var axesInfo, paddings;
            if (axes.length > 1) {
                axesInfo = populateAxesInfo(axes);
                if (axesInfo.length < 2 || !getMainAxisInfo(axesInfo)) {
                    return
                }
                updateTickValues(axesInfo);
                correctMinMaxValues(axesInfo);
                paddings = calculatePaddings(axesInfo);
                correctMinMaxValuesByPaddings(axesInfo, paddings);
                correctAfterSynchronize(axesInfo);
                updateTickValuesIfSynchronizedValueUsed(axesInfo);
                updateMinorTicks(axesInfo);
                axesInfo.forEach(function(info) {
                    convertAxisInfo(info, logConverter)
                });
                applyMinMaxValues(axesInfo)
            }
        })
    }
};
module.exports = multiAxesSynchronizer;
