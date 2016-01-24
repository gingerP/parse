'use strict'
define(['/static/js/bower_components/vkBeautify/vkbeautify.js'],
    function() {
        var api;
        var win;
        var toolbar;
        var layout;
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
                width:  1000,
                height: 700,
                center: true
            });
            win.attachEvent('onClose', function() {
                win.setModal(false);
                win.hide();
                editor.setLabel('Config Handler');
            });
            win.setText('Config editor');
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
            var layout = win.attachLayout('2U');
            layout.cells('a').hideHeader();
            layout.cells('b').collapse();
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
                {type: 'block', width: 'auto', list: [
                    {type: 'combo', name: 'sectionConfig', label: 'Sections Config', readonly: true, note: {
                        text: 'Конфиг для получения секций (элементов дерева навигации)', width: 200
                    }},
                    {type: 'newcolumn'},
                    {type: 'button', name: 'js_sectionConfig', value: 'JS'}
                ]},
                {type: 'block', width: 'auto', list: [
                    {type: 'combo',    name: 'sectionNumberConfig',       label: 'Section Number Config', required: true, note: {
                        text: 'Конфиг для получения количества страниц элементов секции', width: 200
                    }},
                    {type: 'newcolumn'},
                    {type: 'button', name: 'js_sectionNumberConfig', value: 'JS'}
                ]},
                {type: 'block', width: 'auto', list: [
                    {type: 'combo',    name: 'sectionPageItemConfig',     label: 'Section Page Items Config', required: true, note: {
                        text: 'Конфиг для получения превью целевого объекта на страницах с пагинацией', width: 200
                    }},
                    {type: 'newcolumn'},
                    {type: 'button', name: 'js_sectionPageItemConfig', value: 'JS'}
                ]},
                {type: 'block', width: 'auto', list: [
                    {type: 'combo',    name: 'itemConfig',                label: 'Item Config', required: true, note: {
                        text: 'Конфиг для получения полной информации о целевом объекте', width: 200
                    }},
                    {type: 'newcolumn'},
                    {type: 'button', name: 'js_itemConfig', value: 'JS'}
                ]},
                {type: 'block', width: 'auto', list: [
                    {type: 'combo',    name: 'authorConfig',              label: 'Author Config', required: true, note: {
                        text: 'Конфиг для получения полной информации об авторе целевого объекта', width: 200
                    }},
                    {type: 'newcolumn'},
                    {type: 'button', name: 'js_authorConfig', value: 'JS'}
                ]}
            ];
            var form = layout.attachForm(formConfig);
            var vController = new FormController().init();
            var vForm = new FormComponent().init(form, vController, dataConfig).initEvents();
            initDetailsBRules(vForm);
            return vForm;
        }

        function initDetailsBRules(vForm) {
            vForm.addBRules({
                '__btn;__regexp;js_.*': function(form, name) {
                    var jsHandler = jsBtnHandlerMappings[name];
                    var label = jsHandlerLabelMappings[name];
                    var handlerScript = U.getDeepValue(form.controller.activeEntity, jsHandler);
                    editor.show().setLabel(label).setValue(handlerScript);
                }
            });
        }

        function createEditor(container, title) {
            var doc = document.createElement('DIV');
            var editor;
            var api;
            doc.className += ' source-editor-container';
            container.attachObject(doc);
            container.setText(title || 'Test');
            editor = ace.edit(doc);
            editor.getSession().setMode("ace/mode/json");
            editor.setReadOnly(true);
            editor.$blockScrolling = Infinity;
            //init events
            container.attachEvent("onPanelResizeFinish", function(names){
                editor.resize();
            });
            api = {
                show: function() {
                    layout.cells('b').expand();
                    return api;
                },
                hide: function() {
                    layout.cells('b').collapse();
                    return api;
                },
                setValue: function(value) {
                    value = vkbeautify.json(value);
                    editor.setValue(value);
                    editor.clearSelection();
                    return api;
                },
                setLabel: function(text) {
                    layout.cells('b').setText(text);
                    return api;
                },
                getValue: function() {
                    return editor.getValue();
                }
            };
            return api;
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
                    editor = createEditor(layout.cells('b'), 'Config Handler');
                } else {
                    win.show();
                }
                api.setData(data);
                win.setModal(true);
                return api;
            },
            hide: function() {
                win.hide();
                editor.setLabel('Config Handler');
                return api;
            },
            setData: function(entity) {
                form.setData(entity.config);
                return api;
            }
        };
        return api;
    }
);