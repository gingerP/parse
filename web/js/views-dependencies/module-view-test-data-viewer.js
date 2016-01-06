define(['/static/js/bower_components/vkBeautify/vkbeautify.js'],
    function() {
        return {
            create: function() {
                var api;
                var editor;
                var editorContainer;
                var container;

                function init(container, title) {
                    var doc = document.createElement('DIV');
                    var editor;
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
                    return {
                        setValue: function(value) {
                            value = vkbeautify.json(value);
                            editor.setValue(value);
                            editor.clearSelection();
                        },
                        getValue: function() {
                            return editor.getValue();
                        }
                    };
                }

                api = {
                    init: function(_container, title) {
                        container = _container;
                        editor = init(container, title);
                        return api;
                    },
                    setData: function(data) {
                        editor.setValue(data);
                        return api;
                    },
                    getContainer: function() {
                        return container;
                    }
                };
                return api;
            }
        }
    }
);