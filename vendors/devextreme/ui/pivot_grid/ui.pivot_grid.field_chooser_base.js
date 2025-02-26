/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.field_chooser_base.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _array_store = require("../../data/array_store");
var _array_store2 = _interopRequireDefault(_array_store);
var _click = require("../../events/click");
var _click2 = _interopRequireDefault(_click);
var _common = require("../../core/utils/common");
var _type = require("../../core/utils/type");
var _array = require("../../core/utils/array");
var _extend = require("../../core/utils/extend");
var _iterator = require("../../core/utils/iterator");
var _message = require("../../localization/message");
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _ui = require("../widget/ui.widget");
var _ui2 = _interopRequireDefault(_ui);
var _uiGrid_core = require("../grid_core/ui.grid_core.header_filter_core");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _uiGrid_core3 = require("../grid_core/ui.grid_core.column_state_mixin");
var _uiGrid_core4 = _interopRequireDefault(_uiGrid_core3);
var _uiGrid_core5 = require("../grid_core/ui.grid_core.sorting_mixin");
var _uiGrid_core6 = _interopRequireDefault(_uiGrid_core5);
var _uiPivot_grid = require("./ui.pivot_grid.utils");
var _ui3 = require("./ui.sortable");
var _ui4 = _interopRequireDefault(_ui3);
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var IE_FIELD_WIDTH_CORRECTION = 1,
    DIV = "<div>";
var HeaderFilterView = _uiGrid_core2.default.HeaderFilterView.inherit({
    _getSearchExpr: function(options) {
        options.useDefaultSearchExpr = true;
        return this.callBase(options)
    }
});
var processItems = function(groupItems, field) {
    var filterValues = [],
        isTree = !!field.groupName,
        isExcludeFilterType = "exclude" === field.filterType;
    if (field.filterValues) {
        (0, _iterator.each)(field.filterValues, function(_, filterValue) {
            filterValues.push(Array.isArray(filterValue) ? filterValue.join("/") : filterValue && filterValue.valueOf())
        })
    }(0, _uiPivot_grid.foreachTree)(groupItems, function(items) {
        var preparedFilterValue, item = items[0],
            path = (0, _uiPivot_grid.createPath)(items),
            preparedFilterValueByText = isTree ? (0, _iterator.map)(items, function(item) {
                return item.text
            }).reverse().join("/") : item.text;
        item.value = isTree ? path.slice(0) : item.key || item.value;
        preparedFilterValue = isTree ? path.join("/") : item.value && item.value.valueOf();
        if (item.children) {
            item.items = item.children;
            item.children = null
        }(0, _uiGrid_core.updateHeaderFilterItemSelectionState)(item, item.key && (0, _array.inArray)(preparedFilterValueByText, filterValues) > -1 || (0, _array.inArray)(preparedFilterValue, filterValues) > -1, isExcludeFilterType)
    })
};

function getMainGroupField(dataSource, sourceField) {
    var field = sourceField;
    if ((0, _type.isDefined)(sourceField.groupIndex)) {
        field = dataSource.getAreaFields(sourceField.area, true)[sourceField.areaIndex]
    }
    return field
}

function getStringState(state) {
    state = state || {};
    return JSON.stringify([state.fields, state.columnExpandedPaths, state.rowExpandedPaths])
}
var FieldChooserBase = _ui2.default.inherit(_uiGrid_core4.default).inherit(_uiGrid_core6.default).inherit(_uiGrid_core.headerFilterMixin).inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            allowFieldDragging: true,
            applyChangesMode: "instantly",
            state: null,
            headerFilter: {
                width: 252,
                height: 325,
                searchTimeout: 500,
                texts: {
                    emptyValue: (0, _message.format)("dxDataGrid-headerFilterEmptyValue"),
                    ok: (0, _message.format)("dxDataGrid-headerFilterOK"),
                    cancel: (0, _message.format)("dxDataGrid-headerFilterCancel")
                }
            }
        })
    },
    _init: function() {
        this.callBase();
        this._headerFilterView = new HeaderFilterView(this);
        this._refreshDataSource();
        this.subscribeToEvents()
    },
    _refreshDataSource: function() {
        var dataSource = this.option("dataSource");
        if (dataSource && dataSource.fields && dataSource.load) {
            this._dataSource = dataSource
        }
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "dataSource":
                this._refreshDataSource();
                break;
            case "applyChangesMode":
                break;
            case "state":
                if (this._skipStateChange || !this._dataSource) {
                    break
                }
                if ("instantly" === this.option("applyChangesMode") && getStringState(this._dataSource.state()) !== getStringState(args.value)) {
                    this._dataSource.state(args.value)
                } else {
                    this._clean(true);
                    this._renderComponent()
                }
                break;
            case "headerFilter":
            case "allowFieldDragging":
                this._invalidate();
                break;
            default:
                this.callBase(args)
        }
    },
    renderField: function(field, showColumnLines) {
        var that = this,
            $fieldContent = (0, _renderer2.default)(DIV).addClass("dx-area-field-content").text(field.caption || field.dataField),
            $fieldElement = (0, _renderer2.default)(DIV).addClass("dx-area-field").addClass("dx-area-box").data("field", field).append($fieldContent),
            mainGroupField = getMainGroupField(that._dataSource, field);
        if ("data" !== field.area) {
            if (field.allowSorting) {
                that._applyColumnState({
                    name: "sort",
                    rootElement: $fieldElement,
                    column: {
                        alignment: that.option("rtlEnabled") ? "right" : "left",
                        sortOrder: "desc" === field.sortOrder ? "desc" : "asc"
                    },
                    showColumnLines: showColumnLines
                })
            }
            that._applyColumnState({
                name: "headerFilter",
                rootElement: $fieldElement,
                column: {
                    alignment: that.option("rtlEnabled") ? "right" : "left",
                    filterValues: mainGroupField.filterValues,
                    allowFiltering: mainGroupField.allowFiltering && !field.groupIndex
                },
                showColumnLines: showColumnLines
            })
        }
        if (field.groupName) {
            $fieldElement.attr("item-group", field.groupName)
        }
        return $fieldElement
    },
    _clean: function() {},
    _render: function() {
        this.callBase();
        this._headerFilterView.render(this.$element())
    },
    renderSortable: function() {
        var that = this;
        that._createComponent(that.$element(), _ui4.default, (0, _extend.extend)({
            allowDragging: that.option("allowFieldDragging"),
            itemSelector: ".dx-area-field",
            itemContainerSelector: ".dx-area-field-container",
            groupSelector: ".dx-area-fields",
            groupFilter: function() {
                var dataSource = that._dataSource,
                    $sortable = (0, _renderer2.default)(this).closest(".dx-sortable"),
                    pivotGrid = $sortable.data("dxPivotGrid"),
                    pivotGridFieldChooser = $sortable.data("dxPivotGridFieldChooser");
                if (pivotGrid) {
                    return pivotGrid.getDataSource() === dataSource
                }
                if (pivotGridFieldChooser) {
                    return pivotGridFieldChooser.option("dataSource") === dataSource
                }
                return false
            },
            itemRender: function($sourceItem, target) {
                var $item;
                if ($sourceItem.hasClass("dx-area-box")) {
                    $item = $sourceItem.clone();
                    if ("drag" === target) {
                        (0, _iterator.each)($sourceItem, function(index, sourceItem) {
                            $item.eq(index).css("width", parseInt((0, _renderer2.default)(sourceItem).outerWidth(), 10) + IE_FIELD_WIDTH_CORRECTION)
                        })
                    }
                } else {
                    $item = (0, _renderer2.default)(DIV).addClass("dx-area-field").addClass("dx-area-box").text($sourceItem.text())
                }
                if ("drag" === target) {
                    var wrapperContainer = (0, _renderer2.default)(DIV);
                    (0, _iterator.each)($item, function(_, item) {
                        var wrapper = (0, _renderer2.default)("<div>").addClass("dx-pivotgrid-fields-container").addClass("dx-widget").append((0, _renderer2.default)(item));
                        wrapperContainer.append(wrapper)
                    });
                    return wrapperContainer.children()
                }
                return $item
            },
            onDragging: function(e) {
                var field = e.sourceElement.data("field"),
                    targetGroup = e.targetGroup;
                e.cancel = false;
                if (true === field.isMeasure) {
                    if ("column" === targetGroup || "row" === targetGroup || "filter" === targetGroup) {
                        e.cancel = true
                    }
                } else {
                    if (false === field.isMeasure && "data" === targetGroup) {
                        e.cancel = true
                    }
                }
            },
            useIndicator: true,
            onChanged: function(e) {
                var dataSource = that._dataSource,
                    field = e.sourceElement.data("field");
                e.removeSourceElement = !!e.sourceGroup;
                that._adjustSortableOnChangedArgs(e);
                if (field) {
                    that._applyChanges([getMainGroupField(dataSource, field)], {
                        area: e.targetGroup,
                        areaIndex: e.targetIndex
                    })
                }
            }
        }, that._getSortableOptions()))
    },
    _processDemandState: function(func) {
        var that = this,
            isInstantlyMode = "instantly" === that.option("applyChangesMode"),
            dataSource = that._dataSource;
        if (isInstantlyMode) {
            func(dataSource, isInstantlyMode)
        } else {
            var currentState = dataSource.state();
            var pivotGridState = that.option("state");
            if (pivotGridState) {
                dataSource.state(pivotGridState, true)
            }
            func(dataSource, isInstantlyMode);
            dataSource.state(currentState, true)
        }
    },
    _applyChanges: function(fields, props) {
        var that = this;
        that._processDemandState(function(dataSource, isInstantlyMode) {
            fields.forEach(function(_ref) {
                var index = _ref.index;
                dataSource.field(index, props)
            });
            if (isInstantlyMode) {
                dataSource.load()
            } else {
                that._changedHandler()
            }
        })
    },
    _adjustSortableOnChangedArgs: function(e) {
        e.removeSourceElement = false;
        e.removeTargetElement = true;
        e.removeSourceClass = false
    },
    _getSortableOptions: function() {
        return {
            direction: "auto"
        }
    },
    subscribeToEvents: function(element) {
        var that = this,
            func = function(e) {
                var field = (0, _renderer2.default)(e.currentTarget).data("field"),
                    mainGroupField = (0, _extend.extend)(true, {}, getMainGroupField(that._dataSource, field)),
                    isHeaderFilter = (0, _renderer2.default)(e.target).hasClass("dx-header-filter"),
                    dataSource = that._dataSource,
                    type = mainGroupField.groupName ? "tree" : "list",
                    paginate = dataSource.paginate() && "list" === type;
                if (isHeaderFilter) {
                    that._headerFilterView.showHeaderFilterMenu((0, _renderer2.default)(e.currentTarget), (0, _extend.extend)(mainGroupField, {
                        type: type,
                        encodeHtml: that.option("encodeHtml"),
                        dataSource: {
                            useDefaultSearch: !paginate,
                            load: function(options) {
                                var userData = options.userData;
                                if (userData.store) {
                                    return userData.store.load(options)
                                } else {
                                    var d = new _deferred.Deferred;
                                    dataSource.getFieldValues(mainGroupField.index, that.option("headerFilter.showRelevantValues"), paginate ? options : void 0).done(function(data) {
                                        if (paginate) {
                                            d.resolve(data)
                                        } else {
                                            userData.store = new _array_store2.default(data);
                                            userData.store.load(options).done(d.resolve).fail(d.reject)
                                        }
                                    }).fail(d.reject);
                                    return d
                                }
                            },
                            postProcess: function(data) {
                                processItems(data, mainGroupField);
                                return data
                            }
                        },
                        apply: function() {
                            that._applyChanges([mainGroupField], {
                                filterValues: this.filterValues,
                                filterType: this.filterType
                            })
                        }
                    }))
                } else {
                    if (field.allowSorting && "data" !== field.area) {
                        that._applyChanges([field], {
                            sortOrder: "desc" === field.sortOrder ? "asc" : "desc"
                        })
                    }
                }
            };
        if (element) {
            _events_engine2.default.on(element, _click2.default.name, ".dx-area-field.dx-area-box", func);
            return
        }
        _events_engine2.default.on(that.$element(), _click2.default.name, ".dx-area-field.dx-area-box", func)
    },
    _initTemplates: _common.noop,
    addWidgetPrefix: function(className) {
        return "dx-pivotgrid-" + className
    }
});
(0, _component_registrator2.default)("dxPivotGridFieldChooserBase", FieldChooserBase);
module.exports = FieldChooserBase;
