/**
 * DevExtreme (ui/tree_list/ui.tree_list.data_controller.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../core/utils/extend");
var _deferred = require("../../core/utils/deferred");
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _common = require("../../core/utils/common");
var _uiTree_list3 = require("./ui.tree_list.data_source_adapter");
var _uiTree_list4 = _interopRequireDefault(_uiTree_list3);
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
            return _uiTree_list4.default
        },
        _getNodeLevel: function(node) {
            var level = -1;
            while (node.parent) {
                if (node.visible) {
                    level++
                }
                node = node.parent
            }
            return level
        },
        _generateDataItem: function(node, options) {
            return {
                rowType: "data",
                node: node,
                key: node.key,
                data: node.data,
                isExpanded: this.isRowExpanded(node.key, options),
                level: this._getNodeLevel(node)
            }
        },
        _loadOnOptionChange: function() {
            this._dataSource.load()
        },
        init: function() {
            this.createAction("onRowExpanding");
            this.createAction("onRowExpanded");
            this.createAction("onRowCollapsing");
            this.createAction("onRowCollapsed");
            this.callBase.apply(this, arguments)
        },
        keyOf: function(data) {
            var dataSource = this._dataSource;
            if (dataSource) {
                return dataSource.keyOf(data)
            }
        },
        key: function() {
            var dataSource = this._dataSource;
            if (dataSource) {
                return dataSource.getKeyExpr()
            }
        },
        publicMethods: function() {
            return this.callBase().concat(["expandRow", "collapseRow", "isRowExpanded", "getRootNode", "getNodeByKey", "loadDescendants", "forEachNode"])
        },
        changeRowExpand: function(key) {
            if (this._dataSource) {
                var that = this,
                    args = {
                        key: key
                    },
                    isExpanded = this.isRowExpanded(key);
                that.executeAction(isExpanded ? "onRowCollapsing" : "onRowExpanding", args);
                if (!args.cancel) {
                    return that._dataSource.changeRowExpand(key).done(function() {
                        that.executeAction(isExpanded ? "onRowCollapsed" : "onRowExpanded", args)
                    })
                }
            }
            return (new _deferred.Deferred).resolve()
        },
        isRowExpanded: function(key, cache) {
            return this._dataSource && this._dataSource.isRowExpanded(key, cache)
        },
        expandRow: function(key) {
            if (!this.isRowExpanded(key)) {
                return this.changeRowExpand(key)
            }
            return (new _deferred.Deferred).resolve()
        },
        collapseRow: function(key) {
            if (this.isRowExpanded(key)) {
                return this.changeRowExpand(key)
            }
            return (new _deferred.Deferred).resolve()
        },
        getRootNode: function() {
            return this._dataSource && this._dataSource.getRootNode()
        },
        optionChanged: function(args) {
            switch (args.name) {
                case "rootValue":
                case "parentIdExpr":
                case "itemsExpr":
                case "filterMode":
                case "expandNodesOnFiltering":
                case "autoExpandAll":
                case "hasItemsExpr":
                case "dataStructure":
                    this._columnsController.reset();
                    this._items = [];
                    this._refreshDataSource();
                    args.handled = true;
                    break;
                case "expandedRowKeys":
                case "onNodesInitialized":
                    if (this._dataSource && !this._dataSource._isNodesInitializing && !(0, _common.equalByValue)(args.value, args.previousValue)) {
                        this._loadOnOptionChange()
                    }
                    args.handled = true;
                    break;
                case "maxFilterLengthInRequest":
                    args.handled = true;
                    break;
                default:
                    this.callBase(args)
            }
        },
        getNodeByKey: function(key) {
            if (!this._dataSource) {
                return
            }
            return this._dataSource.getNodeByKey(key)
        },
        getChildNodeKeys: function(parentKey) {
            if (!this._dataSource) {
                return
            }
            return this._dataSource.getChildNodeKeys(parentKey)
        },
        loadDescendants: function(keys, childrenOnly) {
            if (!this._dataSource) {
                return
            }
            return this._dataSource.loadDescendants(keys, childrenOnly)
        },
        forEachNode: function() {
            this._dataSource.forEachNode.apply(this, arguments)
        }
    }
}());
_uiTree_list2.default.registerModule("data", {
    defaultOptions: function() {
        return (0, _extend.extend)({}, _uiGrid_core2.default.defaultOptions(), {
            itemsExpr: "items",
            parentIdExpr: "parentId",
            rootValue: 0,
            dataStructure: "plain",
            expandedRowKeys: [],
            filterMode: "withAncestors",
            expandNodesOnFiltering: true,
            autoExpandAll: false,
            onNodesInitialized: null,
            maxFilterLengthInRequest: 1500,
            paging: {
                enabled: false
            }
        })
    },
    controllers: {
        data: exports.DataController
    }
});
