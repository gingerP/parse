define([
        './module-business.js'
    ],
    function(Business) {
        return function() {
            var api = null;
            var form = null;
            var container;
            var business = Business();
            var mappings = [
                {property: 'listKey', input: 'listKey'},
                {property: 'code', input: 'code'}
            ];

            var templateKeys = {
                addSelector: 'add_selector',
                deleteSelector: 'delete_selector',

                dataBlock: 'data_block',
                addDataBtn: 'add_data_item',
                deleteDataBtn: 'delete_data_item',
                dataSelectorContainer: 'path_selector_container',
                dataContainer: 'data_container',
                dataStyle: 'data_style',
                dataAttr: 'data_attr',
                dataHandlersAttached: 'data_handlers_attached',
                dataFormatterButton: 'data_formatter',

                pathBlock: 'path_block',
                addPathBtn: 'add_path_item',
                deletePathBtn: 'delete_path_item',
                pathSelectorContainer: 'path_selector_container',
                pathPositionContainer: 'path_position_container',
                pathPos: 'position',
                pathContainer: 'path_container',

                filterBlock: 'filter_block',
                addFilterBtn: 'add_filter_item',
                deleteFilterBtn: 'delete_filter_item',
                filterSelectorContainer: 'filter_selector_container',
                filterContainer: 'filter_container',

                selectorBlock: 'selector_block'
            };

            var containerTypes = {
                data: [
                    templateKeys.dataBlock, templateKeys.addDataBtn, templateKeys.deleteDataBtn,
                    templateKeys.dataSelectorContainer, templateKeys.dataContainer, templateKeys.dataStyle,
                    templateKeys.dataAttr, templateKeys.dataHandlersAttached
                ],
                filter: [
                    templateKeys.filterBlock, templateKeys.addFilterBtn, templateKeys.deleteFilterBtn,
                    templateKeys.filterSelectorContainer, templateKeys.filterContainer
                ],
                path: [
                    templateKeys.pathBlock, templateKeys.addPathBtn, templateKeys.deletePathBtn,
                    templateKeys.pathSelectorContainer, templateKeys.pathPositionContainer, templateKeys.pathPos,
                    templateKeys.pathContainer
                ]
            };

            var templates = {
                getLevelMappings: function() {
                  return [
                      {property: 'code', input: 'code'},
                      {property: 'listKey', input: 'listKey'}
                  ]
                },
                getDataItem: function(un) {
                    return {
                        cfg: fillUniq({
                            type: 'block', name: templateKeys.dataBlock, inputWidth: 'auto', className: 'level-block data-block', blockOffset: 10,
                            list: [
                                {type: 'button', name: templateKeys.deleteDataBtn, value: '', className: 'delete-item-min'},
                                {type: 'newcolumn'},
                                {type: 'block', width: 395, list: [
                                    {type: 'block', width: 395, list: [
                                        {type: 'input', name: 'name', label: 'Name'},
                                        {type: 'newcolumn'},
                                        {type: 'button', name: templateKeys.dataFormatterButton, value: 'Fm', className: 'formatter-item-min'}
                                    ]},
                                    {type: 'block', name: templateKeys.dataSelectorContainer, width: 390, blockOffset: 0, list: []},
                                    {type: 'combo', name: 'data_handler', label: 'Handler', required: true, readonly: true, options: templates._getItemHandlers()},
                                    {type: 'block', name: templateKeys.dataHandlersAttached, width: 390, blockOffset: 0, list: []}
                                ]}
                            ]
                        }, [un]),
                        unique: JSON.stringify([un])
                    };
                },
                getDataMappings: function() {
                    var mappings = [
                        {property: 'name', input: 'name'},
                        {property: 'handler', input: 'data_handler'},
                        {property: 'attribute', input: 'data_attr'},
                        {property: 'style', input: 'data_style'},
                        {property: 'formatter', input: 'formatter'}
                    ];
                    return mappings;
                },
                getPathItem: function(un) {
                    return {
                        cfg: fillUniq({
                            type: 'block', name: templateKeys.pathBlock, inputWidth: 'auto', className: 'level-block path-block', blockOffset: 10,
                            list: [
                                {type: 'button', name: templateKeys.deletePathBtn, value: '', className: 'delete-item-min'},
                                {type: 'newcolumn'},
                                {type: 'block', width: 395, list: [
                                    {type: 'combo', name: 'path_handler', label: 'Handler', required: true, readonly: true, options: templates._getPathHandlers()},
                                    {type: 'input', name: templateKeys.pathPos, label: 'Position'},
                                    {type: 'block', name: templateKeys.pathSelectorContainer, width: 390, blockOffset: 0, list: []}
                                ]}
                            ]
                        }, [un]),
                        unique: JSON.stringify([un])
                    };
                },
                getPathMappings: function() {
                    var mappings = [
                        {property: 'type', input: 'path_handler'},
                        {property: 'pos', input: 'position'}
                    ];
                    return mappings;
                },
                getFilterItem: function(un) {
                    return {
                        cfg: fillUniq({
                            type: 'block', name: templateKeys.filterBlock, inputWidth: 'auto', className: 'level-block filter-block', blockOffset: 10,
                            list: [
                                {type: 'button', name: templateKeys.deleteFilterBtn, value: '', className: 'delete-item-min'},
                                {type: 'newcolumn'},
                                {type: 'block', width: 395, list: [
                                    {type: 'block', name: templateKeys.filterSelectorContainer, width: 390, blockOffset: 0, list: []}
                                ]}
                            ]
                        }, [un]),
                        unique: JSON.stringify([un])
                    }
                },
                getFilterMappings: function() {
                    var mappings = [];
                    return mappings;
                },
                getSelectorItem: function(parentUn, un, isFirst) {
                    return {
                        cfg: fillUniq({
                            type: 'block', name: templateKeys.selectorBlock,  blockOffset: 0, width: 390, offsetLeft: !isFirst? 60: 0,
                            list: [
                                {type: 'input', name: 'selector', label: isFirst? 'Selector': '', inputWidth: 300, rows: 3},
                                {type: 'newcolumn'},
                                isFirst
                                    ? {type: 'button', name: templateKeys.addSelector, value: '', className: 'add-item-min'}
                                    : {type: 'button', name: templateKeys.deleteSelector, value: '', className: 'delete-item-min'}
                            ]
                        }, [parentUn, un]),
                        unique: JSON.stringify([parentUn, un])
                    }
                },
                getSelectorMappings: function() {
                    var mappings = [
                        {property: 'selector', input: 'selector'}
                    ];
                    return mappings;
                },
                getDataStyle: function(unique) {
                    unique = Array.isArray(unique)? unique: [unique];
                    return {
                        cfg: fillUniq({type: 'input', name: templateKeys.dataStyle, label: 'Style name'}, unique),
                        unique: JSON.stringify(unique)
                    }
                },
                getDataAttr: function(unique) {
                    unique = Array.isArray(unique)? unique: [unique];
                    return {
                        cfg: fillUniq({type: 'input', name: templateKeys.dataAttr, label: 'Attribute value'}, unique),
                        unique: JSON.stringify(unique)
                    }
                },
                _getItemHandlers: function() {
                    return [
                        {value: 'val', text: 'Inner Html'},
                        {value: 'attribute', text: 'Attribute Value'},
                        {value: 'style', text: 'Style'},
                        {value: 'notNull', text: 'Not NULL'}
                    ]
                },
                _getPathHandlers: function() {
                    return [
                        {value: 'sibl', text: 'Siblings'},
                        {value: 'up', text: 'Up by DOM'},
                        {value: 'down', text: 'Down by DOM'}
                    ]
                },
                _getFilterHandlers: function() {
                    return [
                        ['sel', 'Selector (is Exist)']
                    ]
                },
                getMappingsByType: function(type) {
                    var mappings = {
                        data: templates.getDataMappings,
                        path: templates.getPathMappings,
                        filter: templates.getFilterMappings,
                        selector: templates.getSelectorMappings,
                        level: templates.getLevelMappings
                    };
                    return typeof(mappings[type]) == 'function'? mappings[type](): [];
                }
            };

            var action = {
                addPath: function(data) {
                    if (!data) {
                        data = business.action.add('path');
                    } else {
                        business.handleEntity(data, 'path');
                    }
                    formHandlers.addPath(data);
                },
                addFilter: function(data) {
                    if (!data) {
                        data = business.action.add('filter');
                    } else {
                        business.handleEntity(data, 'filter');
                    }
                    formHandlers.addFilter(data);
                },
                addData: function(data) {
                    if (!data) {
                        data = business.action.add('data');
                    } else {
                        business.handleEntity(data, 'data');
                    }
                    formHandlers.addData(data);                },
                addSelector: function(type, data, parentUn, isFirst) {
                    if (!data) {
                        data = business.action.addSelector(parentUn);
                    } else {
                        business.handleEntity(data, 'selector', [parentUn]);
                    }
                    formHandlers.addSelector(type, data, parentUn, isFirst);
                },
                deletePath: function(un) {
                    business.action.remove('path', un);
                    formHandlers.deletePath(un);
                },
                deleteFilter: function(un) {
                    business.action.remove('filter', un);
                    formHandlers.deleteFilter(un);
                },
                deleteData: function(un) {
                    business.action.remove('data', un);
                    formHandlers.deleteData(un);
                },
                deleteSelector: function(un) {
                    if (un && un.length > 1) {
                        business.action.removeSelector(un[1]);
                    }
                    formHandlers.deleteSelector(un);
                },
                addDataStyle: function(form, key) {
                },
                deleteDataStyle: function(form, key) {
                },
                addDataAttr: function(form, key) {
                },
                deleteDataAttr: function(form, key) {
                },
                addPathPosition: function(form, key) {
                },
                deletePathPosition: function(form, key) {
                }
            };

            var formHandlers = {
                addPath: function(data) {
                    var un = business.getDataUn(data);
                    var template = templates.getPathItem(un);
                    form.form.addItem('path_container', {type: 'newcolumn'});
                    form.form.addItem('path_container', template.cfg);
                    fillBlockData(data, templates.getPathMappings(), un);
                    if (data.selectors && data.selectors.length) {
                        $.each(data.selectors, function (i, selector) {
                            action.addSelector('path', selector, un, !i);
                        })
                    } else {
                        action.addSelector('path', null, un, true);
                    }
                    return template;
                },
                addFilter: function(data) {
                    var un = business.getDataUn(data);
                    var template = templates.getFilterItem(un);
                    form.form.addItem('filter_container', {type: 'newcolumn'});
                    form.form.addItem('filter_container', template.cfg);
                    fillBlockData(data, templates.getFilterMappings(), un);
                    if (data.selectors && data.selectors.length) {
                        $.each(data.selectors, function (i, selector) {
                            action.addSelector('filter', selector, un, !i);
                        })
                    } else {
                        action.addSelector('filter', null, un, true);
                    }
                    return template;
                },
                addData: function(data) {
                    var un = business.getDataUn(data);
                    var template = templates.getDataItem(un);
                    form.form.addItem('data_container', {type: 'newcolumn'});
                    form.form.addItem('data_container', template.cfg);
                    fillBlockData(data, templates.getDataMappings(), un);
                    if (data.selectors && data.selectors.length) {
                        $.each(data.selectors, function (i, selector) {
                            action.addSelector('data', selector, un, !i);
                        })
                    } else {
                        action.addSelector('data', null, un, true);
                    }
                    return template;
                },
                addSelector: function(type, data, parentUn, isFirst) {
                    var template = null;
                    var container = getSelectorContainerByType(type, parentUn);
                    var selUn = business.getDataUn(data);
                    template = templates.getSelectorItem(parentUn, selUn, isFirst);
                    form.form.addItem(container, template.cfg);
                    fillBlockData(data, templates.getSelectorMappings(), [parentUn, selUn]);
                    return template;
                },
                deletePath: function(un) {
                    var blockName = getMultiName(templateKeys.pathBlock, un);
                    form.form.removeItem(blockName);
                },
                deleteFilter: function(un) {
                    var blockName = getMultiName(templateKeys.filterBlock, un);
                    form.form.removeItem(blockName);
                },
                deleteData: function(un) {
                    var blockName = getMultiName(templateKeys.dataBlock, un);
                    form.form.removeItem(blockName);
                },
                deleteSelector: function(un) {
                    var blockName = getMultiName(templateKeys.selectorBlock, un);
                    form.form.removeItem(blockName);
                },
                addDataStyle: function(form, key) {
                    var dataStyle = templates.getDataStyle(key);
                    var container = getMultiName(templateKeys.dataHandlersAttached, key);
                    if (!form.form.isItem(dataStyle.cfg.name)) {
                        form.form.addItem(container, dataStyle.cfg);
                    }
                },
                deleteDataStyle: function(form, key) {
                    var styleName = getMultiName(templateKeys.dataStyle, key);
                    form.form.removeItem(styleName);
                },
                addDataAttr: function(form, key) {
                    var dataAttr = templates.getDataAttr(key);
                    var container = getMultiName(templateKeys.dataHandlersAttached, key);
                    if (!form.form.isItem(dataAttr.cfg.name)) {
                        form.form.addItem(container, dataAttr.cfg);
                    }
                },
                deleteDataAttr: function(form, key) {
                    var attrName = getMultiName(templateKeys.dataAttr, key);
                    form.form.removeItem(attrName);
                },
                addPathPosition: function(form, key) {
                    var pathPos = templates.getPathPosition(key);
                    var container = getMultiName(templateKeys.pathPositionContainer, key);
                    if (!form.form.isItem(pathPos.cfg.name)) {
                        form.form.addItem(container, pathPos.cfg);
                    }
                },
                deletePathPosition: function(form, key) {
                    var pathPos = getMultiName(templateKeys.pathPos, key);
                    form.form.removeItem(pathPos);
                }
            };

            function fillMappings(mappings, un) {
                $.each(mappings, function(i, mappingz) {
                    mappingz.input = createMultiName(mappingz.input, un);
                });
                return mappings;
            }

            function fillBlockData(data, mappings, un) {
                var mappingz = [];
                $.extend(true, mappingz, mappings);
                un = Array.isArray(un)? un: [un];
                mappingz = fillMappings(mappingz, un);
                form.fillFormData(data, mappingz);
            }

            function getSelectorContainerName(fieldName) {
                return getContainerName(fieldName, [templateKeys.pathSelectorContainer, templateKeys.filterSelectorContainer, templateKeys.dataSelectorContainer]);
            }

            function getContainerName(fieldName, containers) {
                var keys = extMultiKey(fieldName);
                var result = null;
                var existContainers = containers || [templateKeys.filterBlock, templateKeys.dataBlock, templateKeys.pathBlock, templateKeys.dataSelectorContainer];
                if (keys && keys.length) {
                    $.each(existContainers, function (i, container) {
                        var name = getMultiName(container, [keys[0]]);
                        if (form.form.isItem(name)) {
                            result = name;
                            return false;
                        }
                    });
                }
                return result;
            }

            function getMultiName(name, unique) {
                var keys = extMultiKey(name);
                var nakedName = null;
                if (keys && keys.length) {
                    if (keys.indexOf(unique[0]) != 0) {
                        keys.unshift(unique[0]);
                        nakedName = extMultiName(name);
                        return nakedName + '__' + JSON.stringify(keys);
                    } else {
                        return name;
                    }
                }
                return createMultiName(name, unique);
            }

            function getSelectorContainerByType(type, un) {
                var containers = {
                    data: templateKeys.dataSelectorContainer,
                    path: templateKeys.pathSelectorContainer,
                    filter: templateKeys.filterSelectorContainer
                };
                return createMultiName(containers[type], un);
            }

            function getContainerType(name) {
                var result;
                for(var key in containerTypes) {
                    if (containerTypes[key].indexOf(name) > -1) {
                        result = key;
                    }
                }
                return result;
            }

            function createMultiName(name, un) {
                un = Array.isArray(un)? un: [un];
                return name + '__' + JSON.stringify(un);
            }

            function extMultiKey(name) {
                var res = name.split('__');
                if (res.length > 1) {
                    return JSON.parse(res[1]);
                }
                return null;
            }

            function extMultiName(name) {
                var res = name.split('__');
                if (res.length) {
                    return res[0];
                }
                return null;
            }

            function fillUniq(config, uniques) {
                if (config && (!config.hasOwnProperty('name') && !config.hasOwnProperty('list'))) {
                    return config;
                }
                if (!Array.isArray(config)) {
                    if (config.hasOwnProperty('name')) {
                        config.name = getMultiName(config.name, uniques);
                    }
                    if (config.list && config.list.length) {
                        _fillUniqueArray(config.list, uniques);
                    }
                } else {
                    _fillUniqueArray(config, uniques);
                }
                return config;
            }

            function _fillUniqueArray(list, unique) {
                $.each(list, function(i, cfg) {
                    fillUniq(cfg, unique);
                })
            }

            function initForm(container, index) {
                var formConfig = [
                    {type: 'settings', inputWidth: 300, labelWidth: 60, labelAlign: 'left'},
                    {type: 'block', width: 'auto', blockOffset: 8, list: [
                        {type: 'input', name: 'code', label: 'Code', validate: validateCode},
                        {type: 'input', name: 'listKey', label: 'List key'},
                        {type: 'fieldset', label: 'Pathes', offsetLeft: 0, width: 'auto', className: 'top-border', list: [
                            {type: 'button', name: templateKeys.addPathBtn, value: '', className: 'add-item', offsetTop: 16},
                            {type: 'newcolumn'},
                            {type: 'block', name: templateKeys.pathContainer, blockOffset: 6, width: 'auto', list: []}
                        ]},
                        {type: 'fieldset', label: 'Filters', offsetLeft: 0, width: 'auto', className: 'top-border', list: [
                            {type: 'button', name: templateKeys.addFilterBtn, value: '', className: 'add-item', offsetTop: 16},
                            {type: 'newcolumn'},
                            {type: 'block', name: templateKeys.filterContainer, blockOffset: 6, width: 'auto', list: []}
                        ]},
                        {type: 'fieldset', label: 'Data', offsetLeft: 0, width: 'auto', className: 'top-border', list: [
                            {type: 'button', name: templateKeys.addDataBtn, value: '', className: 'add-item', offsetTop: 16},
                            {type: 'newcolumn'},
                            {type: 'block', name: templateKeys.dataContainer, blockOffset: 6, width: 'auto', list: []}
                        ]}
                    ]}
                ];
                var form;
                var vController;
                var vForm;
                form = container.attachForm(formConfig);
                vController = new FormController().init();
                vForm = new FormComponent().init(form, vController).initEvents();
                initFormBRules(vForm, container);
                return vForm;
            }

            function initFormBRules(form, container) {
                var brules = {};
                form.addBRules({
                    'code': function(form) {
                        var code = form.form.getItemValue('code');
                        container.setText(code);
                    },
                    //ADD SELECTOR
                    '__btn;__regexp;^add_selector.*': function(form, name) {
                        //type, data, parentUn, isFirst
                        var un = extMultiKey(name);
                        var containerName = getContainerName(name);
                        var nakedContainerName = extMultiName(containerName);
                        var type = getContainerType(nakedContainerName);
                        action.addSelector(type, null, un[0]);
                    },
                    //ADD BLOCK
                    '__btn;add_path_item': function(form, name) {
                        action.addPath();
                    },
                    '__btn;add_filter_item': function(form, name) {
                        action.addFilter();
                    },
                    '__btn;add_data_item': function(form, name) {
                        action.addData();
                    },
                    //DELETE BLOCK
                    '__btn;__regexp;^delete_path_item.*': function(form, name) {
                        vv.confirm(vvMes.del, function(res) {
                            if (res) {
                                var un = extMultiKey(name);
                                action.deletePath(un);
                            }
                        });
                    },
                    '__btn;__regexp;^delete_filter_item.*': function(form, name) {
                        vv.confirm(vvMes.del, function(res) {
                            if (res) {
                                var un = extMultiKey(name);
                                action.deleteFilter(un);
                            }
                        });
                    },
                    '__btn;__regexp;^delete_data_item.*': function(form, name) {
                        vv.confirm(vvMes.del, function(res) {
                            if (res) {
                                var un = extMultiKey(name);
                                action.deleteData(un);
                            }
                        });
                    },
                    //DELETE SELECTOR
                    '__btn;__regexp;^delete_selector.*': function(form, name) {
                        var un = extMultiKey(name);
                        action.deleteSelector(un);
                    },
                    //HANDLERS
                    '__regexp;^data_handler.*': function(form, name) {
                        var key = extMultiKey(name);
                        var combo = form.form.getCombo(name);
                        var handler =  combo.getSelectedValue();
                        if (handler == 'style') {
                            formHandlers.addDataStyle(form, key);
                            formHandlers.deleteDataAttr(form, key);
                        } else if (handler == 'attribute') {
                            formHandlers.addDataAttr(form, key);
                            formHandlers.deleteDataStyle(form, key);
                        } else {
                            formHandlers.deleteDataAttr(form, key);
                            formHandlers.deleteDataStyle(form, key);
                        }
                    },
                    '__regexp;^path_handler.*': function(form, name) {

                    }
                });
            }

            function initDefaultState(form) {
                action.addData();
                action.addFilter();
                action.addPath();
            }

            function setData(data) {
                var code = data.code;
                clear();
                business.setData(data, code);
                form.fillFormData(data, mappings);
                if (data.path && data.path.length) {
                    $.each(data.path, function(i, path) {
                        action.addPath(path);
                    })
                }

                if (data.data && data.data.length) {
                    $.each(data.data, function(i, data) {
                        action.addData(data);
                    })
                }

                if (data.filter && data.filter.length) {
                    $.each(data.filter, function(i, filter) {
                        action.addFilter(filter);
                    })
                }
            }

            function updateData() {
                return business.getData();
            }

            function clear() {
                var blocks = [templateKeys.dataBlock, templateKeys.filterBlock, templateKeys.pathBlock];
                form.form.forEachItem(function(name) {
                    var nakedName = extMultiName(name);
                    if (blocks.indexOf(nakedName) > -1) {
                        form.form.removeItem(name);
                    }
                })
            }

            function validateCode() {
                return true;
            }

            function updateDataByMapping(entity, unKeys, type) {
                var mappings = templates.getMappingsByType(type);
                var filledMappings;
                var formData = form.form.getFormData();
                if (mappings && mappings.length) {
                    filledMappings = type !== 'level'? fillMappings(mappings, unKeys): mappings;
                    form.fillEntity(entity, filledMappings, formData);
                }
            }

            api = {
                init: function(_container, index, withDefaultState) {
                    container = _container;
                    form = initForm(container, index);
                    if (withDefaultState) {
                        initDefaultState(form);
                    }
                    business.setView(api);
                    return api;
                },
                getCode: function() {
                    return form.form.getItemValue('code');
                },
                getData: function() {
                    return updateData();
                },
                setData: function(levelData) {
                    setData(levelData);
                    container.setText(levelData.code);
                    return api;
                },
                getComponent: function() {
                    return form;
                },
                clear: function() {
                    clear();
                    return api;
                },
                addCodeListener: function(listener) {
                    form.addBRules({
                        'code': function(form, name, value) {
                            listener(business.getPermanentCode(), value);
                        }
                    });
                    return api;
                },
                updateDataByMapping: function(entity, unKeys, type) {
                    return updateDataByMapping(entity, unKeys, type);
                }
            };
            return api;
        }
    }
);