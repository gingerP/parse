'use strict'
define([
        '../../service/ConstructorService.js',
        '/static/js/bower_components/vkBeautify/vkbeautify.js'
],
    function(ConstructorService) {
        var api;
        var win;
        var toolbar;
        var list;
        var form;
        var editor;
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
            constructor: new DataManager(ConstructorService.instance, {idField: 'code'})
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

            }
        };
        var features = [
            //SAVE
            (function() {
                var feature = new GenericFeature().init({
                    label: 'Ok',
                    type: 'button',
                    name: 'save',
                    image: '/static/images/button_save.png',
                    imageDis: '/static/images/button_save.png'
                });
                feature.exec = action.reload;
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
                center: true,
                resize: false
            });
            win.attachEvent('onClose', function() {
                win.setModal(false);
                win.hide();
            });
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
            var list = new dhtmlXGridObject(container);
            var vListController = new GridController(manager.constructor).init([
                {property: 'code', input: ''},
                {property: 'config', input: 'config'}
            ]);
            var vList = new GridComponent().init(list, vListController, [
                {key: 'code', header: 'Code', width: 100},
                {key: 'config', header: 'Config', type: 'coro', width: 250},
                {key: 'url', header: 'Url', type: 'coro', width: 250}
            ]);
            list.setImagePath("/static/dhtmlx/imgs");
            list.init();
            initListBRules(vList);
            return vList;
        }

        function initListBRules(list) {

        }

        function createEditor(container, title) {
            var doc = document.createElement('DIV');
            var editor;
            var api;
            doc.className += ' source-editor-container';
            container.appendChild(doc);
            editor = ace.edit(doc);
            editor.getSession().setMode("ace/mode/json");
            editor.setReadOnly(true);
            editor.$blockScrolling = Infinity;
            api = {
                setValue: function(value) {
                    value = vkbeautify.json(value);
                    editor.setValue(value);
                    editor.clearSelection();
                    return api;
                },
                getValue: function() {
                    return editor.getValue();
                }
            };
            return api;
        }

        function preLoad(callback) {
            Promise.all(listPromises.map(function(prom){return prom()})).then(function() {callback});
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
                    form = createForm(win);
                    list = createList(form.form.getContainer('configs_container'));
                    editor = createEditor(form.form.getContainer('config_handler'));
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
            setData: function(entity) {
                list.controller.setData(entity.extend.handlers);
                return api;
            }
        };
        return api;
    }
);