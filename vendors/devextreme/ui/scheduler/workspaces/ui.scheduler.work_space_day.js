/**
 * DevExtreme (ui/scheduler/workspaces/ui.scheduler.work_space_day.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var registerComponent = require("../../../core/component_registrator"),
    SchedulerWorkSpace = require("./ui.scheduler.work_space.indicator");
var DAY_CLASS = "dx-scheduler-work-space-day";
var SchedulerWorkSpaceDay = SchedulerWorkSpace.inherit({
    _getElementClass: function() {
        return DAY_CLASS
    },
    _getRowCount: function() {
        return this._getCellCountInDay()
    },
    _getCellCount: function() {
        return this.option("intervalCount")
    },
    _setFirstViewDate: function() {
        this._firstViewDate = this._getViewStartByOptions();
        this._setStartDayHour(this._firstViewDate)
    },
    _getDateByIndex: function(headerIndex) {
        if (1 === this.option("intervalCount")) {
            return this._firstViewDate
        }
        var resultDate = new Date(this._firstViewDate);
        resultDate.setDate(this._firstViewDate.getDate() + headerIndex);
        return resultDate
    },
    _getFormat: function() {
        return this._formatWeekdayAndDay
    },
    _renderDateHeader: function() {
        if (1 === this.option("intervalCount")) {
            return
        }
        return this.callBase()
    },
    _getRightCell: function(isMultiSelection) {
        if (!isMultiSelection) {
            return this.callBase(isMultiSelection)
        }
        return this._$focusedCell
    },
    _getLeftCell: function(isMultiSelection) {
        if (!isMultiSelection) {
            return this.callBase(isMultiSelection)
        }
        return this._$focusedCell
    }
});
registerComponent("dxSchedulerWorkSpaceDay", SchedulerWorkSpaceDay);
module.exports = SchedulerWorkSpaceDay;
