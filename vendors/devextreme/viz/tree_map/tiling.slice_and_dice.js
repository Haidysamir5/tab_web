/**
 * DevExtreme (viz/tree_map/tiling.slice_and_dice.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var tiling = require("./tiling");

function sliceAndDice(data) {
    var items = data.items,
        sidesData = tiling.buildSidesData(data.rect, data.directions, data.isRotated ? 1 : 0);
    tiling.calculateRectangles(items, 0, data.rect, sidesData, {
        sum: data.sum,
        count: items.length,
        side: sidesData.variedSide
    })
}
tiling.addAlgorithm("sliceanddice", sliceAndDice);
module.exports = sliceAndDice;
