define([],
    function() {
        var api;
        var prefix = '/api/';
        function message(message, type) {
            var mesType = 'alert-info';
            if (type == 'error') {
                mesType = 'alert-error';
            }
            dhtmlx.alert({
                title: 'Error',
                type: mesType,
                text: message
            });
        }
        function onSuccess(callback, result) {
            if (typeof(callback) == 'object') {
                if (typeof(callback.onSuccess) == 'function') {
                    callback.onSuccess(result.onSuccess);
                }
            } else if (typeof(callback) == 'function') {
                callback(result.onSuccess);
            }
        }

        function onError(callback, result) {
            message(result.onError, 'error');
            if (typeof(callback) == 'object') {
                if (typeof(callback.onError) == 'function') {
                    callback.onError(result.onError);
                }
            } else if (typeof(callback) == 'function') {
                //what am I supposed to do?
            }
        }

        function load(url, callback, data) {
            $.ajax({
                method: 'POST',
                data: data,
                url: prefix + url,
                success: function(result, status, xhr) {
                    if (result.hasOwnProperty('onError')) {
                        onError(callback, result, status, xhr)
                    } else if (result.hasOwnProperty('onSuccess')) {
                        onSuccess(callback, result, status, xhr);
                    }
                },
                error: function(xhr,status,error) {
                    onError(callback, error);
                }
            })
        }
        api = {
            load: function(url, callback, data) {
                load(url, callback, data);
                return api;
            }
        };
        return api;
    }
);
