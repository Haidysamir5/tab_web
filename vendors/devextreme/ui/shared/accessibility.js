/**
 * DevExtreme (ui/shared/accessibility.js)
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
var _utils = require("../../events/utils");
var _utils2 = _interopRequireDefault(_utils);
var _extend = require("../../core/utils/extend");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var FOCUS_STATE_CLASS = "dx-state-focused",
    FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
    GRID_CELL_SELECTOR = ".dx-datagrid-rowsview .dx-datagrid-content .dx-row > td",
    TREELIST_CELL_SELECTOR = ".dx-treelist-rowsview .dx-treelist-content .dx-row > td",
    viewItemSelectorMap = {
        groupPanel: [".dx-datagrid-group-panel .dx-group-panel-item[tabindex]"],
        columnHeaders: [".dx-datagrid-headers .dx-header-row > td.dx-datagrid-action", ".dx-treelist-headers .dx-header-row > td.dx-treelist-action"],
        filterRow: [".dx-datagrid-headers .dx-datagrid-filter-row .dx-editor-cell input", ".dx-treelist-headers .dx-treelist-filter-row .dx-editor-cell input"],
        rowsView: [GRID_CELL_SELECTOR + "[tabindex]", "" + GRID_CELL_SELECTOR, TREELIST_CELL_SELECTOR + "[tabindex]", "" + TREELIST_CELL_SELECTOR],
        footer: [".dx-datagrid-total-footer .dx-datagrid-summary-item", ".dx-treelist-total-footer .dx-treelist-summary-item"],
        filterPanel: [".dx-datagrid-filter-panel .dx-icon-filter", ".dx-treelist-filter-panel .dx-icon-filter"],
        pager: [".dx-datagrid-pager [tabindex]", ".dx-treelist-pager [tabindex]"]
    };
var isMouseDown = false,
    isHiddenFocusing = false,
    focusedElementInfo = null;

function processKeyDown(viewName, instance, event, action, $mainElement, executeKeyDown) {
    var isHandled = fireKeyDownEvent(instance, event.originalEvent, executeKeyDown);
    if (isHandled) {
        return
    }
    var keyName = _utils2.default.normalizeKeyName(event);
    if ("enter" === keyName || "space" === keyName) {
        saveFocusedElementInfo(event.target, instance);
        action && action({
            event: event
        })
    } else {
        if ("tab" === keyName) {
            $mainElement.addClass(FOCUS_STATE_CLASS)
        } else {
            module.exports.selectView(viewName, instance, event)
        }
    }
}

function saveFocusedElementInfo(target, instance) {
    var $target = (0, _renderer2.default)(target),
        ariaLabel = $target.attr("aria-label"),
        $activeElements = getActiveAccessibleElements(ariaLabel, instance.element()),
        targetIndex = $activeElements.index($target);
    focusedElementInfo = (0, _extend.extend)({}, {
        ariaLabel: ariaLabel,
        index: targetIndex
    }, {
        viewInstance: instance
    })
}

function getActiveAccessibleElements(ariaLabel, viewElement) {
    var $activeElements, $viewElement = (0, _renderer2.default)(viewElement);
    if (ariaLabel) {
        $activeElements = $viewElement.find('[aria-label="' + ariaLabel + '"][tabindex]')
    } else {
        $activeElements = $viewElement.find("[tabindex]")
    }
    return $activeElements
}

function findFocusedViewElement(viewSelectors) {
    for (var index in viewSelectors) {
        var selector = viewSelectors[index],
            $focusViewElement = void 0;
        $focusViewElement = (0, _renderer2.default)(selector).first();
        if ($focusViewElement.length) {
            return $focusViewElement
        }
    }
}

function fireKeyDownEvent(instance, event, executeAction) {
    var args = {
        event: event,
        handled: false
    };
    if (executeAction) {
        executeAction(args)
    } else {
        instance._createActionByOption("onKeyDown")(args)
    }
    return args.handled
}
module.exports = {
    hiddenFocus: function(element) {
        isHiddenFocusing = true;
        element.focus();
        isHiddenFocusing = false
    },
    registerKeyboardAction: function(viewName, instance, $element, selector, action, executeKeyDown) {
        if (instance.option("useLegacyKeyboardNavigation")) {
            return
        }
        var $mainElement = (0, _renderer2.default)(instance.element());
        _events_engine2.default.on($element, "keydown", selector, function(e) {
            return processKeyDown(viewName, instance, e, action, $mainElement, executeKeyDown)
        });
        _events_engine2.default.on($element, "mousedown", selector, function() {
            isMouseDown = true;
            $mainElement.removeClass(FOCUS_STATE_CLASS)
        });
        _events_engine2.default.on($element, "focusin", selector, function() {
            if (!isMouseDown && !isHiddenFocusing) {
                $mainElement.addClass(FOCUS_STATE_CLASS)
            }
            isMouseDown = false
        })
    },
    restoreFocus: function(instance) {
        if (!instance.option("useLegacyKeyboardNavigation") && focusedElementInfo) {
            var viewInstance = focusedElementInfo.viewInstance;
            if (viewInstance) {
                var $activeElements = getActiveAccessibleElements(focusedElementInfo.ariaLabel, viewInstance.element()),
                    $targetElement = $activeElements.eq(focusedElementInfo.index);
                focusedElementInfo = null;
                _events_engine2.default.trigger($targetElement, "focus")
            }
        }
    },
    selectView: function(viewName, instance, event) {
        var keyName = _utils2.default.normalizeKeyName(event);
        if (event.ctrlKey && ("upArrow" === keyName || "downArrow" === keyName)) {
            var viewNames = Object.keys(viewItemSelectorMap),
                viewItemIndex = viewNames.indexOf(viewName);
            while (viewItemIndex >= 0 && viewItemIndex < viewNames.length) {
                viewItemIndex = "upArrow" === keyName ? --viewItemIndex : ++viewItemIndex;
                var _viewName = viewNames[viewItemIndex],
                    viewSelectors = viewItemSelectorMap[_viewName],
                    $focusViewElement = findFocusedViewElement(viewSelectors);
                if ($focusViewElement && $focusViewElement.length) {
                    $focusViewElement.attr("tabindex", instance.option("tabindex") || 0);
                    _events_engine2.default.trigger($focusViewElement, "focus");
                    $focusViewElement.removeClass(FOCUS_DISABLED_CLASS);
                    break
                }
            }
        }
    },
    setTabIndex: function(instance, $element) {
        if (!instance.option("useLegacyKeyboardnavigation")) {
            $element.attr("tabindex", instance.option("tabindex") || 0)
        }
    }
};
