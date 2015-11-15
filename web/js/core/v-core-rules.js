function BusinessRules() {}

BusinessRules.prototype.addBRules = function(rules) {
    var postfix;
    this.brules = this.brules || {};
    for (var key in rules) {
        postfix = U.getRandomString();
        this.brules[key + ';__' + postfix] = rules[key];
    }
};

BusinessRules.prototype.runBRule = function(name, argssss) {
    var keys = null;
    var argz = Array.prototype.slice.call(arguments);
    var operator = null;
    argz.splice(0, 1);
    for (var bRule in this.brules) {
        keys = bRule.split(';');
        operator = this.getBRuleOperator(bRule);
        if (keys.indexOf('__btn') < 0 && this.bRuleEqualHandlers[operator](name, bRule)) {
            this.brules[bRule].apply(this, [this].concat(argz));
        }
    }
};

BusinessRules.prototype.runButtonBRule = function(name, argssss) {
    var keys = null;
    var argz = Array.prototype.slice.call(arguments);
    var operator = null;
    argz.splice(0, 1);
    for (var bRule in this.brules) {
        keys = bRule.split(';');
        operator = this.getBRuleOperator(bRule);
        if (keys.indexOf('__btn') > -1 && this.bRuleEqualHandlers[operator](name, bRule)) {
            this.brules[bRule].apply(this, [this].concat(argz));
        }
    }
};

BusinessRules.prototype.runPreRules = function (entity) {
    var keys;
    for (var bRule in this.brules) {
        keys = bRule.split(';');
        if (keys.indexOf('__pre') > -1) {
            this.brules[bRule].apply(this, [this].concat(entity));
        }
    }
};

BusinessRules.prototype.runPostRules = function (entity) {
    var keys;
    for (var bRule in this.brules) {
        keys = bRule.split(';');
        if (keys.indexOf('__post') > -1) {
            this.brules[bRule].apply(this, [this].concat(entity));
        }
    }
};

BusinessRules.prototype.getBRuleOperator = function(bRuleName) {
    var operators = ['__regexp'];
    var keys = bRuleName.split(';');
    var result = '=';
    $.each(keys, function(i, key) {
        if (operators.indexOf(key) > -1) {
            result = key;
            return false;
        }
    });
    return result;
};

BusinessRules.prototype.bRuleEqualHandlers = {
    '=': function(name, bRuleName) {
        var keys = bRuleName.split(';');
        return keys.indexOf(name) > -1;
    },
    '__regexp': function(name, bRuleName) {
        var keys = bRuleName.split(';');
        var result = false;
        $.each(keys, function(i, pattern) {
            var reg = null;
            if (pattern.indexOf('__') != 0) {
                result = new RegExp(pattern).test(name);
                return !result;
            }
        });
        return result;
    }
};
