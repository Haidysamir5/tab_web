/**
 * DevExtreme (ui/data_grid/ui.data_grid.data_controller.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiData_grid = require("./ui.data_grid.core");
var _uiData_grid2 = _interopRequireDefault(_uiData_grid);
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _uiData_grid3 = require("./ui.data_grid.data_source_adapter");
var _uiData_grid4 = _interopRequireDefault(_uiData_grid3);
var _uiGrid_core = require("../grid_core/ui.grid_core.data_controller");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
exports.DataController = _uiGrid_core2.default.controllers.data.inherit(function() {
    return {
        _getDataSourceAdapter: function() {
            return _uiData_grid4.default
        },
        _getSpecificDataSourceOption: function() {
            var dataSource = this.option("dataSource");
            if (dataSource && !Array.isArray(dataSource) && this.option("keyExpr")) {
                _ui2.default.log("W1011")
            }
            return this.callBase()
        }
    }
}());
_uiData_grid2.default.registerModule("data", {
    defaultOptions: _uiGrid_core2.default.defaultOptions,
    controllers: {
        data: exports.DataController
    }
});
