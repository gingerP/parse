define([],function(){return function(){function m(){f.handleRemovedItems(g);$.each(d,function(a,b){var c=e.getDataParents(b)||[];c.push(e.getDataUn(b));h.updateDataByMapping(b,c,e.getDataType(b))});h.updateDataByMapping(g,[],"level");return g}var e,k,g={},d={},h,l={filter:function(){return{selectors:[]}},path:function(){return{type:null,pos:null,selectors:[]}},data:function(){return{name:null,selectors:[],handler:null,attribute:null,style:null,formatter:null}},selector:function(){return{selector:null}}},
f={add:function(a){var b=l[a]();g[a]=g[a]||[];g[a].push(b);e.handleEntity(b,a);return b},remove:function(a,b){var c=Array.isArray(b)?b[0]:b;d[c]._remove_=!0;delete d[c]},removeSelector:function(a){d[a]._remove_=!0;delete d[a]},addSelector:function(a){var b;d[a]&&(d[a].selectors=d[a].selectors||[],b=l.selector(),d[a].selectors.push(b),e.handleEntity(b,"selector",[a]));return b},handleRemovedItems:function(a){var b,c;if(Array.isArray(a))for(b=a.length-1;-1<b;)c=a[b],U.isObject(c)&&(n.isRemoved(c)?a.splice(b,
1):f.handleRemovedItems(c)),b--;else $.each(a,function(a,b){U.isObject(b)&&f.handleRemovedItems(b)})}},n={isRemoved:function(a){return!!a._remove_}};return e={setView:function(a){h=a;return e},action:{add:function(a,b){return f.add(a,b)},remove:function(a,b){f.remove(a,b);return e},addSelector:function(a){return f.addSelector(a)},removeSelector:function(a){f.removeSelector(a);return e}},getData:function(){f.handleRemovedItems(g);return m()},getPermanentCode:function(){return k},setData:function(a,
b){g=a;k=b;return e},handleEntity:function(a,b,c){a.hasOwnProperty("_un")||(a._un=U.getRandomString(),a._parents=c||[],a._type=b,d[a._un]=a)},getDataUn:function(a){return a._un},getDataParents:function(a){return a._parents},getDataType:function(a){return a._type}}}});