U={hasContent:function(a){return"string"==typeof a?null!=a&&""!=a:null!=a&&this.isArray(a)?0<a.length:"undefined"!=typeof a?null!=a&&Object.keys(a).length:!1},isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)},cleanStr:function(a){return this.hasContent(a)?a.trim():""},merge:function(a,c){for(var b in c)try{a[b]=c[b].constructor==Object?this.merge(a[b],c[b]):c[b]}catch(d){a[b]=c[b]}return a},changeUrlH5:function(a){window.history.pushState(null,null,a)},isArray:function(a){return"function"==
typeof Array.isArray?Array.isArray(a):"[object Array]"===Object.prototype.toString.call(a)},getRandomString:function(){return Math.random().toString(36).substring(7)},getDeepValue:function(a,c){var b=0;c=c.split(".");for(var d=c.length;b<d;b++)a=a[c[b]];return a},setDeepValue:function(a,c,b){c=c.split(".");var d;b=b||{};for(var e=0;e<c.length;e++)d=c[e],e==c.length-1?b[d]=a:(b[d]=b[d]||{},b=b[d])},isObject:function(a){return"object"===typeof a&&null!==a}};
