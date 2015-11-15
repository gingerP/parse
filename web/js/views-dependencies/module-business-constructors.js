define([],
    function() {
        return function() {
            var api;
            var permanentCode;
            var entity = {};
            var horEntity = {};
            var view;
            var types = ['data', 'path', 'filter'];
            var domain = {
                filter: function() {
                    return {selectors: []};
                },
                path: function() {
                    return {type: null, pos: null, selectors: []};
                },
                data: function() {
                    return {name: null, selectors: [], handler: null, attr: null, style: null, formatter: null};
                },
                selector: function() {
                    return {sel: null};
                }
            };
            var entityAction = {
                add: function (type) {
                    var data = domain[type]();
                    entity[type] = entity[type] || [];
                    entity[type].push(data);
                    api.handleEntity(data, type);
                    return data;
                },
                remove: function (type, id) {
                    var un = Array.isArray(id) ? id[0] : id;
                    horEntity[un]._remove_ = true;
                    delete horEntity[un];
                },
                removeSelector: function(parentId, id) {
                    horEntity[id]._remove_ = true;
                    delete horEntity[id];
                },
                addSelector: function (parentId) {
                    var selector;
                    if (horEntity[parentId]) {
                        horEntity[parentId].selectors = horEntity[parentId].selectors || [];
                        selector = domain.selector();
                        horEntity[parentId].selectors.push(selector);
                        api.handleEntity(selector, 'selector', [parentId]);
                    }
                    return selector;
                },
                handleRemovedItems: function(entity) {
                    if (Array.isArray(entity)) {
                        $.each(entity, function(i, item) {
                            if (check.isRemoved(item)) {
                                entity.splice(i, 1);
                            }
                        })
                    } else {
                        $.each(entity, function(key, item) {
                            entityAction.handleRemovedItems(item);
                        })
                    }
                }
            };

            var check = {
                isRemoved: function(entity) {
                    return !!entity._remove_;
                }
            };

            function updateData() {
                entityAction.handleRemovedItems(entity);
                $.each(horEntity, function(key, value) {
                    var keys = api.getDataParents(value) || [];
                    keys.push(api.getDataUn(value));
                    view.updateDataByMapping(value, keys, api.getDataType(value));
                });
                return entity;
            }

            api = {
                setView: function(module) {
                    view = module;
                    return api;
                },
                action: {
                    add: function(type, id) {
                        return entityAction.add(type, id);
                    },
                    remove: function(type, id) {
                        entityAction.remove(type, id);
                        return api;
                    },
                    addSelector: function(parentId) {
                        return entityAction.addSelector(parentId);
                    },
                    removeSelector: function(id) {
                        entityAction.removeSelector(id);
                        return api;
                    }
                },
                getData: function() {
                    entityAction.handleRemovedItems(entity);
                    return updateData();
                },
                getPermanentCode: function() {
                    return permanentCode;
                },
                setData: function(data, _code) {
                    entity = data;
                    permanentCode = _code;
                    return api;
                },
                handleEntity: function(entity, type, parents) {
                    if (!entity.hasOwnProperty('_un')) {
                        entity._un = U.getRandomString();
                        entity._parents = parents || [];
                        entity._type = type;
                        horEntity[entity._un] = entity;
                    }
                },
                getDataUn: function(data) {
                    return data._un;
                },
                getDataParents: function(data) {
                    return data._parents;
                },
                getDataType: function(data) {
                    return data._type;
                }
            };
            return api;
        }
    }
);