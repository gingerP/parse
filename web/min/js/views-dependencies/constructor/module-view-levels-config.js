define([],function(){function l(a,b){var c;f.getUserData(a)&&(c=f.getUserData(a),c.node=b,f.setUserData(a,c),f.refreshRow(a,c))}function m(a){U.hasContent(a)&&$.each(a,function(a,c){h(null,c)})}function n(){var a=[],b=c.getSubItems(g);U.hasContent(b)&&(b=b.split(","),b.length&&$.each(b,function(b,c){var d=f.getUserData(c);U.hasContent(d)?(d.children=k(c),a.push(d)):console.warn('Incorrect level code "%s"',c)}));return a}function k(a){var b=[];a=c.getSubItems(a);a=U.hasContent(a)?a.split(","):[];a.length&&
$.each(a,function(a,d){var e=f.getUserData(d);e.children=[];b.push(e);c.hasChildren(d)&&(e.children=k(d))});return b}function h(a,b){d.add(a,b);b.children&&b.children.length&&$.each(b.children,function(a,c){h(b,c)})}U.getRandomString();var g="root_"+U.getRandomString(),e,c,d={add:function(a,b){var e=f.getId(b);c.insertNewItem(U.hasContent(a)?f.getId(a):g,e,f.getText(b));f.setUserData(e,b);return d},removeAll:function(){c.deleteChildItems(g)},removeOnlyItem:function(a){var b=c.getSubItems(a);b&&(b=
b.split(","),$.each(b,function(a,b){c.moveItem(b,"up")}));c.deleteItem(a);return d},remove:function(a){c.deleteItem(a);return d},"new":function(){return{node:null,children:[]}}},f={getId:function(a){return U.hasContent(a.node)?a.node:null},getText:function(a){return U.hasContent(a.node)?a.node:""},setUserData:function(a,b){c.setUserData(a,"dyn",b)},getUserData:function(a){return c.getUserData(a,"dyn")},validate:function(){},refreshRow:function(a,b){c.setItemText(a,f.getText(b))}};return e={init:function(){return e},
getData:function(){return n()},setData:function(a){m(a);return e},addItem:function(a){d.add(null,{node:a});return e},removeItem:function(a){d.removeOnlyItem(a);return e},removeAll:function(){d.removeAll();return e},setForm:function(a){a=new dhtmlXTreeObject(a,"100%","100%",g);a.allTree.className+=" levels-config";a.enableDragAndDrop(!0);a.setDragBehavior("complex");c=a;return e},getCodeListener:function(){return l}}});
