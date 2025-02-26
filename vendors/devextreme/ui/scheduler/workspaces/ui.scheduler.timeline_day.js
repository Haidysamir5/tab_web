/**
 * DevExtreme (ui/scheduler/workspaces/ui.scheduler.timeline_day.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var registerComponent = require("../../../core/component_registrator"),
    SchedulerTimeline = require("./ui.scheduler.timeline");
var TIMELINE_CLASS = "dx-scheduler-timeline-day";
var SchedulerTimelineDay = SchedulerTimeline.inherit({
    _getElementClass: function() {
        return TIMELINE_CLASS
    },
    _setFirstViewDate: function() {
        this._firstViewDate = this.option("currentDate");
        this._setStartDayHour(this._firstViewDate)
    },
    _needRenderWeekHeader: function() {
        return this._isWorkSpaceWithCount()
    }
});
registerComponent("dxSchedulerTimelineDay", SchedulerTimelineDay);
module.exports = SchedulerTimelineDay;
