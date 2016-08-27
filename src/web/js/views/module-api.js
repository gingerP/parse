define([
        'service/ApiConstructorService',
        'service/ConstructorService',
        'views-dependencies/module-view-test-data-viewer',
        'ace/ace'
    ],
    function(ApiConstructorService, ConstructorService, parseDataViewer){
        var api;
        var container;
        var layout;
        var form;
        var list;
        var toolbar;
        var manager = {
            api: new DataManager(ApiConstructorService.instance),
            constructor: new DataManager(ConstructorService.instance)
        };
        var listPromises = [
            function() {
                return new Promise(function (resolve, reject) {
                    var combo = form.form.getCombo('config');
                    manager.constructor.list(function (data) {
                        var options = [];
                        $.each(data, function (index, item) {
                            options.push([item.code, item.code + ' (' + item.url + ')']);
                        });
                        combo.clearAll();
                        combo.addOption(options);
                        resolve();
                    }, [
                        {property: 'code', input: 'code'},
                        {property: 'url', input: 'url'}
                    ])
                })
            }
        ];
        var action = {
            loadEntity: function(id, callback) {
                container.progressOn();
                manager.api.get(id, function(data) {
                    container.progressOff();
                    callback(data);
                });
            },
            add: function() {
                var data = manager.api.createNewEntity();
                list.addRow(data, true);
            },
            'delete': function() {
                var selectedRowId = list.getSingleSelected();
                var data;
                if (U.hasContent(selectedRowId)) {
                    container.progressOn();
                    data = updateData();
                    if (data._isNew) {
                        container.progressOff();
                        list.removeSelected();
                    } else if (U.hasContent(data._id)) {
                        manager.api.remove(data._id, function () {
                            container.progressOff();
                            list.removeSelected();
                        })
                    }
                }
            },
            save: function(callback) {
                var selectedRowId = list.getSingleSelected();
                var data;
                var isNew;
                var id;
                if (U.hasContent(selectedRowId)) {
                    container.progressOn();
                    data = updateData();
                    isNew = manager.api.isNew(data);
                    id = manager.api.getId(data);
                    manager.api.prepare(data);
                    manager.api.save(data, function (_id) {
                        var oldRowId = list.grid.getSelectedRowId();
                        if (isNew) {
                            id = _id;
                        }
                        list.controller.reloadRow(oldRowId, id, function () {
                            container.progressOff();
                            if (typeof(callback) == 'function') {
                                callback();
                            }
                        }, true);
                    });
                }
            },
            reload: function(callback) {
                load();
            },
            test: function() {
                var selected = list.getSelectedData();
                var id;
                var container = parseDataViewer.getContainer();
                var paramsString;
                if (selected && !manager.api.isNew(selected)) {
                    id = manager.api.getId(selected);
                    paramsString = form.form.getItemValue('url');
                    container.progressOn();
                    manager.api.exec('test', [id, {
                        onSuccess: function(data) {
                            var currentSelected = list.getSelectedData();
                            if (manager.api.getId(currentSelected) === manager.api.getId(selected)) {
                                parseDataViewer.setData(JSON.stringify(data));
                            }
                            container.progressOff();
                        },
                        onError: function(error) {
                            container.progressOff();
                        }
                    }]);
                }
            },
            reloadRow: function(rowId) {
                var data;
                var id;
                if (list.grid.doesRowExist(rowId)) {
                    data = list.getData(rowId);
                    id = manager.api.getId(data);
                    list.controller.reloadRow(rowId, id, null, true);
                }
            }
        };
        var features = [
            //RELOAD
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Reload',
                    type: 'button',
                    name: 'reload',
                    image: '/static/images/button_reload.png',
                    imageDis: '/static/images/button_reload.png'
                });
                feature.exec = action.reload;
                return feature;
            })(),
            {type: 'separator'},
            //ADD
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Add',
                    type: 'button',
                    name: 'add',
                    image: '/static/images/button_add.png',
                    imageDis: '/static/images/button_add.png'
                });
                feature.exec = action.add;
                return feature;
            })(),
            //SAVE
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Save',
                    type: 'button',
                    name: 'save',
                    image: '/static/images/button_save.png',
                    imageDis: '/static/images/button_save.png'
                });
                feature.exec = action.save;
                return feature;
            })(),
            //DELETE
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Delete',
                    type: 'button',
                    name: 'delete',
                    image: '/static/images/button_delete.png',
                    imageDis: '/static/images/button_delete.png'
                });
                feature.exec = function() {
                    vv.confirm(vvMes.del, function(result) {
                        if (result) {
                            action['delete']();
                        }
                    })
                };
                return feature;
            })(),
            {type: 'separator'},
            //TEST
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Test',
                    type: 'button',
                    name: 'test',
                    image: '/static/images/button_test.png',
                    imageDis: '/static/images/button_test.png'
                });
                feature.exec = function() {
                    var cell = parseDataViewer.getContainer();
                    if (cell.isCollapsed()) {
                        //data will automatically load after cell expand
                        cell.expand();
                    } else {
                        action.test();
                    }
                };
                return feature;
            })()
        ];
        parseDataViewer = parseDataViewer.create();

        function statusFormatter(value, entity) {
            var result = value;
            if (value === 'PERFORMED') {
                result = '<span class="schedule_status schedule_performed">' + U.escapeTags(value) + '</span>';
            } else if (value === 'STOPPED') {
                result = '<span class="schedule_status schedule_stopped">' + U.escapeTags(value) + '</span>';
            }

            return result;
        }

        function createLayout(container) {
            var layout = container.attachLayout('4H');
            layout.cells('a').setWidth(550);
            layout.cells('a').hideHeader();
            layout.cells('b').hideHeader();
            layout.cells('c').collapse();
            layout.cells('d').collapse();
            return layout;
        }

        function createListToolbar(layout) {
            var toolbar = layout.attachToolbar();
            var vToolbar = new Toolbar().init(toolbar);
            vToolbar.addFeatures.apply(vToolbar, features);
            return toolbar;
        }

        function createList(layout) {
            var list = layout.cells("a").attachGrid();
            var vListController = new GridController(manager.api).init([
                {property: '_id', input: '_id'},
                {property: 'code', input: 'code'},
                {property: 'url', input: 'url'},
                {property: 'active', input: 'active'}
            ]);
            var vList = new GridComponent().init(list, vListController, [
                {key: 'code', header: 'Code', width: 100},
                {key: 'url', header: 'Url', width: 250},
                {key: 'active', header: 'Status', width: 150, formatter: statusFormatter}
            ]);
            list.setImagePath("/static/dhtmlx/imgs");
            list.init();
            initListBRules(vList);
            return vList;
        }

        function initListBRules(list) {
        }

        function createDetails() {
            var dataConfig = [
                {property: '_id', input: '_id'},
                {property: 'code', input: 'code'},
                {property: 'url', input: 'url'},
                {property: 'active', input: 'active'},
                {property: 'config', input: 'config'}
            ];
            var formConfig = [
                {type: 'settings', inputWidth: 200, labelWidth: 100, labelAlign: 'left'},
                {type: 'fieldset', label: 'Api Details', width: 550, offsetLeft: 15,
                    list: [
                        {type: 'input',    name: '_id',       label: 'Id', readonly: true},
                        {type: 'input',    name: 'code',      label: 'Code', required: true},
                        {type: 'btn2state',name: 'active',    label: 'Active', required: true, inputWidth: 150},
                        {type: 'combo',    name: 'config',    label: 'Config', required: true},
                        {type: 'block', width: 'auto', blockOffset: 0, list: [
                            {type: 'label', label: 'Url', labelAlign: 'left', blockOffset: 0},
                            {type: 'newcolumn'},
                            {type: 'input', name: 'url', inputWidth: 300, labelWidth: 'auto', label: '/api/data/get/', rows: 3, required: true}
                        ]}
                    ]
                }
            ];
            var form = layout.cells('b').attachForm(formConfig);
            var vController = new FormController().init();
            var vForm = new FormComponent().init(form, vController, dataConfig).initEvents();
            initDetailsBRules(vForm, list);
            return vForm;
        }

        function initDetailsBRules(vForm, list) {
            list.addBRules({
                '_select_': function(list, entity) {
                    if (!U.hasContent(entity)) {
                        setFormData(entity);
                    } else if (!entity._isNew) {
                        var id = entity._id;
                        action.loadEntity(id, setFormData);
                    } else {
                        setFormData(entity);
                    }
                }
            });
        }

        function load(callback) {
            container.progressOn();
            Promise.all(listPromises.map(function(prom){return prom()})).then(function() {
                container.progressOff();
                manager.api.list(function(data) {
                    container.progressOff();
                    list.clear();
                    list.controller.setData(data);
                    if (typeof(callback) === 'function') {
                        callback();
                    }
                }, list.controller.mappings);
            });
        }

        function createParsedDataViewer(layout, list) {
            var cell = layout.cells('d');
            var setDataTimer;
            parseDataViewer.init(cell, 'View data');
            list.addBRules({
                '_select_': function(list, selected) {
                    if (cell.isCollapsed() || manager.api.isNew(selected) || !U.hasContent(selected)) {
                        parseDataViewer.setData({});
                    } else {
                        clearTimeout(setDataTimer);
                        setDataTimer = setTimeout(function() {
                            action.test();
                        }, 300);
                    }
                }
            });
            layout.attachEvent('onExpand', function() {
                if (list.hasSelected()) {
                    action.test();
                } else {
                    parseDataViewer.setData({});
                }
            });
        }

        function setFormData(data) {
            parseDataViewer.setData({});
            form.setData(data);
        }

        function updateData() {
            var entity = form.updateData();
            return entity;
        }

        function statusFormatter(value, entity) {
            var result;
            value = +value;
            value = isNaN(value)? 0: value;
            if (value) {
                result = '<span class="api_status api_active">ACTIVE</span>';
            } else {
                result = '<span class="api_status api_not_active">NOT ACTIVE</span>';
            }
            return result;
        }

        function init(_container) {
            var levelsLayout;
            var srcLayout;
            container = _container;
            layout = createLayout(container);
            toolbar = createListToolbar(layout);
            list = createList(layout);
            form = createDetails(layout);
            createParsedDataViewer(layout, list);
            load();
            /*form = createDetails(layout, list);*/
        }

        api = {
            init: function(cell) {
                init(cell);
                return api;
            },
            destruct: function() {

            }
        };
        return api;
    }
);