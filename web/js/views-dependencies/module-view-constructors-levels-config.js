define([],
    function() {
        var id = U.getRandomString();
        var root = 'root_' + U.getRandomString();
        var key = 'levels-config';
        var api;
        var tree;
        var entity;

        function createTree(container) {
            var tree = new dhtmlXTreeObject(container, "100%", "100%", root);
            tree.allTree.className += ' ' + key;
            tree.enableDragAndDrop(true);
            tree.setDragBehavior('complex');
            return tree;
        }

        function codeListener(code, newValue) {
            var item = handler.getUserData(code);
            var data;
            if (item) {
                data = handler.getUserData(code);
                data.node = newValue;
                handler.setUserData(code, data);
                handler.refreshRow(code, data);
            }
        }

        var action = {
            add: function(parent, data) {
                var rowId = handler.getId(data);
                tree.insertNewItem(
                    U.hasContent(parent)? handler.getId(parent): root,
                    rowId,
                    handler.getText(data)
                );
                handler.setUserData(rowId, data);
                return action;
            },
            removeAll: function() {
                tree.deleteChildItems(root);
            },
            removeOnlyItem: function(code) {
                var children = tree.getSubItems(code);
                children = children.split(',');
                $.each(children, function(i, itemCode) {
                    tree.moveItem(itemCode, 'up_strict');
                });
                tree.deleteItem(code);
                return action;
            },
            remove: function(code) {
                tree.deleteItem(code);
                return action;
            },
            new: function () {
                return {
                    node: null,
                    children: []
                }
            }
        };

        var handler = {
            getId: function(entity) {
                return U.hasContent(entity.node)? entity.node: null;
            },
            getText: function (entity) {
                return U.hasContent(entity.node)? entity.node: '';
            },
            setUserData: function(code, data) {
                tree.setUserData(code, 'dyn', data);
            },
            getUserData: function(code) {
                return tree.getUserData(code, 'dyn');
            },
            validate: function() {

            },
            refreshRow: function(code, data) {
                tree.setItemText(code, handler.getText(data));
            }
        };

        function setData(data) {
            entity = data;
            if (U.hasContent(data)) {
                _setData(null, data);
            }
        }

        function getData() {
            var result;
            var firstLevel = tree.getSubItems(root);
            var entity;
            firstLevel = firstLevel.split(',');
            if (firstLevel.length) {
                //first level must contain only one item
                result = handler.getUserData(firstLevel[0]);
                result.children = _getData(firstLevel[0]);
            }
            return result;
        }

        function _getData(parentCode) {
            var result = [];
            var children = tree.getSubItems(parentCode);
            children = U.hasContent(children)? children.split(';'): [];
            if (children.length) {
                $.each(children, function(i, childCode) {
                    var child = handler.getUserData(childCode);
                    child.children = [];
                    result.push(child);
                    if (tree.hasChildren(childCode)) {
                        child.children = _getData(childCode);
                    }
                })
            }
            return result;
        }

        function _setData(parent, entity) {
            action.add(parent, entity);
            if (entity.children && entity.children.length) {
                $.each(entity.children, function(i, item) {
                    _setData(entity, item);
                })
            }
        }

        api = {
            init: function() {
                return api;
            },
            getData: function() {
                return getData();
            },
            setData: function(data) {
                setData(data);
                return api;
            },
            addItem: function(code) {
                action.add(null, {node: code});
                return api;
            },
            removeItem: function(code) {
                action.removeOnlyItem(code);
                return api;
            },
            removeAll: function() {
                action.removeAll();
                return api;
            },
            setForm: function(container) {
                tree = createTree(container);
                return api;
            },
            getCodeListener: function() {
                return codeListener;
            }
        };
        return api;
    }
);