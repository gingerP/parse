$(document).ready(function() {
    sideBarModule
        .addPageLoader({
            id: 'constructors',
            title: 'Pages',
            icon: 'pages',
            'default': true
        })
        .addPageLoader({
            id: 'sys-settings',
            title: 'System Settings',
            icon: 'system-settings'
        })
        .addPageLoader({
            id: 'schedules',
            title: 'Schedules & Cache'
        })
        .addPageLoader({
            id: 'cache',
            title: 'Cache'
        })
        .addPageLoader({
            id: 'api',
            icon: 'pages',
            title: 'Apis'
        })
        .init()
});

sideBarModule = (function() {
    var api = null;
    var sideBar = null;
    var layout = null;
    var logoId = 'logo';
    var views = [];

    function getViewIdByUrl() {
        var res = /admin\/([\w\_\-]*){1}$/g.exec(location.pathname);
        if (res && res.length > 1) {
            return res[1];
        }
        return null;
    }

    function getViewByUrl() {
        var id = getViewIdByUrl();
        if (!id) {
            return null;
        }
        return getView(id);
    }

    function getView(id) {
        var result = null;
        $.each(views, function(i, view) {
            if (view.id == id) {
                result = view;
                return false;
            }
        });
        return result;
    }

    function getDefaultView() {
        var result = null;
        $.each(views, function(i, view) {
            if (view['default']) {
                result = view;
            }
            return !view['default'];
        });
        return result;
    }

    function createSideBar() {
        var side = new dhtmlXSideBar({
            parent: document.body,
            template: "tiles",
            width: 160,
            single_cell: false
        });
        var view = getViewByUrl();
        initSideBarEvents(side);
        fillSideBar(side);
        if (!view) {
            view = getDefaultView();
            if (view) {
                U.changeUrlH5('/admin/' + view.id);
            }
        }
        if (view) {
            side.items(view.id).setActive();
            side.callEvent("onSelect", [view.id, null]);
        }
        side.side.className += ' dhxsidebar_tpl_tiles ';
        return side;
    }

    function fillSideBar(sideBar) {
        $.each(views, function(i, view) {
            sideBar.addItem({
                id: view.id,
                text: view.data.title,
                icon: view.data.icon
            });
        })
    }

    function createLogo(sideBar) {
        var items = sideBar.side.getElementsByClassName('dhxsidebar_side_items');
        if (items && items.length) {
            items[0].innerHTML = [
                '<div>',
                    '<img src="">',
                    '<div>',
                    'Vinni',
                    '</div>',
                '</div>'
            ].join('') + items[0].innerHTML;

        }
    }

    function loadAndExecModule(view) {
        require([view.data.moduleUrl], function(module) {
            var activeSideBarCell = sideBar.cells(view.id);
            if (U.hasContent(module)) {
                view.module = module;
                view.module.init(activeSideBarCell);
            }
        })
    }

    function initSideBarEvents(sideBar) {
        sideBar.attachEvent("onBeforeSelect", function(id, lastId){
            return id != logoId;
        });
        sideBar.attachEvent("onSelect", function(id, lastId){
            var view = getView(id);
            if (view) {
                U.changeUrlH5('/admin/' + view.id);
                if (!view.module) {
                    if (U.hasContent(view.data.moduleUrl)) {
                        loadAndExecModule(view);
                    } else {
                        console.error('Incorrect module url: "' + view.data.moduleUrl + '"');
                    }
                }
            }
            return true;
        });
    }

    api = {
        init: function() {
            sideBar = createSideBar();
            return api;
        },
        addPageLoader: function(vars) {
            var id = vars.id;
            var cfg = {
                id: id,
                data: {
                    moduleUrl: '/static/js/views/module-' + (vars.name || id) + '.js',
                    title: vars.title,
                    icon: '/static/images/' + (vars.icon || id) + '.png'
                },
                'default': !!vars['default'],
                module: null
            };
            views.push(cfg);
            return api;
        }
    };
    return api;
})();
