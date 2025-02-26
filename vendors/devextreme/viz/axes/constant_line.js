/**
 * DevExtreme (viz/axes/constant_line.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = createConstantLine;
var _type = require("../../core/utils/type");

function createConstantLine(axis, options) {
    var labelOptions = options.label || {};
    var labelPosition = labelOptions.position || "inside";
    var parsedValue = void 0;
    var valueIsParsed = false;
    axis._checkAlignmentConstantLineLabels(labelOptions);
    var storedCoord = void 0;
    return {
        options: options,
        labelOptions: labelOptions,
        labelPosition: labelPosition,
        label: null,
        line: null,
        getParsedValue: function() {
            if (!valueIsParsed) {
                parsedValue = axis.validateUnit(options.value, "E2105", "constantLine");
                valueIsParsed = true;
                return parsedValue
            }
            return parsedValue
        },
        draw: function() {
            if (!(0, _type.isDefined)(options.value) || axis._translator.getBusinessRange().isEmpty()) {
                return this
            }
            var canvas = axis._getCanvasStartEnd();
            var parsedValue = this.getParsedValue();
            this.coord = axis._getConstantLinePos(parsedValue, canvas.start, canvas.end);
            var rootGroup = options.displayBehindSeries ? axis._axisConstantLineGroups.under : axis._axisConstantLineGroups.above;
            var group = rootGroup[labelPosition];
            if (!group) {
                var side = axis._isHorizontal ? labelOptions.verticalAlignment : labelOptions.horizontalAlignment;
                group = rootGroup[side]
            }
            if (!(0, _type.isDefined)(this.coord)) {
                return this
            }
            var path = axis._createConstantLine(this.coord, {
                stroke: options.color,
                "stroke-width": options.width,
                dashStyle: options.dashStyle
            });
            this.line = path.append(rootGroup.inside);
            this.label = labelOptions.visible ? axis._drawConstantLineLabels(parsedValue, labelOptions, this.coord, group) : null;
            this.updatePosition();
            return this
        },
        removeLabel: function() {
            this.label && this.label.remove()
        },
        updatePosition: function(animate) {
            var canvas = axis._getCanvasStartEnd();
            var coord = axis._getConstantLinePos(this.getParsedValue(), canvas.start, canvas.end);
            if (!(0, _type.isDefined)(coord)) {
                return
            }
            this.coord = coord;
            if (animate && storedCoord) {
                this.label && this.label.attr(axis._getConstantLineLabelsCoords(storedCoord, this.labelOptions));
                this.line && this.line.attr(axis._getConstantLineGraphicAttributes(storedCoord));
                this.label && this.label.animate(axis._getConstantLineLabelsCoords(this.coord, this.labelOptions));
                this.line && this.line.animate(axis._getConstantLineGraphicAttributes(this.coord))
            } else {
                this.label && this.label.attr(axis._getConstantLineLabelsCoords(this.coord, this.labelOptions));
                this.line && this.line.attr(axis._getConstantLineGraphicAttributes(this.coord))
            }
        },
        saveCoords: function() {
            storedCoord = this.coord
        }
    }
}
