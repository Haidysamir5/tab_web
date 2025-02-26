/**
 * DevExtreme (ui/scheduler/rendering_strategies/ui.scheduler.appointments.strategy.horizontal_month_line.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
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
var _get = function get(object, property, receiver) {
    if (null === object) {
        object = Function.prototype
    }
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (void 0 === desc) {
        var parent = Object.getPrototypeOf(object);
        if (null === parent) {
            return
        } else {
            return get(parent, property, receiver)
        }
    } else {
        if ("value" in desc) {
            return desc.value
        } else {
            var getter = desc.get;
            if (void 0 === getter) {
                return
            }
            return getter.call(receiver)
        }
    }
};
var _uiSchedulerAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.horizontal");
var _uiSchedulerAppointmentsStrategy2 = _interopRequireDefault(_uiSchedulerAppointmentsStrategy);
var _date = require("../../../core/utils/date");
var _date2 = _interopRequireDefault(_date);
var _query = require("../../../data/query");
var _query2 = _interopRequireDefault(_query);

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

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && ("object" === typeof call || "function" === typeof call) ? call : self
}

function _inherits(subClass, superClass) {
    if ("function" !== typeof superClass && null !== superClass) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
    }
}
var HOURS_IN_DAY = 24,
    MINUTES_IN_HOUR = 60,
    MILLISECONDS_IN_MINUTE = 6e4;
var HorizontalMonthLineRenderingStrategy = function(_HorizontalAppointmen) {
    _inherits(HorizontalMonthLineRenderingStrategy, _HorizontalAppointmen);

    function HorizontalMonthLineRenderingStrategy() {
        _classCallCheck(this, HorizontalMonthLineRenderingStrategy);
        return _possibleConstructorReturn(this, (HorizontalMonthLineRenderingStrategy.__proto__ || Object.getPrototypeOf(HorizontalMonthLineRenderingStrategy)).apply(this, arguments))
    }
    _createClass(HorizontalMonthLineRenderingStrategy, [{
        key: "calculateAppointmentWidth",
        value: function(appointment, position, isRecurring) {
            var startDate = new Date(this.startDate(appointment, false, position)),
                endDate = new Date(this.endDate(appointment, position, isRecurring)),
                cellWidth = this.getDefaultCellWidth() || this.getAppointmentMinSize();
            startDate = _date2.default.trimTime(startDate);
            var width = Math.ceil(this._getDurationInHour(startDate, endDate) / HOURS_IN_DAY) * cellWidth;
            width = this.cropAppointmentWidth(width, cellWidth);
            return width
        }
    }, {
        key: "_getDurationInHour",
        value: function(startDate, endDate) {
            var adjustedDuration = this._adjustDurationByDaylightDiff(endDate.getTime() - startDate.getTime(), startDate, endDate);
            return adjustedDuration / _date2.default.dateToMilliseconds("hour")
        }
    }, {
        key: "getDeltaTime",
        value: function(args, initialSize) {
            return HOURS_IN_DAY * MINUTES_IN_HOUR * MILLISECONDS_IN_MINUTE * this._getDeltaWidth(args, initialSize)
        }
    }, {
        key: "isAllDay",
        value: function() {
            return false
        }
    }, {
        key: "createTaskPositionMap",
        value: function(items, skipSorting) {
            if (!skipSorting) {
                this.instance.getAppointmentsInstance()._sortAppointmentsByStartDate(items)
            }
            return _get(HorizontalMonthLineRenderingStrategy.prototype.__proto__ || Object.getPrototypeOf(HorizontalMonthLineRenderingStrategy.prototype), "createTaskPositionMap", this).call(this, items)
        }
    }, {
        key: "_getSortedPositions",
        value: function(map, skipSorting) {
            var result = _get(HorizontalMonthLineRenderingStrategy.prototype.__proto__ || Object.getPrototypeOf(HorizontalMonthLineRenderingStrategy.prototype), "_getSortedPositions", this).call(this, map);
            if (!skipSorting) {
                result = (0, _query2.default)(result).sortBy("top").thenBy("left").thenBy("cellPosition").thenBy("i").toArray()
            }
            return result
        }
    }, {
        key: "needCorrectAppointmentDates",
        value: function() {
            return false
        }
    }]);
    return HorizontalMonthLineRenderingStrategy
}(_uiSchedulerAppointmentsStrategy2.default);
module.exports = HorizontalMonthLineRenderingStrategy;
