(function() {
    'use strict';

    var utils = require('./src/js/utils');
    var express = require('express');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var UserService = require('./src/js/service/UserService').instance;
    var redirectPath = '/admin';
    var handlers = [
        {path: [
            '/admin/home',
            '/admin/sys-settings',
            '/admin/schedules',
            '/admin/constructors',
            '/admin/api',
            '/admin/cache'
        ],
            fn: function(req, res) {
                extendSession(req);
                res.sendFile(__dirname + '/src/web/home.html');
            }}
    ];

    function extendSession(req) {
        req.session.touch();
    }

    function initPassport(app) {
        app.use(passport.initialize());
        app.use(passport.session());

        passport.serializeUser(function(user, done) {
            done(null, user.username);
        });
        passport.deserializeUser(function(id, done) {
            UserService.getUser(id).then(function(user) {
                done(null, user);
            });
        });
    }

    function initLoginLogout(app) {
        app.get('/admin', function(req, res) {
            res.sendFile(__dirname + '/src/web/login.html');
        });
        app.get('/admin/logout', function(req, res) {
            req.logout();
            res.redirect(redirectPath);
        });
        app.get('/admin/login',
            passport.authenticate('login', {
                failureRedirect: redirectPath,
                successRedirect: '/admin/home'
            })/*,
            function(req, res) {
                res.redirect();
            }*/
        );

        passport.use('login', new LocalStrategy({
                passReqToCallback : true
            },
            function(request, username, password, done) {
                UserService.doesUserExist(username, password).then(function(userExist) {
                    if (!userExist) {
                        return done(null, false, request.flash('message', 'Invalid password or username'))
                    }
                    return done(null, {
                        username: username,
                        password: password
                    });
                });
            }
        ));
    }

    function isAuthenticated(req, res, next) {
        //if (req.isAuthenticated()) {
            return next();
        //}

        //res.redirect(redirectPath);
    }

    module.exports = {
        init: function(app) {
            initPassport(app);
            initLoginLogout(app);
            app.use('/static/css', express.static(__dirname + '/src/web/css'));
            app.use('/static/css/bower_components', express.static(__dirname + '/bower_components'));
            app.use('/static/images', express.static(__dirname + '/src/web/images'));
            app.use('/static/js', express.static(__dirname + '/src/web/js'));
            app.use('/static/dhtmlx', express.static(__dirname + '/src/web/dhtmlx'));
            app.use('/static/js/ace', express.static(__dirname + '/src/web/ace'));
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
})();
