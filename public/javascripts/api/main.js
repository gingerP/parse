var u = require('../utils');
var c = require('../constants');
var express = require('express');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var request = require('request');
var router = express.Router();

var getter = {
    value: function(dom, cfg, parser) {
        return parser(dom).text();
    },
    attribute: function(dom, cfg, parser) {
        if (dom) {
            return parser(dom).attr(cfg.attribute);
        }
        return '';
    },
    notNull: function(dom, cfg, parser) {
        return !!dom.length;
    },
    htmlString: function(dom, cfg, parser) {
        return parser(dom).text();
    }
};
var levels = {
    0: {
        relSelector: '.main-nav__list__li ',
        data: [
            {name: 'title', selector: '>.main-nav__list__item', handler: getter.value},
            {name: 'href', selector: '>a.main-nav__list__item', handler: getter.attribute, attribute: 'href'},
            {name: 'spec', selector: '>.main-nav__list__item.main-nav__list__item_spec', handler: getter.notNull}
        ]
    },
    1: {
        relSelector: '.global-ppnavlist>ul.global-ppnavlist__ul>li.global-ppnavlist__li',
        data: [
            {name: 'title', selector: '>ul.global-ppnavlist__inline a', handler: getter.value},
            {name: 'href', selector: '>ul.global-ppnavlist__inline a', handler: getter.attribute, attribute: 'href'}
        ]
    },
    2: {
        relSelector: '.global-ppnavlist>ul.global-ppnavlist__ul',
        data: [
            {name: 'title', selector: '>li.global-ppnavlist__li>h3>a', handler: getter.value},
            {name: 'href', selector: '>li.global-ppnavlist__li>h3>a', handler: getter.attribute, attribute: 'href'}
        ]
    },
    3: {
        relSelector: '>li.global-ppnavlist__li.global-ppnavlist__cats>li',
        data: [
            {name: 'title', selector: '>a', handler: getter.value},
            {name: 'href', selector: '>a', handler: getter.attribute, attribute: 'href'}
        ]
    }
};
var levelConfig =
    { node: levels['0'], children: [
        { node: levels['1']},
        { node: levels['2'], children: [
            { node: levels['3']}
        ]}
    ]
};
var childrenName = 'subcatalog';



module.exports = router;

module.stuf = (function () {
    var api = null;

    function parseSections(body) {
        return [];
    }

    function parseCatalog(body) {
        return u.extractDataFromHtml(body, levelConfig, '.main-nav__inner', 'subcatalog');
    }

    function main(req, res, callback) {
        u.loadDom(c.OZ_HOME, function(body) {
            var result = {
                sections: parseSections(body),
                catalog: parseCatalog(body)
            };
            callback(result);
        })
    }

    api = {
        init: function() {

        },
        main: function(req, res, callback) {
            main(req, res, callback);
        }
    };
    return api;
})();

(function(module) {
    var routes = [
        {path: '/get', method: 'main', async: true}
    ];
    routes.forEach(function(rout) {
        router.get(rout.path, (function() {
            var rt = rout;
            return function(req, res) {
                if (rt.async) {
                    module[rt.method](req, res, function(data) {
                        res.send(data);
                    })
                } else {
                    res.send(module[rt.method](req, res));
                }
            }
        })())
    })

})(module.stuf);