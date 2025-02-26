/**
 * DevExtreme (ui/tree_list/ui.tree_list.editing.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
require("./ui.tree_list.editor_factory");
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _deferred = require("../../core/utils/deferred");
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _uiGrid_core = require("../grid_core/ui.grid_core.utils");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _uiGrid_core3 = require("../grid_core/ui.grid_core.editing");
var _uiGrid_core4 = _interopRequireDefault(_uiGrid_core3);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var TREELIST_EXPAND_ICON_CONTAINER_CLASS = "dx-treelist-icon-container",
    SELECT_CHECKBOX_CLASS = "dx-select-checkbox",
    DATA_EDIT_DATA_INSERT_TYPE = "insert";
var EditingController = _uiGrid_core4.default.controllers.editing.inherit(function() {
    return {
        _generateNewItem: function(key) {
            var item = this.callBase(key);
            item.data = {
                key: key
            };
            item.children = [];
            item.level = 0;
            item.parentKey = this.option("rootValue");
            return item
        },
        _needInsertItem: function(editData, changeType, items, item) {
            var parentKey = editData.key.parentKey;
            if (void 0 !== parentKey && parentKey !== this.option("rootValue")) {
                var rowIndex = _uiGrid_core2.default.getIndexByKey(parentKey, items);
                if (rowIndex >= 0 && this._dataController.isRowExpanded(parentKey)) {
                    items.splice(rowIndex + 1, 0, item)
                }
                return false
            }
            return this.callBase.apply(this, arguments)
        },
        _isEditColumnVisible: function() {
            var result = this.callBase.apply(this, arguments),
                editingOptions = this.option("editing");
            return result || editingOptions && editingOptions.allowAdding
        },
        _isDefaultButtonVisible: function(button, options) {
            var result = this.callBase.apply(this, arguments),
                row = options.row;
            if ("add" === button.name) {
                return this.allowAdding(options) && row.rowIndex !== this._getVisibleEditRowIndex() && !(row.removed || row.inserted)
            }
            return result
        },
        _getEditingButtons: function(options) {
            var buttons = this.callBase.apply(this, arguments);
            if (!options.column.buttons) {
                buttons.unshift(this._getButtonConfig("add", options))
            }
            return buttons
        },
        _beforeSaveEditData: function(editData) {
            var key, store, dataController = this._dataController,
                result = this.callBase.apply(this, arguments);
            if (editData && editData.type !== DATA_EDIT_DATA_INSERT_TYPE) {
                store = dataController && dataController.store();
                key = store && store.key();
                if (!(0, _type.isDefined)(key)) {
                    throw _ui2.default.Error("E1045")
                }
            }
            return result
        },
        addRowByRowIndex: function(rowIndex) {
            var dataController = this.getController("data"),
                row = dataController.getVisibleRows()[rowIndex];
            return this.addRow(row ? row.key : void 0)
        },
        addRow: function(key) {
            var that = this,
                callBase = this.callBase,
                dataController = this.getController("data");
            if (void 0 !== key && !dataController.isRowExpanded(key)) {
                var d = new _deferred.Deferred;
                dataController.expandRow(key).done(function() {
                    setTimeout(function() {
                        callBase.call(that, key);
                        d.resolve()
                    })
                }).fail(d.reject);
                return d
            }
            callBase.call(that, key)
        },
        _initNewRow: function(options, insertKey) {
            var parentKey = insertKey.parentKey,
                dataController = this.getController("data"),
                dataSourceAdapter = dataController.dataSource(),
                parentIdSetter = dataSourceAdapter.createParentIdSetter();
            if (void 0 === parentKey) {
                parentKey = this.option("rootValue");
                insertKey.parentKey = parentKey
            }
            parentIdSetter(options.data, parentKey);
            this.callBase.apply(this, arguments)
        },
        allowAdding: function(options) {
            return this._allowEditAction("allowAdding", options)
        },
        _needToCloseEditableCell: function($targetElement) {
            return this.callBase.apply(this, arguments) || $targetElement.closest("." + TREELIST_EXPAND_ICON_CONTAINER_CLASS).length && this.isEditing()
        },
        getButtonLocalizationNames: function() {
            var names = this.callBase.apply(this);
            names.add = "dxTreeList-editingAddRowToNode";
            return names
        }
    }
}());
var originalRowClick = _uiGrid_core4.default.extenders.views.rowsView._rowClick,
    originalRowDblClick = _uiGrid_core4.default.extenders.views.rowsView._rowDblClick;
var validateClick = function(e) {
    var $targetElement = (0, _renderer2.default)(e.event.target),
        originalClickHandler = "dxdblclick" === e.event.type ? originalRowDblClick : originalRowClick;
    if ($targetElement.closest("." + SELECT_CHECKBOX_CLASS).length) {
        return false
    }
    return !needToCallOriginalClickHandler.call(this, e, originalClickHandler)
};
var needToCallOriginalClickHandler = function(e, originalClickHandler) {
    var $targetElement = (0, _renderer2.default)(e.event.target);
    if (!$targetElement.closest("." + TREELIST_EXPAND_ICON_CONTAINER_CLASS).length) {
        originalClickHandler.call(this, e);
        return true
    }
    return false
};
var RowsViewExtender = (0, _extend.extend)({}, _uiGrid_core4.default.extenders.views.rowsView, {
    _renderCellCommandContent: function($container, options) {
        var editingController = this._editingController,
            isEditRow = options.row && editingController.isEditRow(options.row.rowIndex),
            isEditing = options.isEditing || isEditRow;
        if (!isEditing) {
            return this.callBase.apply(this, arguments)
        }
        return false
    },
    _rowClick: function(e) {
        if (validateClick.call(this, e)) {
            this.callBase.apply(this, arguments)
        }
    },
    _rowDblClick: function(e) {
        if (validateClick.call(this, e)) {
            this.callBase.apply(this, arguments)
        }
    }
});
_uiTree_list2.default.registerModule("editing", {
    defaultOptions: function() {
        return (0, _extend.extend)(true, _uiGrid_core4.default.defaultOptions(), {
            editing: {
                texts: {
                    addRowToNode: _message2.default.format("dxTreeList-editingAddRowToNode")
                }
            }
        })
    },
    controllers: {
        editing: EditingController
    },
    extenders: {
        controllers: (0, _extend.extend)(true, {}, _uiGrid_core4.default.extenders.controllers, {
            data: {
                changeRowExpand: function() {
                    this._editingController.refresh();
                    return this.callBase.apply(this, arguments)
                }
            }
        }),
        views: {
            rowsView: RowsViewExtender,
            headerPanel: _uiGrid_core4.default.extenders.views.headerPanel
        }
    }
});
