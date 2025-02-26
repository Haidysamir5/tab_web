/**
 * DevExtreme (ui/shared/filtering.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var typeUtils = require("../../core/utils/type"),
    inArray = require("../../core/utils/array").inArray,
    iteratorUtils = require("../../core/utils/iterator");
var DEFAULT_DATE_INTERVAL = ["year", "month", "day"],
    DEFAULT_DATETIME_INTERVAL = ["year", "month", "day", "hour", "minute"];
module.exports = function() {
    var getFilterSelector = function(column, target) {
        var selector = column.dataField || column.selector;
        if ("search" === target) {
            selector = column.displayField || column.calculateDisplayValue || selector
        }
        return selector
    };
    var isZeroTime = function(date) {
        return date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() < 1
    };
    var isDateType = function(dataType) {
        return "date" === dataType || "datetime" === dataType
    };
    var getDateValues = function(dateValue) {
        if (typeUtils.isDate(dateValue)) {
            return [dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds()]
        }
        return iteratorUtils.map(("" + dateValue).split("/"), function(value, index) {
            return 1 === index ? Number(value) - 1 : Number(value)
        })
    };
    var getFilterExpressionByRange = function(filterValue, target) {
        var endFilterValue, startFilterExpression, endFilterExpression, column = this,
            selector = getFilterSelector(column, target);
        if (Array.isArray(filterValue) && typeUtils.isDefined(filterValue[0]) && typeUtils.isDefined(filterValue[1])) {
            startFilterExpression = [selector, ">=", filterValue[0]];
            endFilterExpression = [selector, "<=", filterValue[1]];
            if (isDateType(column.dataType) && isZeroTime(filterValue[1])) {
                endFilterValue = new Date(filterValue[1].getTime());
                if ("date" === column.dataType) {
                    endFilterValue.setDate(filterValue[1].getDate() + 1)
                }
                endFilterExpression = [selector, "<", endFilterValue]
            }
            return [startFilterExpression, "and", endFilterExpression]
        }
    };
    var getFilterExpressionForDate = function(filterValue, selectedFilterOperation, target) {
        var dateStart, dateEnd, dateInterval, column = this,
            values = getDateValues(filterValue),
            selector = getFilterSelector(column, target);
        if ("headerFilter" === target) {
            dateInterval = module.exports.getGroupInterval(column)[values.length - 1]
        } else {
            if ("datetime" === column.dataType) {
                dateInterval = "minute"
            }
        }
        switch (dateInterval) {
            case "year":
                dateStart = new Date(values[0], 0, 1);
                dateEnd = new Date(values[0] + 1, 0, 1);
                break;
            case "month":
                dateStart = new Date(values[0], values[1], 1);
                dateEnd = new Date(values[0], values[1] + 1, 1);
                break;
            case "quarter":
                dateStart = new Date(values[0], 3 * values[1], 1);
                dateEnd = new Date(values[0], 3 * values[1] + 3, 1);
                break;
            case "hour":
                dateStart = new Date(values[0], values[1], values[2], values[3]);
                dateEnd = new Date(values[0], values[1], values[2], values[3] + 1);
                break;
            case "minute":
                dateStart = new Date(values[0], values[1], values[2], values[3], values[4]);
                dateEnd = new Date(values[0], values[1], values[2], values[3], values[4] + 1);
                break;
            case "second":
                dateStart = new Date(values[0], values[1], values[2], values[3], values[4], values[5]);
                dateEnd = new Date(values[0], values[1], values[2], values[3], values[4], values[5] + 1);
                break;
            default:
                dateStart = new Date(values[0], values[1], values[2]);
                dateEnd = new Date(values[0], values[1], values[2] + 1)
        }
        switch (selectedFilterOperation) {
            case "<":
                return [selector, "<", dateStart];
            case "<=":
                return [selector, "<", dateEnd];
            case ">":
                return [selector, ">=", dateEnd];
            case ">=":
                return [selector, ">=", dateStart];
            case "<>":
                return [
                    [selector, "<", dateStart], "or", [selector, ">=", dateEnd]
                ];
            default:
                return [
                    [selector, ">=", dateStart], "and", [selector, "<", dateEnd]
                ]
        }
    };
    var getFilterExpressionForNumber = function(filterValue, selectedFilterOperation, target) {
        var column = this,
            selector = getFilterSelector(column, target),
            groupInterval = module.exports.getGroupInterval(column);
        if ("headerFilter" === target && groupInterval && typeUtils.isDefined(filterValue)) {
            var interval, startFilterValue, endFilterValue, values = ("" + filterValue).split("/"),
                value = Number(values[values.length - 1]);
            interval = groupInterval[values.length - 1];
            startFilterValue = [selector, ">=", value];
            endFilterValue = [selector, "<", value + interval];
            var condition = [startFilterValue, "and", endFilterValue];
            return condition
        }
        return [selector, selectedFilterOperation || "=", filterValue]
    };
    return {
        defaultCalculateFilterExpression: function(filterValue, selectedFilterOperation, target) {
            var column = this,
                selector = getFilterSelector(column, target),
                isSearchByDisplayValue = column.calculateDisplayValue && "search" === target,
                dataType = isSearchByDisplayValue && column.lookup && column.lookup.dataType || column.dataType,
                filter = null;
            if (("headerFilter" === target || "filterBuilder" === target) && null === filterValue) {
                filter = [selector, selectedFilterOperation || "=", null];
                if ("string" === dataType) {
                    filter = [filter, "=" === selectedFilterOperation ? "or" : "and", [selector, selectedFilterOperation || "=", ""]]
                }
            } else {
                if ("string" === dataType && (!column.lookup || isSearchByDisplayValue)) {
                    filter = [selector, selectedFilterOperation || "contains", filterValue]
                } else {
                    if ("between" === selectedFilterOperation) {
                        return getFilterExpressionByRange.apply(column, [filterValue, target])
                    } else {
                        if (isDateType(dataType) && typeUtils.isDefined(filterValue)) {
                            return getFilterExpressionForDate.apply(column, arguments)
                        } else {
                            if ("number" === dataType) {
                                return getFilterExpressionForNumber.apply(column, arguments)
                            } else {
                                if ("object" !== dataType) {
                                    filter = [selector, selectedFilterOperation || "=", filterValue]
                                }
                            }
                        }
                    }
                }
            }
            return filter
        },
        getGroupInterval: function(column) {
            var index, result = [],
                dateIntervals = ["year", "month", "day", "hour", "minute", "second"],
                groupInterval = column.headerFilter && column.headerFilter.groupInterval,
                interval = "quarter" === groupInterval ? "month" : groupInterval;
            if (isDateType(column.dataType) && null !== groupInterval) {
                result = "datetime" === column.dataType ? DEFAULT_DATETIME_INTERVAL : DEFAULT_DATE_INTERVAL;
                index = inArray(interval, dateIntervals);
                if (index >= 0) {
                    result = dateIntervals.slice(0, index);
                    result.push(groupInterval);
                    return result
                }
                return result
            } else {
                if (typeUtils.isDefined(groupInterval)) {
                    return Array.isArray(groupInterval) ? groupInterval : [groupInterval]
                }
            }
        }
    }
}();
