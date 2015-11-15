vvMes = {
    del: 'Are you sure you want to delete?'
};

vv = {};

vv.confirm = function(text, callback, type, title) {
    dhtmlx.confirm({
        title: title || 'Warning',
        type: type || "confirm-warning",
        text: text,
        callback: callback
    });
};