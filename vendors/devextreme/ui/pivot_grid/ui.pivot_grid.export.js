/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.export.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _class = require("../../core/class");
var _class2 = _interopRequireDefault(_class);
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _iterator = require("../../core/utils/iterator");
var _format_helper = require("../../format_helper");
var _number = require("../../localization/number");
var _exporter = require("../../exporter");
var _exporter2 = _interopRequireDefault(_exporter);
var _uiGrid_core = require("../grid_core/ui.grid_core.export_mixin");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var DEFAULT_DATA_TYPE = "string",
    COLUMN_HEADER_STYLE_ID = 0,
    ROW_HEADER_STYLE_ID = 1,
    DATA_STYLE_OFFSET = 2,
    DEFAUL_COLUMN_WIDTH = 100;
exports.ExportMixin = (0, _extend.extend)({}, _uiGrid_core2.default, {
    exportToExcel: function() {
        var that = this;
        _exporter2.default.export(that.getDataProvider(), {
            fileName: that.option("export.fileName"),
            proxyUrl: that.option("export.proxyUrl"),
            format: "EXCEL",
            rtlEnabled: that.option("rtlEnabled"),
            ignoreErrors: that.option("export.ignoreExcelErrors"),
            exportingAction: that._actions.onExporting,
            exportedAction: that._actions.onExported,
            fileSavingAction: that._actions.onFileSaving
        }, _exporter.excel.getData)
    },
    _getLength: function(items) {
        var i, itemCount = items[0].length,
            cellCount = 0;
        for (i = 0; i < itemCount; i++) {
            cellCount += items[0][i].colspan || 1
        }
        return cellCount
    },
    _correctCellsInfoItemLengths: function(cellsInfo, expectedLength) {
        for (var i = 0; i < cellsInfo.length; i++) {
            while (cellsInfo[i].length < expectedLength) {
                cellsInfo[i].push({})
            }
        }
        return cellsInfo
    },
    _calculateCellInfoItemLength: function(columnsRow) {
        var result = 0;
        for (var columnIndex = 0; columnIndex < columnsRow.length; columnIndex++) {
            result += (0, _type.isDefined)(columnsRow[columnIndex].colspan) ? columnsRow[columnIndex].colspan : 1
        }
        return result
    },
    _getAllItems: function(columnsInfo, rowsInfoItems, cellsInfo) {
        var cellIndex, rowIndex, sourceItems, correctedCellsInfo = cellsInfo,
            rowsLength = this._getLength(rowsInfoItems),
            headerRowsCount = columnsInfo.length;
        if (columnsInfo.length > 0 && columnsInfo[0].length > 0 && cellsInfo.length > 0 && 0 === cellsInfo[0].length) {
            var cellInfoItemLength = this._calculateCellInfoItemLength(columnsInfo[0]);
            if (cellInfoItemLength > 0) {
                correctedCellsInfo = this._correctCellsInfoItemLengths(cellsInfo, cellInfoItemLength)
            }
        }
        sourceItems = columnsInfo.concat(correctedCellsInfo);
        for (rowIndex = 0; rowIndex < rowsInfoItems.length; rowIndex++) {
            for (cellIndex = rowsInfoItems[rowIndex].length - 1; cellIndex >= 0; cellIndex--) {
                if (!(0, _type.isDefined)(sourceItems[rowIndex + headerRowsCount])) {
                    sourceItems[rowIndex + headerRowsCount] = []
                }
                sourceItems[rowIndex + headerRowsCount].splice(0, 0, (0, _extend.extend)({}, rowsInfoItems[rowIndex][cellIndex]))
            }
        }
        sourceItems[0].splice(0, 0, (0, _extend.extend)({}, this._getEmptyCell(), {
            alignment: this._options.rtlEnabled ? "right" : "left",
            colspan: rowsLength,
            rowspan: headerRowsCount
        }));
        return this._prepareItems(sourceItems)
    },
    getDataProvider: function() {
        var that = this,
            dataController = this._dataController,
            items = new _deferred.Deferred;
        dataController.beginLoading();
        setTimeout(function() {
            var columnsInfo = (0, _extend.extend)(true, [], dataController.getColumnsInfo(true)),
                rowsInfoItems = (0, _extend.extend)(true, [], dataController.getRowsInfo(true)),
                cellsInfo = dataController.getCellsInfo(true);
            items.resolve(that._getAllItems(columnsInfo, rowsInfoItems, cellsInfo));
            dataController.endLoading()
        });
        return new exports.DataProvider({
            items: items,
            rtlEnabled: this.option("rtlEnabled"),
            dataFields: this.getDataSource().getAreaFields("data"),
            customizeExcelCell: this.option("export.customizeExcelCell")
        })
    }
});

function getCellDataType(field) {
    if (field && field.customizeText) {
        return "string"
    }
    if (field.dataType) {
        return field.dataType
    }
    if (field.format) {
        if (1 === (0, _number.parse)((0, _format_helper.format)(1, field.format))) {
            return "number"
        }
        if ((0, _format_helper.format)(new Date, field.format)) {
            return "date"
        }
    }
    return DEFAULT_DATA_TYPE
}
exports.DataProvider = _class2.default.inherit({
    ctor: function(options) {
        this._options = options;
        this._styles = []
    },
    ready: function() {
        var that = this,
            options = that._options,
            dataFields = options.dataFields;
        return (0, _deferred.when)(options.items).done(function(items) {
            var headerSize = items[0][0].rowspan,
                columns = items[headerSize - 1],
                dataItemStyle = {
                    alignment: options.rtlEnabled ? "left" : "right"
                };
            that._styles = [{
                alignment: "center",
                dataType: "string"
            }, {
                alignment: options.rtlEnabled ? "right" : "left",
                dataType: "string"
            }];
            if (dataFields.length) {
                dataFields.forEach(function(dataField) {
                    that._styles.push((0, _extend.extend)({}, dataItemStyle, {
                        format: dataField.format,
                        dataType: getCellDataType(dataField)
                    }))
                })
            } else {
                that._styles.push(dataItemStyle)
            }(0, _iterator.each)(columns, function(columnIndex, column) {
                column.width = DEFAUL_COLUMN_WIDTH
            });
            options.columns = columns;
            options.items = items
        })
    },
    getColumns: function() {
        return this._options.columns
    },
    getRowsCount: function() {
        return this._options.items.length
    },
    getGroupLevel: function() {
        return 0
    },
    getCellMerging: function(rowIndex, cellIndex) {
        var items = this._options.items,
            item = items[rowIndex] && items[rowIndex][cellIndex];
        return item ? {
            colspan: item.colspan - 1,
            rowspan: item.rowspan - 1
        } : {
            colspan: 0,
            rowspan: 0
        }
    },
    getFrozenArea: function() {
        var items = this._options.items;
        return {
            x: items[0][0].colspan,
            y: items[0][0].rowspan
        }
    },
    getCellType: function(rowIndex, cellIndex) {
        var style = this._styles[this.getStyleId(rowIndex, cellIndex)];
        return style && style.dataType || "string"
    },
    getCellData: function(rowIndex, cellIndex) {
        var result = {};
        var items = this._options.items,
            item = items[rowIndex] && items[rowIndex][cellIndex] || {};
        if ("string" === this.getCellType(rowIndex, cellIndex)) {
            result.value = item.text
        } else {
            result.value = item.value
        }
        return result
    },
    getStyles: function() {
        return this._styles
    },
    getStyleId: function(rowIndex, cellIndex) {
        var items = this._options.items,
            columnHeaderSize = items[0][0].rowspan,
            rowHeaderSize = items[0][0].colspan,
            item = items[rowIndex] && items[rowIndex][cellIndex] || {};
        if (0 === cellIndex && 0 === rowIndex) {
            return COLUMN_HEADER_STYLE_ID
        } else {
            if (cellIndex >= rowHeaderSize && rowIndex < columnHeaderSize) {
                return COLUMN_HEADER_STYLE_ID
            } else {
                if (rowIndex >= columnHeaderSize && cellIndex < rowHeaderSize) {
                    return ROW_HEADER_STYLE_ID
                }
            }
        }
        return DATA_STYLE_OFFSET + (item.dataIndex || 0)
    },
    hasCustomizeExcelCell: function() {
        return (0, _type.isDefined)(this._options.customizeExcelCell)
    },
    customizeExcelCell: function(e) {
        if (this._options.customizeExcelCell) {
            this._options.customizeExcelCell(e)
        }
    }
});
