var utils = require('./public/js/utils');
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserDBM = require('./public/js/db/UserDBM');
var userDBM = new UserDBM();

var redirectPath = '/admin';

var handlers = [
    {path: [
        '/admin/home',
        '/admin/sys-settings',
        '/admin/schedules',
        '/admin/constructors',
        '/admin/cache'
    ],
        fn: function(req, res) {
        extendSession(req);
        res.sendFile(__dirname + '/web/home.html');
    }}
];

function extendSession(req) {
    console.log('old maxAge: ' + req.session.cookie.maxAge);
    req.session.touch();
    console.log('new maxAge: ' + req.session.cookie.maxAge);
}

function initPassport(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user.username);
    });
    passport.deserializeUser(function(id, done) {
        userDBM.getUser(id, function(user) {
            done(null, user);
        });
    });
}

function initLoginLogout(app) {
    app.get('/admin', function(req, res) {
        res.sendFile(__dirname + '/web/login.html');
    });
    app.get('/admin/logout', function(req, res) {
        req.logout();
        res.redirect(redirectPath);
    });
    app.get('/admin/login',
        passport.authenticate('login', {failureRedirect: redirectPath}),
        function(req, res) {
            res.redirect('/admin/home');
        }
    );
}

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect(redirectPath);
}

passport.use('login', new LocalStrategy({
        passReqToCallback : true
    },
    function(request, username, password, done) {
        userDBM.doesUserExist(username, password, function(userExist) {
            if (!userExist) {
                return done(null, false, request.flash('message', 'Invalid password or username'))
            } else {
                return done(null, {
                    username: username,
                    password: password
                })
            }
        });
    }
));

module.exports = {
    init: function(app) {
        initPassport(app);
        initLoginLogout(app);
        app.use('/static/css', express.static(__dirname + '/web/css'));
        app.use('/static/css/bower_components', express.static(__dirname + '/bower_components'));
        app.use('/static/images', express.static(__dirname + '/web/images'));
        app.use('/static/js', express.static(__dirname + '/web/js'));
        app.use('/static/dhtmlx', express.static(__dirname + '/web/dhtmlx'));
        app.use('/static/js/bower_components', express.static(__dirname + '/bower_components'));

        handlers.forEach(function(handler) {
            if (Array.isArray(handler.path)) {
                handler.path.forEach(function(path) {
                    app.get(path,
                        isAuthenticated,
                        handler.fn
                    );
                })
            } else {
                app.get(handler.path,
                    isAuthenticated,
                    handler.fn
                );
            }
        });
        return this;
    }
};

