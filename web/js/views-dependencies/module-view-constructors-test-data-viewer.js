define(['/static/js/bower_components/vkBeautify/vkbeautify.js'],
    function() {
        var api;
        var editor;
        var editorContainer;
        var container;

        function init(container) {
            editorContainer = document.createElement('PRE');
            editorContainer.id = U.getRandomString();
            container.attachObject(editorContainer);
            container.setText('Test');
            if (container.cell && container.cell.className) {
                container.cell.className += ' test-data-view';
            }
        }

        api = {
            init: function(_container) {
                container = _container;
                init(container);
                return api;
            },
            setData: function(data) {
                var data = vkbeautify.json(data);
                editorContainer.innerHTML = data;
                return api;
            },
            getContainer: function() {
                return container;
            }
        };
        return api;
    }
);