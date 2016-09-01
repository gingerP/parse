(function() {
    'use strict';

    function GenericTrick() {}

    GenericTrick.prototype.handleRequest = function(request) {
        return this;
    };

    GenericTrick.prototype.handleResponse = function(response) {
        return this;
    };

    module.exports = GenericTrick;

})();