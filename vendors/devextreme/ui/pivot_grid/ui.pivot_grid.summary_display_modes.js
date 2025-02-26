/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.summary_display_modes.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _array = require("../../core/utils/array");
var _uiPivot_grid = require("./ui.pivot_grid.utils");
var COLUMN = "column",
    ROW = "row",
    NULL = null,
    calculatePercentValue = function(value, totalValue) {
        var result = value / totalValue;
        if (!(0, _type.isDefined)(value) || isNaN(result)) {
            result = NULL
        }
        return result
    },
    _percentOfGrandTotal = function(e, dimension) {
        return calculatePercentValue(e.value(), e.grandTotal(dimension).value())
    },
    percentOfParent = function(e, dimension) {
        var parent = e.parent(dimension),
            parentValue = parent ? parent.value() : e.value();
        return calculatePercentValue(e.value(), parentValue)
    },
    createAbsoluteVariationExp = function(allowCrossGroup) {
        return function(e) {
            var prevCell = e.prev(COLUMN, allowCrossGroup),
                prevValue = prevCell && prevCell.value();
            if ((0, _type.isDefined)(prevValue) && (0, _type.isDefined)(e.value())) {
                return e.value() - prevValue
            }
            return NULL
        }
    },
    createPercentVariationExp = function(allowCrossGroup) {
        var absoluteExp = createAbsoluteVariationExp(allowCrossGroup);
        return function(e) {
            var absVar = absoluteExp(e),
                prevCell = e.prev(COLUMN, allowCrossGroup),
                prevValue = prevCell && prevCell.value();
            return absVar !== NULL && prevValue ? absVar / prevValue : NULL
        }
    },
    summaryDictionary = {
        percentOfColumnTotal: function(e) {
            return percentOfParent(e, ROW)
        },
        percentOfRowTotal: function(e) {
            return percentOfParent(e, COLUMN)
        },
        percentOfColumnGrandTotal: function(e) {
            return _percentOfGrandTotal(e, ROW)
        },
        percentOfRowGrandTotal: function(e) {
            return _percentOfGrandTotal(e, COLUMN)
        },
        percentOfGrandTotal: function(e) {
            return _percentOfGrandTotal(e)
        }
    },
    getPrevCellCrossGroup = function getPrevCellCrossGroup(cell, direction) {
        if (!cell || !cell.parent(direction)) {
            return
        }
        var prevCell = cell.prev(direction);
        if (!prevCell) {
            prevCell = getPrevCellCrossGroup(cell.parent(direction), direction)
        }
        return prevCell
    },
    createRunningTotalExpr = function(field) {
        if (!field.runningTotal) {
            return
        }
        var direction = field.runningTotal === COLUMN ? ROW : COLUMN;
        return function(e) {
            var prevCell = field.allowCrossGroupCalculation ? getPrevCellCrossGroup(e, direction) : e.prev(direction, false),
                value = e.value(true),
                prevValue = prevCell && prevCell.value(true);
            if ((0, _type.isDefined)(prevValue) && (0, _type.isDefined)(value)) {
                value = prevValue + value
            } else {
                if ((0, _type.isDefined)(prevValue)) {
                    value = prevValue
                }
            }
            return value
        }
    };

function createCache() {
    return {
        fields: {},
        positions: {}
    }
}

function getFieldPos(descriptions, field, cache) {
    var fieldIndex, allFields, fieldParams = {
        index: -1
    };
    if (!(0, _type.isObject)(field)) {
        if (cache.fields[field]) {
            field = cache[field]
        } else {
            allFields = descriptions.columns.concat(descriptions.rows).concat(descriptions.values);
            fieldIndex = (0, _uiPivot_grid.findField)(allFields, field);
            field = cache[field] = allFields[fieldIndex]
        }
    }
    if (field) {
        var area = field.area || "data";
        fieldParams = cache.positions[field.index] = cache.positions[field.index] || {
            area: area,
            index: (0, _array.inArray)(field, descriptions["data" === area ? "values" : area + "s"])
        }
    }
    return fieldParams
}

function getPathFieldName(dimension) {
    return dimension === ROW ? "_rowPath" : "_columnPath"
}
var SummaryCell = function(columnPath, rowPath, data, descriptions, fieldIndex, fieldsCache) {
    this._columnPath = columnPath;
    this._rowPath = rowPath;
    this._fieldIndex = fieldIndex;
    this._fieldsCache = fieldsCache || createCache();
    this._data = data;
    this._descriptions = descriptions;
    var cell = data.values && data.values[rowPath[0].index] && data.values[rowPath[0].index][columnPath[0].index];
    if (cell) {
        cell.originalCell = cell.originalCell || cell.slice();
        this._cell = cell
    }
};
SummaryCell.prototype = (0, _extend.extend)(SummaryCell.prototype, {
    _getPath: function(dimension) {
        return this[getPathFieldName(dimension)]
    },
    _getDimension: function(dimension) {
        dimension = dimension === ROW ? "rows" : "columns";
        return this._descriptions[dimension]
    },
    _createCell: function(config) {
        var that = this;
        return new SummaryCell(config._columnPath || that._columnPath, config._rowPath || that._rowPath, that._data, that._descriptions, that._fieldIndex)
    },
    parent: function(direction) {
        var path = this._getPath(direction).slice(),
            config = {};
        path.shift();
        if (path.length) {
            config[getPathFieldName(direction)] = path;
            return this._createCell(config)
        }
        return NULL
    },
    children: function(direction) {
        var path = this._getPath(direction).slice(),
            item = path[0],
            result = [],
            cellConfig = {};
        if (item.children) {
            for (var i = 0; i < item.children.length; i++) {
                cellConfig[getPathFieldName(direction)] = [item.children[i]].concat(path.slice());
                result.push(this._createCell(cellConfig))
            }
        }
        return result
    },
    grandTotal: function(direction) {
        var config = {},
            rowPath = this._rowPath,
            columnPath = this._columnPath,
            dimensionPath = this._getPath(direction),
            pathFieldName = getPathFieldName(direction);
        if (!direction) {
            config._rowPath = [rowPath[rowPath.length - 1]];
            config._columnPath = [columnPath[columnPath.length - 1]]
        } else {
            config[pathFieldName] = [dimensionPath[dimensionPath.length - 1]]
        }
        return this._createCell(config)
    },
    next: function(direction, allowCrossGroup) {
        var siblings, index, currentPath = this._getPath(direction),
            item = currentPath[0],
            parent = this.parent(direction);
        if (parent) {
            index = (0, _array.inArray)(item, currentPath[1].children);
            siblings = parent.children(direction);
            if (siblings[index + 1]) {
                return siblings[index + 1]
            }
        }
        if (allowCrossGroup && parent) {
            do {
                parent = parent.next(direction, allowCrossGroup);
                siblings = parent ? parent.children(direction) : []
            } while (parent && !siblings.length);
            return siblings[0] || NULL
        }
        return NULL
    },
    prev: function(direction, allowCrossGroup) {
        var siblings, index, currentPath = this._getPath(direction),
            item = currentPath[0],
            parent = this.parent(direction);
        if (parent) {
            index = (0, _array.inArray)(item, currentPath[1].children);
            siblings = parent.children(direction);
            if (siblings[index - 1]) {
                return siblings[index - 1]
            }
        }
        if (allowCrossGroup && parent) {
            do {
                parent = parent.prev(direction, allowCrossGroup);
                siblings = parent ? parent.children(direction) : []
            } while (parent && !siblings.length);
            return siblings[siblings.length - 1] || NULL
        }
        return NULL
    },
    cell: function() {
        return this._cell
    },
    field: function field(area) {
        if ("data" === area) {
            return this._descriptions.values[this._fieldIndex]
        }
        var path = this._getPath(area),
            descriptions = this._getDimension(area),
            field = descriptions[path.length - 2];
        return field || NULL
    },
    child: function(direction, fieldValue) {
        var childLevelField, children = this.children(direction);
        for (var i = 0; i < children.length; i++) {
            childLevelField = childLevelField || children[i].field(direction);
            if (children[i].value(childLevelField) === fieldValue) {
                return children[i]
            }
        }
        return NULL
    },
    slice: function(field, value) {
        var childItems, path, currentValue, level, that = this,
            config = {},
            fieldPos = getFieldPos(this._descriptions, field, this._fieldsCache),
            area = fieldPos.area,
            fieldIndex = fieldPos.index,
            sliceCell = NULL,
            newPath = [];
        if (area === ROW || area === COLUMN) {
            path = this._getPath(area).slice();
            level = fieldIndex !== -1 && path.length - 2 - fieldIndex;
            if (path[level]) {
                newPath[path.length - 1] = path[path.length - 1];
                for (var i = level; i >= 0; i--) {
                    if (path[i + 1]) {
                        childItems = path[i + 1].children || [];
                        currentValue = i === level ? value : path[i].value;
                        path[i] = void 0;
                        for (var childIndex = 0; childIndex < childItems.length; childIndex++) {
                            if (childItems[childIndex].value === currentValue) {
                                path[i] = childItems[childIndex];
                                break
                            }
                        }
                    }
                    if (void 0 === path[i]) {
                        return sliceCell
                    }
                }
                config[getPathFieldName(area)] = path;
                sliceCell = that._createCell(config)
            }
        }
        return sliceCell
    },
    value: function(arg1, arg2) {
        var path, level, cell = this._cell,
            fieldIndex = this._fieldIndex,
            fistArgIsBoolean = true === arg1 || false === arg1,
            field = !fistArgIsBoolean ? arg1 : NULL,
            needCalculatedValue = fistArgIsBoolean && arg1 || arg2;
        if ((0, _type.isDefined)(field)) {
            var fieldPos = getFieldPos(this._descriptions, field, this._fieldsCache);
            fieldIndex = fieldPos.index;
            if ("data" !== fieldPos.area) {
                path = this._getPath(fieldPos.area);
                level = fieldIndex !== -1 && path.length - 2 - fieldIndex;
                return path[level] && path[level].value
            }
        }
        if (cell && cell.originalCell) {
            return needCalculatedValue ? cell[fieldIndex] : cell.originalCell[fieldIndex]
        }
        return NULL
    }
});

function getExpression(field) {
    var summaryDisplayMode = field.summaryDisplayMode,
        crossGroupCalculation = field.allowCrossGroupCalculation,
        expression = NULL;
    if ((0, _type.isFunction)(field.calculateSummaryValue)) {
        expression = field.calculateSummaryValue
    } else {
        if (summaryDisplayMode) {
            if ("absoluteVariation" === summaryDisplayMode) {
                expression = createAbsoluteVariationExp(crossGroupCalculation)
            } else {
                if ("percentVariation" === summaryDisplayMode) {
                    expression = createPercentVariationExp(crossGroupCalculation)
                } else {
                    expression = summaryDictionary[summaryDisplayMode]
                }
            }
            if (expression && !field.format && summaryDisplayMode.indexOf("percent") !== -1) {
                (0, _uiPivot_grid.setFieldProperty)(field, "format", "percent")
            }
        }
    }
    return expression
}

function processDataCell(data, rowIndex, columnIndex, isRunningTotalCalculation) {
    var values = data.values[rowIndex][columnIndex] = data.values[rowIndex][columnIndex] || [],
        originalCell = values.originalCell;
    if (!originalCell) {
        return
    }
    if (values.allowResetting || !isRunningTotalCalculation) {
        data.values[rowIndex][columnIndex] = originalCell.slice()
    }
    data.values[rowIndex][columnIndex].allowResetting = isRunningTotalCalculation
}
exports.applyDisplaySummaryMode = function(descriptions, data) {
    var expressions = [],
        columnElements = [{
            index: data.grandTotalColumnIndex,
            children: data.columns
        }],
        rowElements = [{
            index: data.grandTotalRowIndex,
            children: data.rows
        }],
        valueFields = descriptions.values,
        fieldsCache = createCache();
    data.values = data.values || [];
    (0, _uiPivot_grid.foreachTree)(rowElements, function(rowPath) {
        var rowItem = rowPath[0];
        rowItem.isEmpty = [];
        data.values[rowItem.index] = data.values[rowItem.index] || [];
        (0, _uiPivot_grid.foreachTree)(columnElements, function(columnPath) {
            var expression, expressionArg, cell, field, isEmptyCell, value, columnItem = columnPath[0];
            columnItem.isEmpty = columnItem.isEmpty || [];
            processDataCell(data, rowItem.index, columnItem.index, false);
            for (var i = 0; i < valueFields.length; i++) {
                field = valueFields[i];
                expression = expressions[i] = void 0 === expressions[i] ? getExpression(field) : expressions[i];
                isEmptyCell = false;
                if (expression) {
                    expressionArg = new SummaryCell(columnPath, rowPath, data, descriptions, i, fieldsCache);
                    cell = expressionArg.cell();
                    value = cell[i] = expression(expressionArg);
                    isEmptyCell = null === value || void 0 === value
                }
                if (void 0 === columnItem.isEmpty[i]) {
                    columnItem.isEmpty[i] = true
                }
                if (void 0 === rowItem.isEmpty[i]) {
                    rowItem.isEmpty[i] = true
                }
                if (!isEmptyCell) {
                    rowItem.isEmpty[i] = columnItem.isEmpty[i] = false
                }
            }
        }, false)
    }, false);
    data.isEmptyGrandTotalRow = rowElements[0].isEmpty;
    data.isEmptyGrandTotalColumn = columnElements[0].isEmpty
};
exports.applyRunningTotal = function(descriptions, data) {
    var expressions = [],
        columnElements = [{
            index: data.grandTotalColumnIndex,
            children: data.columns
        }],
        rowElements = [{
            index: data.grandTotalRowIndex,
            children: data.rows
        }],
        valueFields = descriptions.values,
        fieldsCache = createCache();
    data.values = data.values || [];
    (0, _uiPivot_grid.foreachTree)(rowElements, function(rowPath) {
        var rowItem = rowPath[0];
        data.values[rowItem.index] = data.values[rowItem.index] || [];
        (0, _uiPivot_grid.foreachTree)(columnElements, function(columnPath) {
            var expression, expressionArg, cell, field, columnItem = columnPath[0];
            processDataCell(data, rowItem.index, columnItem.index, true);
            for (var i = 0; i < valueFields.length; i++) {
                field = valueFields[i];
                expression = expressions[i] = void 0 === expressions[i] ? createRunningTotalExpr(field) : expressions[i];
                if (expression) {
                    expressionArg = new SummaryCell(columnPath, rowPath, data, descriptions, i, fieldsCache);
                    cell = expressionArg.cell();
                    cell[i] = expression(expressionArg)
                }
            }
        }, false)
    }, false)
};
exports.createMockSummaryCell = function(descriptions, fields, indices) {
    var summaryCell = new SummaryCell([], [], {}, descriptions, 0);
    summaryCell.value = function(fieldId) {
        if ((0, _type.isDefined)(fieldId)) {
            var index = (0, _uiPivot_grid.findField)(fields, fieldId),
                field = fields[index];
            if (!indices[index] && field && !(0, _type.isDefined)(field.area)) {
                descriptions.values.push(field);
                indices[index] = true
            }
        }
    };
    summaryCell.grandTotal = function() {
        return this
    };
    summaryCell.children = function() {
        return []
    };
    return summaryCell
};
