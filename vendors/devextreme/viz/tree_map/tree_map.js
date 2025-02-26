/**
 * DevExtreme (viz/tree_map/tree_map.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var dxTreeMap = module.exports = require("./tree_map.base");
require("./tiling.squarified");
require("./tiling.strip");
require("./tiling.slice_and_dice");
require("./tiling.rotated_slice_and_dice");
require("./colorizing.discrete");
require("./colorizing.gradient");
require("./colorizing.range");
require("./api");
require("./hover");
require("./selection");
require("./tooltip");
require("./tracker");
require("./drilldown");
require("./plain_data_source");
dxTreeMap.addPlugin(require("../core/export").plugin);
dxTreeMap.addPlugin(require("../core/title").plugin);
dxTreeMap.addPlugin(require("../core/loading_indicator").plugin);
