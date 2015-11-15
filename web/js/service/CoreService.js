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
        function load(url, callback, data) {
            $.ajax({
                method: 'POST',
                data: data,
                url: prefix + url,
                success: function(result, status, xhr) {
                    if (result.onError) {
                        message(result.onError, 'error');
                    } else if (result.onSuccess) {
                        callback(result.onSuccess);
                    }
                },
                error: function(xhr,status,error) {
                    message(error, 'error');
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
