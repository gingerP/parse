vvMes = {
    del: 'Are you sure you want to delete?'
};

vv = {
    log: 'debug',
    _sys_: {
        console: {}
    }
};

if (vv.log === 'debug') {
    vv._sys_.console.warn = console.warn;
    console.warn = function(value) {
        var index = 1;
        var argz = arguments;
        var result = value.replace('%s', function() {
            if (argz.length >= index) {
                return argz[index];
            }
            return '';
        });
        if (typeof(dhtmlx.message) === 'function' && typeof(value) === 'string') {
            dhtmlx.message.position = "bottom";
            dhtmlx.message({
                type: "warning",
                text: result
            });
        }
        vv._sys_.console.warn.apply(console, argz);
    }
}

vv.confirm = function(text, callback, type, title) {
    dhtmlx.confirm({
        title: title || 'Warning',
        type: type || "confirm-warning",
        text: text,
        callback: callback
    });
};

