/**
 * DevExtreme (ui/tree_list/ui.tree_list.keyboard_navigation.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _uiGrid_core = require("../grid_core/ui.grid_core.keyboard_navigation");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _extend = require("../../core/utils/extend");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
_uiTree_list2.default.registerModule("keyboardNavigation", (0, _extend.extend)(true, {}, _uiGrid_core2.default, {
    extenders: {
        controllers: {
            keyboardNavigation: {
                _leftRightKeysHandler: function(eventArgs, isEditing) {
                    var key, directionCode, rowIndex = this.getVisibleRowIndex(),
                        dataController = this._dataController;
                    if (eventArgs.ctrl) {
                        directionCode = this._getDirectionCodeByKey(eventArgs.keyName);
                        key = dataController.getKeyByRowIndex(rowIndex);
                        if ("nextInRow" === directionCode) {
                            dataController.expandRow(key)
                        } else {
                            dataController.collapseRow(key)
                        }
                    } else {
                        return this.callBase.apply(this, arguments)
                    }
                }
            }
        }
    }
}));
