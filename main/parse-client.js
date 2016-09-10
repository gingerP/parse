(function () {
    'use strict';

    global._req = require('app-root-path').require;
    var child = require('child_process');
    var logger = _req('src/js/logger').create('ParseClientMaster', 'logs/ParseClientMaster.log');
    var childProcess;
    var MANAGING_TIMEOUT = 1000;
    var MAX_MEMORY = 1024 * 1024 * 500;

    function startChild() {
        childProcess = child.fork('./main/parse-client-child');
        childProcess.on('message', function(message) {
            if (message) {
                if (message.memory && message.memory.heapUsed > MAX_MEMORY) {
                    restartChild();
                } else if (message === 'request_for_restart') {
                    logger.warn('Request for restart.');
                    restartChild();
                }

            }
        });
        logger.warn('Child process was started (id: %s).', childProcess.pid);
    }

    function stopChild() {
        var id;
        if (childProcess) {
            id = childProcess.pid;
            childProcess.kill();
            logger.warn('Child process was stopped (id: %s).', id);
        }
    }

    function restartChild() {
        stopChild();
        startChild();
    }

    function startManaging() {
        setInterval(function() {
            childProcess && childProcess.send('memory');
        }, MANAGING_TIMEOUT);
    }

    startChild();
    startManaging();

})();
