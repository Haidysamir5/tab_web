/**
 * DevExtreme (ui/scheduler/rendering_strategies/ui.scheduler.appointments.strategy.agenda.js)
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
var _date = require("../../../core/utils/date");
var _date2 = _interopRequireDefault(_date);
var _iterator = require("../../../core/utils/iterator");
var _array = require("../../../core/utils/array");
var _array2 = _interopRequireDefault(_array);
var _uiSchedulerAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.base");
var _uiSchedulerAppointmentsStrategy2 = _interopRequireDefault(_uiSchedulerAppointmentsStrategy);

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
var AgendaRenderingStrategy = function(_BaseAppointmentsStra) {
    _inherits(AgendaRenderingStrategy, _BaseAppointmentsStra);

    function AgendaRenderingStrategy() {
        _classCallCheck(this, AgendaRenderingStrategy);
        return _possibleConstructorReturn(this, (AgendaRenderingStrategy.__proto__ || Object.getPrototypeOf(AgendaRenderingStrategy)).apply(this, arguments))
    }
    _createClass(AgendaRenderingStrategy, [{
        key: "getAppointmentMinSize",
        value: function() {}
    }, {
        key: "getDeltaTime",
        value: function() {}
    }, {
        key: "keepAppointmentSettings",
        value: function() {
            return true
        }
    }, {
        key: "getAppointmentGeometry",
        value: function(geometry) {
            return geometry
        }
    }, {
        key: "createTaskPositionMap",
        value: function(appointments) {
            if (appointments.length) {
                var height = this.instance.fire("getAgendaVerticalStepHeight"),
                    appointmentsByResources = this.instance.fire("groupAppointmentsByResources", appointments),
                    groupedAppts = [];
                (0, _iterator.each)(appointmentsByResources, function(i, appts) {
                    var additionalAppointments = [],
                        recurrentIndexes = [];
                    (0, _iterator.each)(appts, function(index, appointment) {
                        var recurrenceBatch = this.instance.getAppointmentsInstance()._processRecurrenceAppointment(appointment, index),
                            appointmentBatch = null;
                        if (!recurrenceBatch.indexes.length) {
                            appointmentBatch = {
                                parts: []
                            };
                            appointmentBatch = this.instance.getAppointmentsInstance()._processLongAppointment(appointment);
                            additionalAppointments = additionalAppointments.concat(appointmentBatch.parts)
                        }
                        additionalAppointments = additionalAppointments.concat(recurrenceBatch.parts);
                        recurrentIndexes = recurrentIndexes.concat(recurrenceBatch.indexes)
                    }.bind(this));
                    this.instance.getAppointmentsInstance()._reduceRecurrenceAppointments(recurrentIndexes, appts);
                    this.instance.getAppointmentsInstance()._combineAppointments(appts, additionalAppointments);
                    groupedAppts = groupedAppts.concat(appts)
                }.bind(this));
                Array.prototype.splice.apply(appointments, [0, appointments.length].concat(groupedAppts))
            }
            var result = [],
                sortedIndex = 0;
            appointments.forEach(function(appt, index) {
                result.push([{
                    height: height,
                    width: "100%",
                    sortedIndex: sortedIndex++,
                    groupIndex: this._calculateGroupIndex(index, appointmentsByResources)
                }])
            }.bind(this));
            return result
        }
    }, {
        key: "_calculateGroupIndex",
        value: function(apptIndex, appointmentsByResources) {
            var resultInd, counter = 0;
            for (var i in appointmentsByResources) {
                var countApptInGroup = appointmentsByResources[i].length;
                if (apptIndex >= counter && apptIndex < counter + countApptInGroup) {
                    resultInd = Number(i);
                    break
                }
                counter += countApptInGroup
            }
            return resultInd
        }
    }, {
        key: "_getDeltaWidth",
        value: function() {}
    }, {
        key: "_correctRtlCoordinatesParts",
        value: function() {}
    }, {
        key: "_getAppointmentMaxWidth",
        value: function() {
            return this.getDefaultCellWidth()
        }
    }, {
        key: "_needVerifyItemSize",
        value: function() {
            return false
        }
    }, {
        key: "_isRtl",
        value: function() {
            return this.instance.option("rtlEnabled")
        }
    }, {
        key: "_getAppointmentParts",
        value: function() {}
    }, {
        key: "_reduceMultiWeekAppointment",
        value: function() {}
    }, {
        key: "calculateAppointmentHeight",
        value: function() {
            return 0
        }
    }, {
        key: "calculateAppointmentWidth",
        value: function() {
            return 0
        }
    }, {
        key: "isAppointmentGreaterThan",
        value: function() {}
    }, {
        key: "isAllDay",
        value: function() {
            return false
        }
    }, {
        key: "_sortCondition",
        value: function() {}
    }, {
        key: "_rowCondition",
        value: function() {}
    }, {
        key: "_columnCondition",
        value: function() {}
    }, {
        key: "_findIndexByKey",
        value: function() {}
    }, {
        key: "_getMaxNeighborAppointmentCount",
        value: function() {}
    }, {
        key: "_markAppointmentAsVirtual",
        value: function() {}
    }, {
        key: "getDropDownAppointmentWidth",
        value: function() {}
    }, {
        key: "getDefaultCellWidth",
        value: function() {
            return this._defaultWidth
        }
    }, {
        key: "getCompactAppointmentDefaultWidth",
        value: function() {}
    }, {
        key: "getCompactAppointmentLeftOffset",
        value: function() {}
    }, {
        key: "getCompactAppointmentTopOffset",
        value: function() {}
    }, {
        key: "calculateRows",
        value: function(appointments, agendaDuration, currentDate, needClearSettings) {
            this._rows = [];
            var appts = {
                indexes: [],
                parts: []
            };
            var groupedAppointments = this.instance.fire("groupAppointmentsByResources", appointments);
            currentDate = _date2.default.trimTime(new Date(currentDate));
            (0, _iterator.each)(groupedAppointments, function(groupIndex, currentAppointments) {
                var groupResult = [];
                if (!currentAppointments.length) {
                    this._rows.push([]);
                    return true
                }(0, _iterator.each)(currentAppointments, function(index, appointment) {
                    var startDate = this.instance.fire("getField", "startDate", appointment),
                        endDate = this.instance.fire("getField", "endDate", appointment);
                    this.instance.fire("fixWrongEndDate", appointment, startDate, endDate);
                    needClearSettings && delete appointment.settings;
                    var result = this.instance.getAppointmentsInstance()._processRecurrenceAppointment(appointment, index, false);
                    appts.parts = appts.parts.concat(result.parts);
                    appts.indexes = appts.indexes.concat(result.indexes)
                }.bind(this));
                this.instance.getAppointmentsInstance()._reduceRecurrenceAppointments(appts.indexes, currentAppointments);
                _array2.default.merge(currentAppointments, appts.parts);
                var appointmentCount = currentAppointments.length;
                for (var i = 0; i < agendaDuration; i++) {
                    var day = new Date(currentDate);
                    day.setMilliseconds(day.getMilliseconds() + 864e5 * i);
                    if (void 0 === groupResult[i]) {
                        groupResult[i] = 0
                    }
                    for (var j = 0; j < appointmentCount; j++) {
                        var appointmentData = currentAppointments[j].settings || currentAppointments[j],
                            appointmentIsLong = this.instance.fire("appointmentTakesSeveralDays", currentAppointments[j]),
                            appointmentIsRecurrence = this.instance.fire("getField", "recurrenceRule", currentAppointments[j]);
                        if (this.instance.fire("dayHasAppointment", day, appointmentData, true) || !appointmentIsRecurrence && appointmentIsLong && this.instance.fire("dayHasAppointment", day, currentAppointments[j], true)) {
                            groupResult[i] += 1
                        }
                    }
                }
                this._rows.push(groupResult)
            }.bind(this));
            return this._rows
        }
    }, {
        key: "_iterateRow",
        value: function(row, obj, index) {
            for (var i = 0; i < row.length; i++) {
                obj.counter = obj.counter + row[i];
                if (obj.counter >= index) {
                    obj.indexInRow = i;
                    break
                }
            }
        }
    }, {
        key: "getDateByIndex",
        value: function(index, rows, startViewDate) {
            var obj = {
                counter: 0,
                indexInRow: 0
            };
            index++;
            for (var i = 0; i < rows.length; i++) {
                this._iterateRow(rows[i], obj, index);
                if (obj.indexInRow) {
                    break
                }
            }
            return new Date(new Date(startViewDate).setDate(startViewDate.getDate() + obj.indexInRow))
        }
    }, {
        key: "getAppointmentDataCalculator",
        value: function() {
            return function($appointment, originalStartDate) {
                var apptIndex = $appointment.index(),
                    startViewDate = this.instance.getStartViewDate(),
                    calculatedStartDate = this.getDateByIndex(apptIndex, this._rows, startViewDate),
                    wrappedOriginalStartDate = new Date(originalStartDate);
                return {
                    startDate: new Date(calculatedStartDate.setHours(wrappedOriginalStartDate.getHours(), wrappedOriginalStartDate.getMinutes(), wrappedOriginalStartDate.getSeconds(), wrappedOriginalStartDate.getMilliseconds()))
                }
            }.bind(this)
        }
    }]);
    return AgendaRenderingStrategy
}(_uiSchedulerAppointmentsStrategy2.default);
module.exports = AgendaRenderingStrategy;
