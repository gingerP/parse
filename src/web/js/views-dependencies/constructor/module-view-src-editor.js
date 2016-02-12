define(['/static/js/bower_components/vkBeautify/vkbeautify.js'],
    function() {
        var api;
        var editor;
        var toolbar;
        var dataSource;

        function createToolbar(layout) {
            var toolbar = layout.attachToolbar();
            var vToolbar = new Toolbar().init(toolbar);
            vToolbar.addFeatures.apply(vToolbar, getSrcEditorFeatures());
        }

        function getSrcEditorFeatures() {
            return [
                // APPLY
                (function() {
                    var feature = new GenericFeature().init({
                        label: 'Apply',
                        type: 'button',
                        name: 'apply',
                        image: '/static/images/button_save.png',
                        imageDis: '/static/images/button_save.png'
                    });
                    feature.exec = function () {
                        var data = dataSource.updateData(true);
                        var source = editor.getValue();
                        try {
                            source = JSON.parse(source);
                        } catch(error) {
                            dhtmlx.alert({
                                title: 'Error',
                                type: 'error',
                                text: 'Incorrect source. Apply will prevent.'
                            });
                        }
                        data.levels = source.levels || [];
                        data.levelConfig = source.levelConfig || [];
                        dataSource.setData(data);
                    };
                    return feature;
                })(),
                // ROLLBACK
                (function() {
                    var feature = new GenericFeature().init({
                        label: 'Rollback',
                        type: 'button',
                        name: 'rollback',
                        image: '/static/images/button_reload.png',
                        imageDis: '/static/images/button_reload.png'
                    });
                    feature.exec = function () {
                        var data;
                        if (dataSource) {
                            data = dataSource.updateData(true);
                            editor.setValue(vkbeautify.json(JSON.stringify(data)));
                        }
                    };
                    return feature;
                })(),
                // FORMATTER
                (function() {
                    var feature = new GenericFeature().init({
                        label: 'Format',
                        type: 'button',
                        name: 'format',
                        image: '/static/images/format.png',
                        imageDis: '/static/images/format.png'
                    });
                    feature.exec = function() {
                        var value = editor.getValue();
                        editor.setValue(vkbeautify.json(value));
                    };
                    return feature;
                })()
            ];
        }

        function createEditor(layout) {
            var doc = document.createElement('DIV');
            var editor;
            doc.className += ' source-editor-container';
            layout.cells('a').attachObject(doc);
            editor = ace.edit(doc);
            editor.getSession().setMode("ace/mode/json");
            editor.setReadOnly(false);
            editor.$blockScrolling = Infinity;
            return {
                setValue: function(value) {
                    value = vkbeautify.json(value);
                    editor.setValue(value);
                    editor.clearSelection();
                },
                getValue: function() {
                    return editor.getValue();
                },
                resize: function() {
                    editor.resize();
                }
            };
        }

        api = {
            init: function(container) {
                toolbar = createToolbar(container);
                editor = createEditor(container);
                return api;
            },
            setValue: function(data) {
                editor.setValue(data);
                return api;
            },
            setDataSource: function(module) {
                dataSource = module;
                return api;
            },
            onSizeChange: function(names) {
                editor.resize();
            }
        };
        return api;
    }
);