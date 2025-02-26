/**
 * DevExtreme (ui/scheduler/workspaces/ui.scheduler.timeline_month.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var registerComponent = require("../../../core/component_registrator"),
    SchedulerTimeline = require("./ui.scheduler.timeline"),
    dateUtils = require("../../../core/utils/date");
var TIMELINE_CLASS = "dx-scheduler-timeline-month",
    DAY_IN_MILLISECONDS = 864e5;
var toMs = dateUtils.dateToMilliseconds;
var SchedulerTimelineMonth = SchedulerTimeline.inherit({
    _renderView: function() {
        this.callBase();
        this._updateScrollable()
    },
    _getElementClass: function() {
        return TIMELINE_CLASS
    },
    _getDateHeaderTemplate: function() {
        return this.option("dateCellTemplate")
    },
    _getHiddenInterval: function() {
        return 0
    },
    _getIndicationFirstViewDate: function() {
        return dateUtils.trimTime(new Date(this._firstViewDate))
    },
    getCellDuration: function() {
        return toMs("day")
    },
    calculateEndViewDate: function(dateOfLastViewCell) {
        return new Date(dateOfLastViewCell.getTime() + this._calculateDayDuration() * toMs("hour"))
    },
    _getCellCount: function() {
        var currentDate = this.option("currentDate"),
            cellCount = 0;
        if (this._isWorkSpaceWithCount()) {
            var intervalCount = this.option("intervalCount");
            for (var i = 1; i <= intervalCount; i++) {
                cellCount += new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 0).getDate()
            }
        } else {
            cellCount = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
        }
        return cellCount
    },
    _setFirstViewDate: function() {
        this._firstViewDate = dateUtils.getFirstMonthDate(this.option("currentDate"));
        this._setStartDayHour(this._firstViewDate)
    },
    _getFormat: function() {
        return this._formatWeekdayAndDay
    },
    _getDateByIndex: function(headerIndex) {
        var resultDate = new Date(this._firstViewDate);
        resultDate.setDate(this._firstViewDate.getDate() + headerIndex);
        return resultDate
    },
    _getInterval: function() {
        return DAY_IN_MILLISECONDS
    },
    _getIntervalBetween: function(currentDate) {
        var firstViewDate = this.getStartViewDate(),
            timeZoneOffset = dateUtils.getTimezonesDifference(firstViewDate, currentDate);
        return currentDate.getTime() - (firstViewDate.getTime() - 36e5 * this.option("startDayHour")) - timeZoneOffset
    },
    calculateEndDate: function(startDate) {
        var startDateCopy = new Date(startDate);
        return new Date(startDateCopy.setHours(this.option("endDayHour")))
    },
    _calculateHiddenInterval: function() {
        return 0
    },
    _getDateByCellIndexes: function(rowIndex, cellIndex) {
        var date = this.callBase(rowIndex, cellIndex);
        this._setStartDayHour(date);
        return date
    },
    needUpdateScrollPosition: function(hours, minutes, bounds, date) {
        return this._dateWithinBounds(bounds, date)
    },
    getPositionShift: function() {
        return {
            top: 0,
            left: 0,
            cellPosition: 0
        }
    }
});
registerComponent("dxSchedulerTimelineMonth", SchedulerTimelineMonth);
module.exports = SchedulerTimelineMonth;
