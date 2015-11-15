U = {
    hasContent: function(obj) {
        if (typeof(obj) == 'string') {
            return obj != null && obj != '';
        } else if (obj != null && this.isArray(obj)) {
            return obj.length > 0;
        } else if (typeof(obj) != 'undefined') {
            return obj != null && Object.keys(obj).length;
        }
        return false;
    },
    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    cleanStr: function(str) {
        return this.hasContent(str)? str.trim(): '';
    },
    /*
     * Recursively merge properties of two objects
     */
    merge: function(obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if ( obj2[p].constructor==Object ) {
                    obj1[p] = this.merge(obj1[p], obj2[p]);

                } else {
                    obj1[p] = obj2[p];

                }

            } catch(e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];

            }
        }
        return obj1;
    },
    changeUrlH5: function(url) {
        window.history.pushState(null, null, url);
    },
    isArray: function(arr) {
        if (typeof(Array.isArray) == 'function') {
            return Array.isArray(arr);
        } else {
            return Object.prototype.toString.call(arr) === '[object Array]';
        }
    },
    getRandomString: function() {
        return Math.random().toString(36).substring(7);
    },
    getDeepValue: function(obj, path){
        for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
            obj = obj[path[i]];
        };
        return obj;
    },
    setDeepValue: function(value, path, dest) {
        var keys = path.split('.');
        var key;
        dest = dest || {};
        for (var index = 0; index < keys.length; index++) {
            key = keys[index];
            if (index == keys.length - 1) {
                dest[key] = value;
            } else {
                dest[key] = dest[key] || {};
                dest = dest[key];
            }
        }
    },
    isObject: function(obj) {
        return typeof(obj) === 'object' &&  obj !== null;
    }
};


