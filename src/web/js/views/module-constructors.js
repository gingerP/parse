define([
        'views-dependencies/constructor/module-view-level',
        'views-dependencies/constructor/module-view-levels-config',
        'views-dependencies/constructor/module-view-src-editor',
        'views-dependencies/module-view-test-data-viewer',
        'service/ConstructorService',
        'service/LevelService',
        'ace/ace',
        'bower_components/vkBeautify/vkbeautify'
    ],
    function(LevelModule, levelsConfigModule, srcEditor, testDataViewer, ConstructorService, LevelService) {
        var api;
        var container;
        var layout;
        var list;
        var form;
        var tabbar;
        var levelsModules = [];
        var toolbar;
        var levelsToolbar;
        var sidebarSrc;
        var dataManager = new DataManager(ConstructorService.instance);
        var levelDataManager = new DataManager(LevelService.instance);
        var action = {
            add: function() {
                var data = dataManager.createNewEntity();
                list.addRow(data, true);
            },
            'delete': function() {
                container.progressOn();
                var data = updateData();
                if (data) {
                    if (dataManager.isNew(data)) {
                        container.progressOff();
                        list.removeSelected();
                    } else if (U.hasContent(data._id)) {
                        dataManager.remove(data._id, function () {
                            container.progressOff();
                            list.removeSelected();
                        })
                    }
                }
            },
            save: function(callback) {
                container.progressOn();
                var data = updateData();
                var isNew = dataManager.isNew(data);
                var id = dataManager.getId(data);
                dataManager.prepare(data);
                dataManager.save(data, function(_id) {
                    var oldRowId = list.grid.getSelectedRowId();
                    if (isNew) {
                        id = _id;
                    }
                    list.controller.reloadRow(oldRowId, id, function() {
                        container.progressOff();
                        if (typeof(callback) == 'function') {
                            callback();
                        }
                    }, true);
                });
            },
            reload: function(callback) {
                load(list);
            },
            loadEntity: function(id, callback) {
                container.progressOn();
                dataManager.get(id, function(data) {
                    container.progressOff();
                    callback(data);
                });
            },
            test: function() {
                var selected = list.getSelectedData();
                var container = testDataViewer.getContainer();
                if (selected) {
                    container.expand();
                    container.progressOn();
                    dataManager.exec('test', [selected._id, {
                        onSuccess: function(data) {
                            testDataViewer.setData(JSON.stringify(data));
                            container.progressOff();
                        },
                        onError: function(error) {
                            container.progressOff();
                        }
                    }]);
                }
            }

        };
        var levelAction = {
            add: function() {
                var tabId = U.getRandomString();
                var tab;
                var levelModule;
                tabbar.addTab(tabId);
                tab = tabbar.cells(tabId);
                levelModule = LevelModule().init(tab);
                levelModule.getComponent().containerCellId = tabId;
                tabbar.cells(tabId).setActive();
                levelsModules.push(levelModule);
                return levelModule;
            },
            'delete': function(module) {
                var tab = tabbar.getActiveTab();
                var index = levelsModules.indexOf(module);
                var component = null;
                if (index > -1) {
                    component = module.getComponent();
                    levelsModules.splice(index, 1);
                    tabbar.cells(component.containerCellId).close();
                }
            },
            deleteActive: function() {
                var module = levelAction.getActive();
                if (module) {
                    levelAction['delete'](module);
                }
            },
            getActive: function() {
                var result;
                var activeId = tabbar.getActiveTab();
                $.each(levelsModules, function(i, module) {
                    var id = module.getComponent().containerCellId;
                    if (id == activeId) {
                        result = module;
                        return false;
                    }
                });
                return result;
            },
            next: function() {
                tabbar.goToNextTab();
            },
            prev: function() {
                tabbar.goToPrevTab();
            },
            setData: function() {

            },
            getData: function() {

            }
        };

        var levelsConfigAction = {
            add: function(module) {
                var code = module.getCode();
                levelsConfigModule.addItem(code);
                module.addCodeListener(levelsConfigModule.getCodeListener());
            },
            remove: function(module) {
                var code = module.getCode();
                levelsConfigModule.removeItem(code);
            }
        };

        var configFeatures = [
            //RELOAD
            (function getReloadFeature() {
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
            (function getAddFeature() {
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
            (function getSaveFeature() {
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
            (function getDeleteFeature() {
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
            (function getSaveFeature() {
                var feature = new GenericFeature().init({
                    label: 'Test',
                    type: 'button',
                    name: 'test',
                    image: '/static/images/button_test.png',
                    imageDis: '/static/images/button_test.png'
                });
                feature.exec = function() {
                    action.test();
                };
                return feature;
            })()
        ];

        var levelFeatures = [
            // ADD LEVEL
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Add level',
                    type: 'button',
                    name: 'addLevel',
                    image: '/static/images/button_add.png',
                    imageDis: '/static/images/button_add.png'
                });
                feature.exec = function() {
                    var module = levelAction.add();
                    var level = levelDataManager.createNewEntity();
                    module.setData(level);
                    levelsConfigAction.add(module);
                };
                return feature;
            })(),
            // DELETE LEVEL
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Delete level',
                    type: 'button',
                    name: 'deleteLevel',
                    image: '/static/images/button_delete.png',
                    imageDis: '/static/images/button_delete.png'
                });
                feature.exec = function() {
                    vv.confirm(vvMes.del, function(result) {
                        var active = levelAction.getActive();
                        if (result && active) {
                            levelsConfigAction.remove(active);
                            levelAction['delete'](active);
                        }
                    })
                };
                return feature;
            })(),
            {type: 'separator'},
            // PREV LEVEL
            (function() {
                var feature = new GenericFeature().init({
                    type: 'button',
                    name: 'prevLevel',
                    image: '/static/images/button_left.png',
                    imageDis: '/static/images/button_left.png'
                });
                feature.exec = levelAction.prev;
                return feature;
            })(),
            // NEXT LEVEL
            (function() {
                var feature = new GenericFeature().init({
                    type: 'button',
                    name: 'nextLevel',
                    image: '/static/images/button_right.png',
                    imageDis: '/static/images/button_right.png'
                });
                feature.exec = levelAction.next;
                return feature;
            })()
        ];
        testDataViewer = testDataViewer.create();

        function createLayout(sideBarCell) {
            var layout = sideBarCell.attachLayout('4H');
            layout.cells('a').hideHeader();
            layout.cells('a').hideArrow();
            layout.cells('a').setWidth(420);
            layout.cells('b').setHeight(220);
            layout.cells('b').hideHeader();
            layout.cells('b').hideArrow();
            layout.cells('c').hideHeader();
            layout.cells('c').hideArrow();
            layout.cells('d').collapse();
            return layout;
        }

        function createList(layout) {
            var list = layout.cells("a").attachGrid();
            var vListController = new GridController(dataManager).init([
                {property: '_id', input: '_id'},
                {property: 'code', input: 'code'},
                {property: 'url', input: 'url'}
            ]);
            var vList = new GridComponent().init(list, vListController, [
                {key: 'code', header: 'Code', width: 100},
                {key: 'url', header: 'Url', width: 300}
            ]);
            list.setImagePath("/static/dhtmlx/imgs");
            list.init();
            initListBRules(vList);
            load(vList);
            return vList;
        }

        function initListBRules(list) {
        }

        function load(list, callback) {
            container.progressOn();
            dataManager.list(function(data) {
                container.progressOff();
                list.clear();
                list.controller.setData(data);
                if (typeof(callback) === 'function') {
                    callback();
                }
            }, list.controller.mappings);
        }

        function createDetails(layout, list) {
            var dataConfig = [
                {property: '_id', input: '_id'},
                {property: 'code', input: 'code'},
                {property: 'url', input: 'url'},
                {property: 'parentSel', input: 'parentSel'},
                {property: 'listKey', input: 'listKey'}
            ];
            var formConfig = [
                {type: 'settings', inputWidth: 200, labelWidth: 100, labelAlign: 'left'},
                {type: 'fieldset', label: 'Page Details', width: 350, offsetLeft: 15,
                    list: [
                        {type: 'input',    name: '_id',        label: 'Id', readonly: true},
                        {type: 'input',    name: 'code',      label: 'Code', required: true},
                        {type: 'input',    name: 'url',       label: 'Url', required: true},
                        {type: 'input',    name: 'parentSel', label: 'Parent Selector', required: true},
                        {type: 'input',    name: 'listKey',   label: 'List Key', required: true}
                    ]
                },
                {type: 'newcolumn', offset: 5},
                {type: 'fieldset', label: 'Levels Config', width: 'auto', offsetLeft: 15, list: [
                    {type: 'container', name: 'levels_config', inputWidth: 400, inputHeight: 144}
                ]},
                {type: 'newcolumn', offset: 5}
            ];
            var form = layout.cells('b').attachForm(formConfig);
            var vController = new FormController().init();
            var vForm = new FormComponent().init(form, vController, dataConfig).initEvents();
            initDetailsBRules(vForm, list);
            initContainersUpdate(vForm);
            return vForm;
        }

        function initDetailsBRules(form, list) {
            form.addBRules({
                '__btn;add_level': function(form, name) {
                    action.add();
                }
            });
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

        function initContainersUpdate(form) {
            form.addContainersUpdate({

            })
        }

        function createTabbar(layout) {
            return layout.cells('a').attachTabbar({
                arrows_mode: false
            });
        }

        function deleteLevels() {
            var index = levelsModules.length - 1;
            while(index > -1) {
                levelAction['delete'](levelsModules[index]);
                index--;
            }
        }

        function setFormData(data) {
            srcEditor.setValue(JSON.stringify(data));
            form.setData(data);
            setLevelsConfigData(data);
            setLevelsData(data);
        }

        function setLevelsConfigData(data) {
            levelsConfigModule.removeAll();
            levelsConfigModule.setData(data.levelConfig);
        }

        function setLevelsData(data) {
            deleteLevels();
            if (data.levels && Object.keys(data.levels)) {
                $.each(data.levels, function (i, level) {
                    var module = levelAction.add();
                    module.setData(level);
                    module.addCodeListener(levelsConfigModule.getCodeListener());
                });
            }
        }

        function createSourceSideBar(layout) {
            var sideBar = layout.cells('c').attachSidebar({
                template: "icons",
                single_cell: false,
                width: 50
            });
            layout.cells('c').hideHeader();
            sideBar.addItem({
                id: 'forms',
                icon: '/static/images/forms.png'
            });
            sideBar.addItem({
                id: 'source',
                icon: '/static/images/src.png'
            });
            sideBar.cells('forms').setActive();
            return sideBar;
        }

        function createListToolbar(layout) {
            var toolbar = layout.attachToolbar();
            var vToolbar = new Toolbar().init(toolbar);
            vToolbar.addFeatures.apply(vToolbar, configFeatures);
            return toolbar;
        }

        function createLevelsToolbar(layout) {
            var toolbar = layout.cells('a').attachToolbar();
            var vToolbar = new Toolbar().init(toolbar);
            vToolbar.addFeatures.apply(vToolbar, levelFeatures);
            return toolbar;
        }

        function createLevelsConfig(form) {
            levelsConfigModule.init()
                .setForm(form.form.getContainer('levels_config'));
        }

        function createSrcEditorLayout(sidebar) {
            var layout = sidebar.cells('source').attachLayout('1C');
            layout.base.className += ' src_editor';
            layout.cells('a').hideHeader();
            return layout;
        }

        function createTestDataViewer(container) {
            return testDataViewer.init(container);
        }

        function createLevelsLayout(sidebar) {
            var layout = sidebar.cells('forms').attachLayout('1C');
            layout.base.className += ' src_levels';
            return layout;
        }

        function updateData() {
            var entity = form.updateData();
            entity.levels = [];
            entity.levelConfig = [];
            $.each(levelsModules, function(i, module) {
                var data = module.getData();
                entity.levels.push(data);
            });
            entity.levelConfig = levelsConfigModule.getData();
            return entity;
        }

        function init(_container) {
            var levelsLayout;
            var srcLayout;
            container = _container;
            layout = createLayout(container);
            list = createList(layout);
            toolbar = createListToolbar(layout);
            form = createDetails(layout, list);
            createLevelsConfig(form);

            sidebarSrc = createSourceSideBar(layout);
            levelsLayout = createLevelsLayout(sidebarSrc);
            levelsToolbar = createLevelsToolbar(levelsLayout);
            tabbar = createTabbar(levelsLayout);

            srcLayout = createSrcEditorLayout(sidebarSrc);
            srcEditor.init(srcLayout).setDataSource(api);

            createTestDataViewer(layout.cells('d'));
            addLayoutSizeListener(srcEditor);
        }

        function addLayoutSizeListener(module) {
            if (module && typeof(module.onSizeChange) === 'function') {
                layout.attachEvent("onPanelResizeFinish", function(names) {
                    module.onSizeChange(names);
                });
            }
        }

        api = {
            init: function(sideBarCell) {
                init(sideBarCell);
                return api;
            },
            destruct: function() {
                return api;
            },
            updateData: function(prepare) {
                var data = updateData();
                data = JSON.parse(JSON.stringify(data));
                if (prepare) {
                    dataManager.prepare(data);
                }
                return data;
            },
            setData: function(entity) {
                setFormData(entity);
                return api;
            }
        };
        return api;
    }
);