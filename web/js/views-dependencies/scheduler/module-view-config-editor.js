'use strict'
define([
        '../../service/ScheduleService.js',
        '../../service/ConstructorService.js',
        '/static/js/bower_components/vkBeautify/vkbeautify.js'
],
    function(ScheduleService, ConstructorService) {
        var api;
        var win;
        var layout;
        var testLayout;
        var toolbar;
        var testToolbar;
        var list;
        var form;
        var editor;
        var postEditor;
        var preEditor;
        var parsedDataViewer;
        var scriptConsole;
        var jsBtnHandlerMappings = {
            'js_sectionConfig': 'sectionConfigJSHandler',
            'js_sectionNumberConfig': 'sectionNumberConfigJSHandler',
            'js_sectionPageItemConfig': 'sectionPageItemConfigJSHandler',
            'js_itemConfig': 'itemConfigJSHandler',
            'js_authorConfig': 'authorConfigJSHandler'
        };
        var jsHandlerLabelMappings = {
            'js_sectionConfig': 'Sections Config',
            'js_sectionNumberConfig': 'Section Number Config',
            'js_sectionPageItemConfig': 'Section Page Items Config',
            'js_itemConfig': 'Item Config',
            'js_authorConfig': 'Author Config'
        };
        var manager = {
            constructor: new DataManager(ConstructorService.instance, {idField: 'code'}),
            schedule: new DataManager(ScheduleService.instance),
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
            save: function() {
                var handlers = list.updateData();
            },
            cancel: function() {

            },
            test: function() {
                var entity = api.getData();
                var selected = list.getSelectedData();
                manager.schedule.exec('test', [entity, {stepCode: selected.code}, function(result) {
                    parsedDataViewer.setValue(result);
                }])
            },
            loadConfig: function() {

            }
        };
        var features = [
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
            //CANCEL
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Cancel',
                    type: 'button',
                    name: 'cancel',
                    image: '/static/images/button_cancel.png',
                    imageDis: '/static/images/button_cancel.png'
                });
                feature.exec = action.cancel;
                return feature;
            })()
        ];

        var testFeatures = [
            //TEST
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Test',
                    type: 'button',
                    name: 'run',
                    image: '/static/images/button_test.png',
                    imageDis: '/static/images/button_test.png'
                });
                feature.exec = action.test;
                return feature;
            })(),
            //LOAD
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Load config data',
                    type: 'button',
                    name: 'load',
                    image: '/static/images/button_download.png',
                    imageDis: '/static/images/button_download.png'
                });
                feature.exec = action.loadConfig;
                return feature;
            })()
        ];

        function createWindow() {
            var myWins = new dhtmlXWindows({
                image_path: "codebase/imgs/",
                skin:       "dhx_blue"
            });
            var win = myWins.createWindow({
                id: "itemsSchedulesEditor",
                width:  1100,
                height: 530,
                center: true
            });
            win.attachEvent('onClose', function() {
                win.setModal(false);
                win.hide();
                api.clear();
            });
            win.setModal(true);
            win.setText('Config editor');
            win.cell.className += ' schedule-config-win';
            window.addEventListener('resize', function() {
                win.centerOnScreen();
            });
            document.addEventListener('keydown', function(event) {
                if (event.keyCode === 27) {
                    win.close();
                }
            });
            return win;
        }

        function createLayout(win) {
            var layout = win.attachLayout('3J');
            layout.cells('a').hideHeader();
            layout.cells('b').hideHeader();
            layout.cells('c').hideHeader();
            return layout;
        }
        function createToolbar(win) {
            var toolbar = win.attachToolbar();
            var vToolbar = new Toolbar().init(toolbar);
            vToolbar.addFeatures.apply(vToolbar, features);
            if (toolbar && toolbar.base) {
                toolbar.base.parentNode.parentNode.className += ' dhx_cell_toolbar_def_padding_less';
            }
            return toolbar;
        }

        function createForm(layout) {
            var dataConfig = [
                {property: 'sectionConfig', input: 'sectionConfig'},
                {property: 'sectionNumberConfig', input: 'sectionNumberConfig'},
                {property: 'sectionPageItemConfig', input: 'sectionPageItemConfig'},
                {property: 'itemConfig', input: 'itemConfig'},
                {property: 'authorConfig', input: 'authorConfig'}
            ];
            var formConfig = [
                {type: 'settings', inputWidth: 200, labelWidth: 100, labelAlign: 'left'},
                {type: 'block', width: 'auto', blockOffset: 0, list: [
                    {type: 'container', name: 'configs_container', inputWidth: 650, inputHeight: 400},
                    {type: 'newcolumn'},
                    {type: 'container', name: 'config_handler', inputWidth: 400, inputHeight: 400}
                ]}
            ];
            var form = layout.attachForm(formConfig);
            var vController = new FormController().init();
            var vForm = new FormComponent().init(form, vController, dataConfig).initEvents();
            initDetailsBRules(vForm);
            return vForm;
        }

        function initDetailsBRules(vForm) {
        }

        function createList(container) {
            var list = container.attachGrid();
            var vListController = new GridController(manager.constructor).init([
                {property: 'code', input: ''},
                {property: 'config', input: 'config'}
            ]);
            var vList = new GridComponent().init(list, vListController, [
                {key: 'code', header: 'Code', width: 100},
                {key: 'config', header: 'Config', type: 'coro', width: 250},
                {key: 'url', header: 'Url', type: 'ed', width: 250}
            ]);
            list.setImagePath("/static/dhtmlx/imgs");
            list.init();
            initListBRules(vList);
            return vList;
        }

        function initListBRules(list) {
            list.addBRules({
                '__before_select': function(/*grid, newRow, oldRow, canChange*/) {
                    preSaveJSHandlers();
                },
                '_select_': function(grid, entity) {
                    var hasSelected = U.hasContent(entity);
                    if (hasSelected) {
                        preEditor.setValue(entity.handlerPre);
                        postEditor.setValue(entity.handlerPost);
                    }
                    preEditor.enable(hasSelected);
                    postEditor.enable(hasSelected);
                }
            });
        }

        function createTestLayout(cell) {
            var layout = cell.attachLayout('2U');
            layout.cells('a').hideHeader();
            return layout;
        }

        function createTestToolbar(layout) {
            var toolbar = layout.cells('a').attachToolbar();
            var vToolbar = new Toolbar().init(toolbar);
            vToolbar.addFeatures.apply(vToolbar, testFeatures);
            if (toolbar && toolbar.base) {
                toolbar.base.parentNode.parentNode.className += ' dhx_cell_toolbar_def_padding_less';
            }
            return toolbar;
        }

        function createEditors(container) {
            var tabbar = container.attachTabbar({
                tabs: [
                    {id: "pre", text: "Pre Handler"},
                    {id: "post", text: "Post Handler", active: true}
                ]
            });
            tabbar.setArrowsMode('auto');
            postEditor = createPostEditor(tabbar.cells('post'));
            preEditor = createPreEditor(tabbar.cells('pre'));
            return tabbar;
        }

        function createPostEditor(cell) {
            var doc = document.createElement('DIV');
            var editor;
            var api;
            doc.className += ' source-editor-container';
            cell.setActive();
            cell.cell.appendChild(doc);
            editor = ace.edit(doc);
            editor.getSession().setMode("ace/mode/javascript");
            editor.setReadOnly(true);
            editor.$blockScrolling = Infinity;
            api = {
                setValue: function(value) {
                    editor.setValue(U.hasContent(value)? '' + value: '');
                    editor.clearSelection();
                    return api;
                },
                getValue: function() {
                    return editor.getValue();
                },
                enable: function(state) {
                    editor.setReadOnly(!state);
                    return api;
                }
            };
            return api;
        }

        function createPreEditor(cell) {
            var doc = document.createElement('DIV');
            var editor;
            var api;
            doc.className += ' source-editor-container';
            cell.setActive();
            cell.cell.appendChild(doc);
            editor = ace.edit(doc);
            editor.getSession().setMode("ace/mode/javascript");
            editor.setReadOnly(true);
            editor.$blockScrolling = Infinity;
            api = {
                setValue: function(value) {
                    editor.setValue(U.hasContent(value)? '' + value: '');
                    editor.clearSelection();
                    return api;
                },
                getValue: function() {
                    return editor.getValue();
                },
                enable: function(state) {
                    editor.setReadOnly(!state);
                    return api;
                }
            };
            return api;
        }

        function createConsoleViewer(cell) {
            var doc = document.createElement('DIV');
            var editor;
            var api;
            doc.className += ' source-editor-container';
            cell.appendObject(doc);
            editor = ace.edit(doc);
            editor.getSession().setMode("ace/mode/json");
            editor.setReadOnly(true);
            editor.$blockScrolling = Infinity;
            api = {
                setValue: function(value) {
                    value = vkbeautify.json(value);
                    editor.setValue(value || {});
                    editor.clearSelection();
                    return api;
                },
                getValue: function() {
                    return editor.getValue();
                },
                enable: function(state) {
                    editor.setReadOnly(!state);
                    return api;
                }
            };
            return api;
        }

        function createParsedDataViwer(cell) {
            var doc = document.createElement('DIV');
            var editor;
            var api;
            doc.className += ' source-editor-container';
            cell.appendObject(doc);
            cell.setText('Console');
            editor = ace.edit(doc);
            editor.getSession().setMode("ace/mode/json");
            editor.setReadOnly(true);
            editor.$blockScrolling = Infinity;
            win.attachEvent("onMinimize", function() {
                editor.resize();
            });
            win.attachEvent("onMaximize", function() {
                editor.resize();
            });
            cell.attachEvent("onResizeFinish", function() {
                editor.resize();
            });
            api = {
                setValue: function(value) {
                    value = vkbeautify.json(value);
                    editor.setValue(value || {});
                    editor.clearSelection();
                    return api;
                },
                getValue: function() {
                    return editor.getValue();
                },
                enable: function(state) {
                    editor.setReadOnly(!state);
                    return api;
                }
            };
            return api;
        }

        function preLoad(callback) {
            Promise.all(listPromises.map(function(prom){
                return prom()
            })).then(callback);
        }

        function preSaveJSHandlers() {
            var post;
            var pre;
            var data;
            var rowId;
            if (list.hasSelected()) {
                post = postEditor.getValue();
                pre = preEditor.getValue();
                rowId = list.getSingleSelected();
                data = list.getData(rowId);
                data.handlerPost = post;
                data.handlerPre = pre;
                list.setData(data);
            }
        }

        api = {
            init: function() {
                return api;
            },
            show: function(data) {
                if (!win) {
                    win = createWindow();
                    win.show();
                    toolbar = createToolbar(win);
                    layout = createLayout(win);
                    form = createForm(layout.cells('a'));
                    list = createList(layout.cells('c'));
                    testLayout = createTestLayout(layout.cells('b'));
                    testToolbar = createTestToolbar(testLayout);
                    parsedDataViewer = createParsedDataViwer(testLayout.cells('b'));
                    createEditors(testLayout.cells('a'));
                    preLoad(function() {
                        api.setData(data);
                    })
                } else {
                    win.show();
                    api.setData(data);
                }
                win.setModal(true);
                return api;
            },
            hide: function() {
                win.hide();
                editor.setLabel('Config Handler');
                return api;
            },
            getData: function() {
                var entity = form.updateData();
                preSaveJSHandlers();
                entity.extend.handlers = list.updateData();
                return entity;
            },
            setData: function(entity) {
                form.setData(entity);
                list.controller.setData(entity.extend.handlers);
                return api;
            },
            clear: function() {
                list.clear();
                postEditor.setValue();
                preEditor.setValue();
                parsedDataViewer.setValue();
            },
            addScheduleListener: function(listener) {

            }
        };
        return api;
    }
);