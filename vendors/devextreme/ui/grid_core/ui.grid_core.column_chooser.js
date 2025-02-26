/**
 * DevExtreme (ui/grid_core/ui.grid_core.column_chooser.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _common = require("../../core/utils/common");
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _uiGrid_core3 = require("./ui.grid_core.columns_view");
var _uiGrid_core4 = _interopRequireDefault(_uiGrid_core3);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _themes = require("../themes");
var _themes2 = _interopRequireDefault(_themes);
var _button = require("../button");
var _button2 = _interopRequireDefault(_button);
var _tree_view = require("../tree_view");
var _tree_view2 = _interopRequireDefault(_tree_view);
var _devices = require("../../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _popup = require("../popup");
var _popup2 = _interopRequireDefault(_popup);
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _iterator = require("../../core/utils/iterator");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var COLUMN_CHOOSER_CLASS = "column-chooser",
    COLUMN_CHOOSER_BUTTON_CLASS = "column-chooser-button",
    NOTOUCH_ACTION_CLASS = "notouch-action",
    COLUMN_CHOOSER_LIST_CLASS = "column-chooser-list",
    COLUMN_CHOOSER_PLAIN_CLASS = "column-chooser-plain",
    COLUMN_CHOOSER_DRAG_CLASS = "column-chooser-mode-drag",
    COLUMN_CHOOSER_SELECT_CLASS = "column-chooser-mode-select",
    COLUMN_CHOOSER_ICON_NAME = "column-chooser",
    COLUMN_CHOOSER_ITEM_CLASS = "dx-column-chooser-item",
    CLICK_TIMEOUT = 300,
    processItems = function(that, chooserColumns) {
        var item, items = [],
            isSelectMode = "select" === that.option("columnChooser.mode");
        if (chooserColumns.length) {
            (0, _iterator.each)(chooserColumns, function(index, column) {
                item = {
                    text: column.caption,
                    cssClass: column.cssClass,
                    allowHiding: column.allowHiding,
                    expanded: true,
                    id: column.index,
                    disabled: false === column.allowHiding,
                    parentId: (0, _type.isDefined)(column.ownerBand) ? column.ownerBand : null
                };
                if (isSelectMode) {
                    item.selected = column.visible
                }
                items.push(item)
            })
        }
        return items
    };
var ColumnChooserController = _uiGrid_core2.default.ViewController.inherit({
    renderShowColumnChooserButton: function($element) {
        var $columnChooserButton, that = this,
            columnChooserButtonClass = that.addWidgetPrefix(COLUMN_CHOOSER_BUTTON_CLASS),
            columnChooserEnabled = that.option("columnChooser.enabled"),
            $showColumnChooserButton = $element.find("." + columnChooserButtonClass);
        if (columnChooserEnabled) {
            if (!$showColumnChooserButton.length) {
                $columnChooserButton = (0, _renderer2.default)("<div>").addClass(columnChooserButtonClass).appendTo($element);
                that._createComponent($columnChooserButton, _button2.default, {
                    icon: COLUMN_CHOOSER_ICON_NAME,
                    onClick: function() {
                        that.getView("columnChooserView").showColumnChooser()
                    },
                    hint: that.option("columnChooser.title"),
                    integrationOptions: {}
                })
            } else {
                $showColumnChooserButton.show()
            }
        } else {
            $showColumnChooserButton.hide()
        }
    },
    getPosition: function() {
        var rowsView = this.getView("rowsView");
        return {
            my: "right bottom",
            at: "right bottom",
            of: rowsView && rowsView.element(),
            collision: "fit",
            offset: "-2 -2",
            boundaryOffset: "2 2"
        }
    }
});
var ColumnChooserView = _uiGrid_core4.default.ColumnsView.inherit({
    _resizeCore: _common.noop,
    _isWinDevice: function() {
        return !!_devices2.default.real().win
    },
    _updateList: function(change) {
        var items, $popupContent = this._popupContainer.$content(),
            isSelectMode = "select" === this.option("columnChooser.mode"),
            columnChooserList = this._columnChooserList,
            chooserColumns = this._columnsController.getChooserColumns(isSelectMode);
        if (isSelectMode && columnChooserList && change && "selection" === change.changeType) {
            items = processItems(this, chooserColumns);
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === change.columnIndex) {
                    columnChooserList.option("items[" + i + "].selected", items[i].selected)
                }
            }
        } else {
            if (!isSelectMode || !columnChooserList || "full" === change) {
                this._popupContainer._wrapper().toggleClass(this.addWidgetPrefix(COLUMN_CHOOSER_DRAG_CLASS), !isSelectMode).toggleClass(this.addWidgetPrefix(COLUMN_CHOOSER_SELECT_CLASS), isSelectMode);
                items = processItems(this, chooserColumns);
                this._renderTreeView($popupContent, items)
            }
        }
    },
    _initializePopupContainer: function() {
        var that = this,
            $element = that.element().addClass(that.addWidgetPrefix(COLUMN_CHOOSER_CLASS)),
            columnChooserOptions = that.option("columnChooser"),
            themeName = _themes2.default.current(),
            isGenericTheme = _themes2.default.isGeneric(themeName),
            isMaterial = _themes2.default.isMaterial(themeName),
            dxPopupOptions = {
                visible: false,
                shading: false,
                showCloseButton: false,
                dragEnabled: true,
                resizeEnabled: true,
                toolbarItems: [{
                    text: columnChooserOptions.title,
                    toolbar: "top",
                    location: isGenericTheme || isMaterial ? "before" : "center"
                }],
                position: that.getController("columnChooser").getPosition(),
                width: columnChooserOptions.width,
                height: columnChooserOptions.height,
                rtlEnabled: that.option("rtlEnabled"),
                onHidden: function() {
                    if (that._isWinDevice()) {
                        (0, _renderer2.default)("body").removeClass(that.addWidgetPrefix(NOTOUCH_ACTION_CLASS))
                    }
                },
                container: columnChooserOptions.container
            };
        if (isGenericTheme || isMaterial) {
            (0, _extend.extend)(dxPopupOptions, {
                showCloseButton: true
            })
        } else {
            dxPopupOptions.toolbarItems[dxPopupOptions.toolbarItems.length] = {
                shortcut: "cancel"
            }
        }
        if (!(0, _type.isDefined)(this._popupContainer)) {
            that._popupContainer = that._createComponent($element, _popup2.default, dxPopupOptions);
            that._popupContainer.on("optionChanged", function(args) {
                if ("visible" === args.name) {
                    that.renderCompleted.fire()
                }
            })
        } else {
            this._popupContainer.option(dxPopupOptions)
        }
    },
    _renderCore: function(change) {
        if (this._popupContainer) {
            this._updateList(change)
        }
    },
    _renderTreeView: function($container, items) {
        var scrollTop, scrollableInstance, that = this,
            columnChooser = this.option("columnChooser"),
            isSelectMode = "select" === columnChooser.mode,
            treeViewConfig = {
                items: items,
                dataStructure: "plain",
                activeStateEnabled: true,
                focusStateEnabled: true,
                hoverStateEnabled: true,
                itemTemplate: "item",
                showCheckBoxesMode: "none",
                rootValue: null,
                searchEnabled: columnChooser.allowSearch,
                searchTimeout: columnChooser.searchTimeout
            };
        scrollableInstance = $container.find(".dx-scrollable").data("dxScrollable");
        scrollTop = scrollableInstance && scrollableInstance.scrollTop();
        if (isSelectMode && !this._columnsController.isBandColumnsUsed()) {
            $container.addClass(this.addWidgetPrefix(COLUMN_CHOOSER_PLAIN_CLASS))
        }
        treeViewConfig.onContentReady = function(e) {
            (0, _common.deferUpdate)(function() {
                if (scrollTop) {
                    var scrollable = (0, _renderer2.default)(e.element).find(".dx-scrollable").data("dxScrollable");
                    scrollable && scrollable.scrollTo({
                        y: scrollTop
                    })
                }
                that.renderCompleted.fire()
            })
        };
        if (this._isWinDevice()) {
            treeViewConfig.useNativeScrolling = false
        }(0, _extend.extend)(treeViewConfig, isSelectMode ? this._prepareSelectModeConfig() : this._prepareDragModeConfig());
        if (this._columnChooserList) {
            if (!treeViewConfig.searchEnabled) {
                treeViewConfig.searchValue = ""
            }
            this._columnChooserList.option(treeViewConfig)
        } else {
            this._columnChooserList = this._createComponent($container, _tree_view2.default, treeViewConfig);
            $container.addClass(this.addWidgetPrefix(COLUMN_CHOOSER_LIST_CLASS))
        }
    },
    _prepareDragModeConfig: function() {
        var columnChooserOptions = this.option("columnChooser");
        return {
            noDataText: columnChooserOptions.emptyPanelText,
            activeStateEnabled: false,
            focusStateEnabled: false,
            hoverStateEnabled: false,
            itemTemplate: function(data, index, item) {
                (0, _renderer2.default)(item).text(data.text).parent().addClass(data.cssClass).addClass(COLUMN_CHOOSER_ITEM_CLASS)
            }
        }
    },
    _prepareSelectModeConfig: function() {
        var that = this,
            selectionChangedHandler = function(e) {
                var visibleColumns = that._columnsController.getVisibleColumns().filter(function(item) {
                        return !item.command
                    }),
                    isLastColumnUnselected = 1 === visibleColumns.length && !e.itemData.selected;
                if (isLastColumnUnselected) {
                    e.component.selectItem(e.itemElement)
                } else {
                    setTimeout(function() {
                        that._columnsController.columnOption(e.itemData.id, "visible", e.itemData.selected)
                    }, CLICK_TIMEOUT)
                }
            };
        return {
            selectNodesRecursive: false,
            showCheckBoxesMode: "normal",
            onItemSelectionChanged: selectionChangedHandler
        }
    },
    _columnOptionChanged: function(e) {
        var changeTypes = e.changeTypes,
            optionNames = e.optionNames,
            isSelectMode = "select" === this.option("columnChooser.mode");
        this.callBase(e);
        if (isSelectMode) {
            if (optionNames.visible && 1 === optionNames.length && void 0 !== e.columnIndex) {
                this.render(null, {
                    changeType: "selection",
                    columnIndex: e.columnIndex
                })
            } else {
                if (optionNames.showInColumnChooser || optionNames.visible || changeTypes.columns && optionNames.all) {
                    this.render(null, "full")
                }
            }
        }
    },
    optionChanged: function(args) {
        switch (args.name) {
            case "columnChooser":
                this._initializePopupContainer();
                this.render(null, "full");
                break;
            default:
                this.callBase(args)
        }
    },
    getColumnElements: function() {
        var $node, item, result = [],
            isSelectMode = "select" === this.option("columnChooser.mode"),
            chooserColumns = this._columnsController.getChooserColumns(isSelectMode),
            $content = this._popupContainer && this._popupContainer.$content(),
            $nodes = $content && $content.find(".dx-treeview-node");
        if ($nodes) {
            chooserColumns.forEach(function(column) {
                $node = $nodes.filter("[data-item-id = '" + column.index + "']");
                item = $node.length ? $node.children("." + COLUMN_CHOOSER_ITEM_CLASS).get(0) : null;
                result.push(item)
            })
        }
        return (0, _renderer2.default)(result)
    },
    getName: function() {
        return "columnChooser"
    },
    getColumns: function() {
        return this._columnsController.getChooserColumns()
    },
    allowDragging: function(column, sourceLocation) {
        var columnVisible = column && column.allowHiding && ("columnChooser" !== sourceLocation || !column.visible && this._columnsController.isParentColumnVisible(column.index));
        return this.isColumnChooserVisible() && columnVisible
    },
    getBoundingRect: function() {
        var offset, that = this,
            container = that._popupContainer && that._popupContainer._container();
        if (container && container.is(":visible")) {
            offset = container.offset();
            return {
                left: offset.left,
                top: offset.top,
                right: offset.left + container.outerWidth(),
                bottom: offset.top + container.outerHeight()
            }
        }
        return null
    },
    showColumnChooser: function() {
        if (!this._popupContainer) {
            this._initializePopupContainer();
            this.render()
        }
        this._popupContainer.show();
        if (this._isWinDevice()) {
            (0, _renderer2.default)("body").addClass(this.addWidgetPrefix(NOTOUCH_ACTION_CLASS))
        }
    },
    hideColumnChooser: function() {
        if (this._popupContainer) {
            this._popupContainer.hide()
        }
    },
    isColumnChooserVisible: function() {
        var popupContainer = this._popupContainer;
        return popupContainer && popupContainer.option("visible")
    },
    publicMethods: function() {
        return ["showColumnChooser", "hideColumnChooser"]
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            columnChooser: {
                enabled: false,
                allowSearch: false,
                searchTimeout: 500,
                mode: "dragAndDrop",
                width: 250,
                height: 260,
                title: _message2.default.format("dxDataGrid-columnChooserTitle"),
                emptyPanelText: _message2.default.format("dxDataGrid-columnChooserEmptyText"),
                container: void 0
            }
        }
    },
    controllers: {
        columnChooser: ColumnChooserController
    },
    views: {
        columnChooserView: ColumnChooserView
    },
    extenders: {
        views: {
            headerPanel: {
                _getToolbarItems: function() {
                    var items = this.callBase();
                    return this._appendColumnChooserItem(items)
                },
                _appendColumnChooserItem: function(items) {
                    var that = this,
                        columnChooserEnabled = that.option("columnChooser.enabled");
                    if (columnChooserEnabled) {
                        var onClickHandler = function() {
                                that.component.getView("columnChooserView").showColumnChooser()
                            },
                            onInitialized = function(e) {
                                (0, _renderer2.default)(e.element).addClass(that._getToolbarButtonClass(that.addWidgetPrefix(COLUMN_CHOOSER_BUTTON_CLASS)))
                            },
                            hintText = that.option("columnChooser.title"),
                            toolbarItem = {
                                widget: "dxButton",
                                options: {
                                    icon: COLUMN_CHOOSER_ICON_NAME,
                                    onClick: onClickHandler,
                                    hint: hintText,
                                    text: hintText,
                                    onInitialized: onInitialized
                                },
                                showText: "inMenu",
                                location: "after",
                                name: "columnChooserButton",
                                locateInMenu: "auto",
                                sortIndex: 40
                            };
                        items.push(toolbarItem)
                    }
                    return items
                },
                optionChanged: function(args) {
                    switch (args.name) {
                        case "columnChooser":
                            this._invalidate();
                            args.handled = true;
                            break;
                        default:
                            this.callBase(args)
                    }
                },
                isVisible: function() {
                    var that = this,
                        columnChooserEnabled = that.option("columnChooser.enabled");
                    return that.callBase() || columnChooserEnabled
                }
            }
        },
        controllers: {
            columns: {
                allowMoveColumn: function(fromVisibleIndex, toVisibleIndex, sourceLocation, targetLocation) {
                    var columnChooserMode = this.option("columnChooser.mode"),
                        isMoveColumnDisallowed = "select" === columnChooserMode && "columnChooser" === targetLocation;
                    return isMoveColumnDisallowed ? false : this.callBase(fromVisibleIndex, toVisibleIndex, sourceLocation, targetLocation)
                }
            }
        }
    }
};
