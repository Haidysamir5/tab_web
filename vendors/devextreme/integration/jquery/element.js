/**
 * DevExtreme (integration/jquery/element.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var setPublicElementWrapper = require("../../core/utils/dom").setPublicElementWrapper;
var useJQuery = require("./use_jquery")();
var getPublicElement = function($element) {
    return $element
};
if (useJQuery) {
    setPublicElementWrapper(getPublicElement)
}
