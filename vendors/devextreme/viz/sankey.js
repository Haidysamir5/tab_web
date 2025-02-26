/**
 * DevExtreme (viz/sankey.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var dxSankey = require("./sankey/sankey"),
    setTooltipCustomOptions = require("./sankey/tooltip").setTooltipCustomOptions;
dxSankey.addPlugin(require("./core/export").plugin);
dxSankey.addPlugin(require("./core/title").plugin);
dxSankey.addPlugin(require("./sankey/tracker").plugin);
dxSankey.addPlugin(require("./core/loading_indicator").plugin);
dxSankey.addPlugin(require("./core/tooltip").plugin);
setTooltipCustomOptions(dxSankey);
module.exports = dxSankey;
module.exports.default = module.exports;
