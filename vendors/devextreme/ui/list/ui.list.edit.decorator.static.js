/**
 * DevExtreme (ui/list/ui.list.edit.decorator.static.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    Button = require("../button"),
    registerDecorator = require("./ui.list.edit.decorator_registry").register,
    EditDecorator = require("./ui.list.edit.decorator");
var STATIC_DELETE_BUTTON_CONTAINER_CLASS = "dx-list-static-delete-button-container",
    STATIC_DELETE_BUTTON_CLASS = "dx-list-static-delete-button";
registerDecorator("delete", "static", EditDecorator.inherit({
    afterBag: function(config) {
        var $itemElement = config.$itemElement,
            $container = config.$container;
        var $button = $("<div>").addClass(STATIC_DELETE_BUTTON_CLASS);
        this._list._createComponent($button, Button, {
            icon: "remove",
            onClick: function(args) {
                args.event.stopPropagation();
                this._deleteItem($itemElement)
            }.bind(this),
            integrationOptions: {}
        });
        $container.addClass(STATIC_DELETE_BUTTON_CONTAINER_CLASS).append($button)
    },
    _deleteItem: function($itemElement) {
        if ($itemElement.is(".dx-state-disabled, .dx-state-disabled *")) {
            return
        }
        this._list.deleteItem($itemElement)
    }
}));
