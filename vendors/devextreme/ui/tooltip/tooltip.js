/**
 * DevExtreme (ui/tooltip/tooltip.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    Guid = require("../../core/guid"),
    registerComponent = require("../../core/component_registrator"),
    extend = require("../../core/utils/extend").extend,
    Popover = require("../popover"),
    TOOLTIP_CLASS = "dx-tooltip",
    TOOLTIP_WRAPPER_CLASS = "dx-tooltip-wrapper";
var Tooltip = Popover.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            toolbarItems: [],
            showCloseButton: false,
            showTitle: false,
            title: null,
            titleTemplate: null,
            onTitleRendered: null,
            bottomTemplate: null,
            propagateOutsideClick: true
        })
    },
    _render: function() {
        this.$element().addClass(TOOLTIP_CLASS);
        this._wrapper().addClass(TOOLTIP_WRAPPER_CLASS);
        this.callBase()
    },
    _renderContent: function() {
        this.callBase();
        this._contentId = "dx-" + new Guid;
        this._$content.attr({
            id: this._contentId,
            role: "tooltip"
        });
        this._toggleAriaDescription(true)
    },
    _toggleAriaDescription: function(showing) {
        var $target = $(this.option("target")),
            label = showing ? this._contentId : void 0;
        this.setAria("describedby", label, $target)
    }
});
registerComponent("dxTooltip", Tooltip);
module.exports = Tooltip;
