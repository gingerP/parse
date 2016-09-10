'use strict';

var assert = require('assert');
var logger = _req('src/js/logger').create('DB Validation');


var messages = {
    notEmpty: 'Collection name cannot be empty!',
    criteriaNotEmpty: 'Criteria cannot be empty!',
    invalidConnectionProperty: 'Invalid DB connection properties: %s'
};

module.exports = {
    collectionName: function (collName) {
        assert.notEqual(collName, null, messages.notEmpty);
        assert.notEqual(collName, '', messages.notEmpty);
        assert.notEqual(collName, undefined, messages.notEmpty);
    },
    criteria: function (criteria) {
        assert.notEqual(criteria, null, messages.criteriaNotEmpty);
        assert.notEqual(criteria, undefined, messages.criteriaNotEmpty);
    },
    connection: function () {

    },
    connectionProperties: function (config) {
        var reg = /^[\w_\-!\@\|\#\$\%\^\&\*\(\)]{2,}$/g;
        var keys = ['user', 'pass', 'host', 'port', 'dbName'];
        var reason;
        var isValid = keys.every(function (key) {
            var value = config[key];
            var isValidValue = true;
            if (!value || typeof(value) !== 'string' || !reg.test(value)) {
                reason = key + ' "' + value + '" is empty\n';
                isValidValue = false;
            }
            return isValidValue;
        });
        if (!isValid) {
            logger.error(messages.invalidConnectionProperty, reason);
        }
        assert(isValid, true);
    }
};

