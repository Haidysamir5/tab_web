/**
 * DevExtreme (integration/knockout/validation.js)
 * Version: 19.1.5
 * Build date: Tue Jul 30 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var each = require("../../core/utils/iterator").each,
    Class = require("../../core/class"),
    EventsMixin = require("../../core/events_mixin"),
    ValidationEngine = require("../../ui/validation_engine"),
    ko = require("knockout");
var koDxValidator = Class.inherit({
    ctor: function(target, option) {
        var that = this;
        that.target = target;
        that.validationRules = option.validationRules;
        that.name = option.name;
        that.isValid = ko.observable(true);
        that.validationError = ko.observable();
        each(this.validationRules, function(_, rule) {
            rule.validator = that
        })
    },
    validate: function() {
        var result = ValidationEngine.validate(this.target(), this.validationRules, this.name);
        this._applyValidationResult(result);
        return result
    },
    reset: function() {
        this.target(null);
        var result = {
            isValid: true,
            brokenRule: null
        };
        this._applyValidationResult(result);
        return result
    },
    _applyValidationResult: function(result) {
        result.validator = this;
        this.target.dxValidator.isValid(result.isValid);
        this.target.dxValidator.validationError(result.brokenRule);
        this.fireEvent("validated", [result])
    }
}).include(EventsMixin);
ko.extenders.dxValidator = function(target, option) {
    target.dxValidator = new koDxValidator(target, option);
    target.subscribe(target.dxValidator.validate.bind(target.dxValidator));
    return target
};
ValidationEngine.registerModelForValidation = function(model) {
    each(model, function(name, member) {
        if (ko.isObservable(member) && member.dxValidator) {
            ValidationEngine.registerValidatorInGroup(model, member.dxValidator)
        }
    })
};
ValidationEngine.unregisterModelForValidation = function(model) {
    each(model, function(name, member) {
        if (ko.isObservable(member) && member.dxValidator) {
            ValidationEngine.removeRegisteredValidator(model, member.dxValidator)
        }
    })
};
ValidationEngine.validateModel = ValidationEngine.validateGroup;
