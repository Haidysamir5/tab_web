/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.data_area.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _uiPivot_grid = require("./ui.pivot_grid.area_item");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var PIVOTGRID_AREA_CLASS = "dx-pivotgrid-area",
    PIVOTGRID_AREA_DATA_CLASS = "dx-pivotgrid-area-data",
    PIVOTGRID_TOTAL_CLASS = "dx-total",
    PIVOTGRID_GRAND_TOTAL_CLASS = "dx-grandtotal",
    PIVOTGRID_ROW_TOTAL_CLASS = "dx-row-total";
exports.DataArea = _uiPivot_grid.AreaItem.inherit({
    _getAreaName: function() {
        return "data"
    },
    _createGroupElement: function() {
        return (0, _renderer2.default)("<div>").addClass(PIVOTGRID_AREA_CLASS).addClass(PIVOTGRID_AREA_DATA_CLASS)
    },
    _applyCustomStyles: function(options) {
        var cell = options.cell,
            classArray = options.classArray;
        if ("T" === cell.rowType || "T" === cell.columnType) {
            classArray.push(PIVOTGRID_TOTAL_CLASS)
        }
        if ("GT" === cell.rowType || "GT" === cell.columnType) {
            classArray.push(PIVOTGRID_GRAND_TOTAL_CLASS)
        }
        if ("T" === cell.rowType || "GT" === cell.rowType) {
            classArray.push(PIVOTGRID_ROW_TOTAL_CLASS)
        }
        if (options.rowIndex === options.rowsCount - 1) {
            options.cssArray.push("border-bottom: 0px")
        }
        this.callBase(options)
    },
    _moveFakeTable: function(scrollPos) {
        this._moveFakeTableHorizontally(scrollPos.x);
        this._moveFakeTableTop(scrollPos.y);
        this.callBase()
    },
    processScroll: function(useNativeScrolling, horizontalScroll, verticalScroll) {
        var direction = "both";
        if (horizontalScroll && !verticalScroll) {
            direction = "horizontal"
        } else {
            if (!horizontalScroll && verticalScroll) {
                direction = "vertical"
            }
        }
        this._groupElement.css("borderTopWidth", 0).dxScrollable({
            useNative: !!useNativeScrolling,
            useSimulatedScrollbar: !useNativeScrolling,
            direction: direction,
            bounceEnabled: false,
            updateManually: true
        })
    },
    reset: function() {
        this.callBase();
        if (this._virtualContent) {
            this._virtualContent.parent().css("height", "auto")
        }
    },
    setVirtualContentParams: function(params) {
        this.callBase(params);
        this._virtualContent.parent().css("height", params.height);
        this._setTableCss({
            top: params.top,
            left: params.left
        })
    }
});
