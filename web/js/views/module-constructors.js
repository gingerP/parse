define([
        '../views-dependencies/module-view-constructors-level.js',
        '../views-dependencies/module-view-constructors-levels-config.js',
        '../service/ConstructorService.js'
    ],
    function(LevelModule, levelsConfigModule, service) {
        var api;
        var layout;
        var list;
        var form;
        var tabbar;
        var levelsModules = [];
        var toolbar;
        var levelsToolbar;
        var sidebarSrc;
        var src;
        var dataManager = new DataManager(service);
        var entity = function() {
            var id = U.getRandomString();
            return {_id: id, id: id, url: null, levels: {}, levelConfig: {}, listKey: null, parentSel: null, code: null, _isNew: true};
        };
        var action = {
            add: function() {
                var data = entity();
                list.addRow(data, true);
            },
            delete: function() {

            },
            save: function() {
                var data = updateData();
                if (data._isNew) {
                    delete data.id;
                }
                dataManager.prepare(data);
                dataManager.save(data);
            },
            reload: function() {

            },
            loadEntity: function(id, callback) {
                dataManager.get(id, callback);
            }
        };
        var levelAction = {
            add: function() {
                var tabId = U.getRandomString();
                var tab;
                var levelModule;
                tabbar.addTab(tabId, "#" + (levelsModules.length + 1) + "Level");
                tab = tabbar.cells(tabId);
                levelModule = LevelModule().init(tab);
                levelModule.getComponent().containerCellId = tabId;
                tabbar.cells(tabId).setActive();
                levelsModules.push(levelModule);
                return levelModule;
            },
            delete: function(module) {
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
                    levelAction.delete(module);
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
            (function getReloadFeature() {
                var feature = new GenericFeature().init({
                    type: 'button',
                    name: 'reload',
                    image: '/static/images/button_reload.png',
                    imageDis: '/static/images/button_reload.png'
                });
                feature.exec = action.reload;
                return feature;
            })(),
            (function getAddFeature() {
                var feature = new GenericFeature().init({
                    type: 'button',
                    name: 'add',
                    image: '/static/images/button_add.png',
                    imageDis: '/static/images/button_add.png'
                });
                feature.exec = action.add;
                return feature;
            })(),
            (function getDeleteFeature() {
                var feature = new GenericFeature().init({
                    type: 'button',
                    name: 'delete',
                    image: '/static/images/button_delete.png',
                    imageDis: '/static/images/button_delete.png'
                });
                feature.exec = action.delete;
                return feature;
            })(),
            (function getSaveFeature() {
                var feature = new GenericFeature().init({
                    type: 'button',
                    name: 'save',
                    image: '/static/images/button_save.png',
                    imageDis: '/static/images/button_save.png'
                });
                feature.exec = action.save;
                return feature;
            })()
        ];

        var levelFeatures = [
            // ADD LEVEL
            (function() {
                var feature = new GenericFeature().init({
                    type: 'button',
                    name: 'addLevel',
                    image: '/static/images/button_add.png',
                    imageDis: '/static/images/button_add.png'
                });
                feature.exec = function() {
                    var module = levelAction.add();
                    module.setData({}, U.getRandomString());
                    levelsConfigAction.add(module);
                };
                return feature;
            })(),
            // DELETE LEVEL
            (function() {
                var feature = new GenericFeature().init({
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
                            levelAction.delete(active);
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

        function createLayout(sideBarCell) {
            var layout = sideBarCell.attachLayout('3L');
            layout.cells('a').hideHeader();
            layout.cells('a').hideArrow();
            layout.cells('a').setWidth(420);
            layout.cells('b').setHeight(220);
            layout.cells('b').hideHeader();
            layout.cells('b').hideArrow();
            layout.cells('c').hideHeader();
            layout.cells('c').hideArrow();
            return layout;
        }

        function createList(layout) {
            var list = layout.cells("a").attachGrid();
            var vListController = new GridController().init([
                {from: '_id', to: 'id'},
                {from: 'code', to: 'code'},
                {from: 'url', to: 'url'}
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

        function load(list) {
            service.list(list.controller.mappings, function(data) {
                list.controller.setData(data);
            });
        }

        function createDetails(layout, list) {
            var dataConfig = [
                {property: 'id', input: 'id'},
                {property: 'code', input: 'code'},
                {property: 'url', input: 'url'},
                {property: 'parentSel', input: 'parentSel'},
                {property: 'listKey', input: 'listKey'}
            ];
            var formConfig = [
                {type: 'settings', inputWidth: 200, labelWidth: 100, labelAlign: 'left'},
                {type: 'fieldset', label: 'Page Details', width: 350, offsetLeft: 15,
                    list: [
                        {type: 'input',    name: 'id',        label: 'Id', readonly: true},
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
                    if (!entity._isNew) {
                        var id = entity.id;
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
            var tabbar = layout.cells('forms').attachTabbar({
                arrows_mode: false
            });
            return tabbar;
        }

        function deleteLevels() {
            var index = levelsModules.length - 1;
            var component = null;
            while(index > -1) {
                levelAction.delete(levelsModules[index]);
                index--;
            }
        }

        function setFormData(data) {
            data.id = data._id;
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
                    module.setData(level, i);
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
            var toolbar = layout.cells('forms').attachToolbar();
            var vToolbar = new Toolbar().init(toolbar);
            vToolbar.addFeatures.apply(vToolbar, levelFeatures);
            return toolbar;
        }

        function createLevelsConfig(form) {
            levelsConfigModule.init()
                .setForm(form.form.getContainer('levels_config'));
        }

        function createEditor(sideBar) {

        }

        function updateData() {
            var entity = form.updateData();
            entity.levels = {};
            $.each(levelsModules, function(i, module) {
                var code = module.getCode();
                var data = module.getData();
                entity.levels[code] = data;
            });
            entity.levelConfig = levelsConfigModule.getData();
            return entity;
        }

        function init(container) {
            layout = createLayout(container);
            list = createList(layout);
            toolbar = createListToolbar(layout);
            sidebarSrc = createSourceSideBar(layout);
            levelsToolbar = createLevelsToolbar(sidebarSrc);
            form = createDetails(layout, list);
            createLevelsConfig(form);
            tabbar = createTabbar(sidebarSrc);
            src = createEditor(sidebarSrc);
        }

        api = {
            init: function(sideBarCell) {
                init(sideBarCell);
                return api;
            },
            destruct: function() {
                return api;
            }
        };
        return api;
    }
);