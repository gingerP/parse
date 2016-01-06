define([
        '../service/ScheduleService.js',
        '../service/ConstructorService.js',
        '../service/ParsedDataService.js',
        '../views-dependencies/module-view-test-data-viewer.js',
        '../../ace/ace.js'
],
    function(ScheduleService, ConstructorService, ParsedDataService, parseDataViewer){
        var api;
        var container;
        var layout;
        var form;
        var list;
        var toolbar;
        var manager = {
            schedule: new DataManager(ScheduleService.instance),
            constructor: new DataManager(ConstructorService.instance),
            parsedData: new DataManager(ParsedDataService.instance)
        };
        var listPromises = [
            function() {
                return new Promise(function (resolve, reject) {
                    var combo = list.grid.getCombo(list.getColIndex('config'));
                    manager.constructor.list(function (data) {
                        $.each(data, function (index, item) {
                            combo.put(item.code, item.code + ' (' + item.url + ')');
                        });
                        resolve();
                    }, [
                        {property: 'code', input: 'code'},
                        {property: 'url', input: 'url'}
                    ])
                })
            }
        ];
        var action = {
            add: function() {
                var data = manager.schedule.createNewEntity();
                list.addRow(data, true);
            },
            'delete': function() {
                var selectedRowId = list.getSingleSelected();
                var data;
                if (U.hasContent(selectedRowId)) {
                    container.progressOn();
                    data = list.getData(selectedRowId);
                    if (data._isNew) {
                        container.progressOff();
                        list.removeSelected();
                    } else if (U.hasContent(data._id)) {
                        manager.schedule.remove(data._id, function () {
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
                    data = list.getData(selectedRowId);
                    isNew = manager.schedule.isNew(data);
                    id = manager.schedule.getId(data);
                    manager.schedule.prepare(data);
                    manager.schedule.save(data, function (_id) {
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
                load(list);
            },
            start: function(callback) {
                var selectedRowId = list.getSingleSelected();
                var data;
                if (U.hasContent(selectedRowId)) {
                    data = list.getData(selectedRowId);
                    if (!manager.schedule.isNew(data)) {
                        manager.schedule.exec('start', [manager.schedule.getId(data), function(status) {
                            action.reloadRow(selectedRowId);
                        }])
                    } else {

                    }
                }
            },
            stop: function(callback) {
                var selectedRowId = list.getSingleSelected();
                var data;
                if (U.hasContent(selectedRowId)) {
                    data = list.getData(selectedRowId);
                    if (!manager.schedule.isNew(data)) {
                        manager.schedule.exec('stop', [manager.schedule.getId(data), function(status) {
                            action.reloadRow(selectedRowId);
                        }])
                    } else {

                    }
                }
            },
            restart: function(callback) {
                var selectedRowId = list.getSingleSelected();
                var data;
                if (U.hasContent(selectedRowId)) {
                    data = list.getData(selectedRowId);
                    if (!manager.schedule.isNew(data)) {
                        manager.schedule.exec('restart', [manager.schedule.getId(data), function(status) {
                            action.reloadRow(selectedRowId);
                        }])
                    } else {

                    }
                }
            },
            validateCron: function() {
                var selectedRowId = list.getSingleSelected();
                var data;
                if (U.hasContent(selectedRowId)) {
                    data = list.getData(selectedRowId);
                    if (data.cron) {
                        manager.schedule.exec('validateCron', [data.cron, function(status) {
                            dhtmlx.alert({
                                type: "alert-info",
                                text: "OK! Cron string is valid."
                            });
                        }])
                    }
                }
            },
            viewData: function() {
                var selected = list.getSelectedData();
                var container = parseDataViewer.getContainer();
                if (selected && !manager.schedule.isNew(selected)) {
                    container.progressOn();
                    manager.parsedData.getByCriteria({code: selected.config}, {
                        onSuccess: function(data) {
                            var currentSelected = list.getSelectedData();
                            if (manager.schedule.getId(currentSelected) === manager.schedule.getId(selected)) {
                                parseDataViewer.setData(JSON.stringify(data));
                            }
                            container.progressOff();
                        },
                        onError: function(error) {
                            container.progressOff();
                        }
                    });
                }
            },
            reloadRow: function(rowId) {
                var data;
                var id;
                if (list.grid.doesRowExist(rowId)) {
                    data = list.getData(rowId);
                    id = manager.schedule.getId(data);
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
            //START
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Start',
                    type: 'button',
                    name: 'start',
                    image: '/static/images/button_start.png',
                    imageDis: '/static/images/button_start.png'
                });
                feature.exec = function() {
                    action.start();
                };
                return feature;
            })(),
            //STOP
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Stop',
                    type: 'button',
                    name: 'stop',
                    image: '/static/images/button_stop.png',
                    imageDis: '/static/images/button_stop.png'
                });
                feature.exec = function() {
                    action.stop();
                };
                return feature;
            })(),
            //RESTART
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Restart',
                    type: 'button',
                    name: 'restart',
                    image: '/static/images/button_reload.png',
                    imageDis: '/static/images/button_reload.png'
                });
                feature.exec = function() {
                    action.restart();
                };
                return feature;
            })(),
            {type: 'separator'},
            //VALIDATE CRON
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Validate cron',
                    type: 'button',
                    name: 'validate',
                    image: '/static/images/button_reload.png',
                    imageDis: '/static/images/button_reload.png'
                });
                feature.exec = function() {
                    action.validateCron();
                };
                return feature;
            })(),
            //SHOW PARSED DATA
            (function() {
                var feature = new GenericFeature().init({
                    label: 'View data',
                    type: 'button',
                    name: 'showParsedData',
                    image: '/static/images/button_view.png',
                    imageDis: '/static/images/button_view.png'
                });
                feature.exec = function() {
                    var cell = parseDataViewer.getContainer();
                    if (cell.isCollapsed()) {
                        //data will automatically load after cell expand
                        cell.expand();
                    } else {
                        action.viewData();
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
            var layout = container.attachLayout('2U');
            layout.cells('a').hideHeader();
            layout.cells('b').collapse();
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
            var vListController = new GridController(manager.schedule).init([
                {property: '_id', input: '_id'},
                {property: 'code', input: 'code'},
                {property: 'cron', input: 'cron'},
                {property: 'config', input: 'config'},
                {property: 'status', input: 'status'}
            ]);
            var vList = new GridComponent().init(list, vListController, [
                {key: 'code', header: 'Code', type: 'ed', width: 200},
                {key: 'cron', header: 'Cron', type: 'ed', width: 150},
                {key: 'config', header: 'Config', type: 'coro', width: 250},
                {key: 'status', header: 'Status', width: 150, formatter: statusFormatter},
                {key: 'progress', header: 'Progress', width: 300}
            ]);
            list.setImagePath("/static/dhtmlx/imgs");
            list.init();
            initListBRules(vList);
            return vList;
        }

        function initListBRules(list) {
        }

        function load(callback) {
            Promise.all(listPromises.map(function(prom){return prom()})).then(function() {
                container.progressOn();
                manager.schedule.list(function(data) {
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
            var cell = layout.cells('b');
            var setDataTimer;
            parseDataViewer.init(cell, 'View data');
            list.addBRules({
                '_select_': function(list, selected) {
                    if (cell.isCollapsed() || manager.schedule.isNew(selected) || !U.hasContent(selected)) {
                        parseDataViewer.setData({});
                    } else {
                        clearTimeout(setDataTimer);
                        setDataTimer = setTimeout(function() {
                            action.viewData();
                        }, 300);
                    }
                }
            });
            layout.attachEvent('onExpand', function() {
                if (list.hasSelected()) {
                    action.viewData();
                } else {
                    parseDataViewer.setData({});
                }
            });
        }

        function init(_container) {
            var levelsLayout;
            var srcLayout;
            container = _container;
            layout = createLayout(container);
            toolbar = createListToolbar(layout);
            list = createList(layout);
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