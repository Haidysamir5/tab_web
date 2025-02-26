/**
 * DevExtreme (ui/data_grid/ui.data_grid.columns_controller.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiData_grid = require("./ui.data_grid.core");
var _uiData_grid2 = _interopRequireDefault(_uiData_grid);
var _uiGrid_core = require("../grid_core/ui.grid_core.columns_controller");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _extend = require("../../core/utils/extend");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
_uiData_grid2.default.registerModule("columns", {
    defaultOptions: function() {
        return (0, _extend.extend)(true, {}, _uiGrid_core2.default.defaultOptions(), {
            commonColumnSettings: {
                allowExporting: true
            }
        })
    },
    controllers: _uiGrid_core2.default.controllers
});
