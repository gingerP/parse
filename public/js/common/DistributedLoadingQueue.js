var wsServer;
var clientTasksLimit = 100;
var manageOrphanTasksInterval = 3000; //ms
var instance;
DistributedLoadingQueue = function() {
    this.clients = [];
    this.orphanTasks = [];
    this.resolvers = [];
    this.manageOrphanTasks();
    this.initBusinessLogic();
};

DistributedLoadingQueue.prototype.add = function(task) {
    var inst = this;
    this.orphanTasks.push(task);
    return new Promise(function(resolve) {
        inst.resolvers.push({
            url: task.url,
            resolver: resolve
        })
    });
};

DistributedLoadingQueue.prototype.getBestClient = function() {
    var client = null;
    if (this.clients.length) {
        this.clients.sort(function(client1, client2) {
            return client1.tasks.length - client2.tasks.length;
        });
        if (this.clients[0].tasks < clientTasksLimit) {
            client = this.clients[0];
        }
    }
    return client;
};

DistributedLoadingQueue.prototype.initBusinessLogic = function() {
    var inst = this;
    wsServer.addListener('new_connection', function(connectionWrapper) {
        if (connectionWrapper.getTopic() == 'parser_client') {
            inst.clients.push({
                client: connectionWrapper,
                tasks: []
            })
        }
    });
    wsServer.addListener('income_parsed_data', function(data) {
        inst.resolveTask(data);
    });
    wsServer.addListener('remove_connection', function(connection, reason) {
        inst.removeClientByConnection(connection);
    });
};

DistributedLoadingQueue.prototype.manageOrphanTasks = function() {
    var inst = this;
    setInterval(function() {
        var client = inst.getBestClient();
        var tasksForClient = [];
        var reasonableTasksNumber = 0;
        if (inst.orphanTasks.length && inst.clients.length && client) {
            while(client) {
                reasonableTasksNumber = clientTasksLimit - client.tasks.length;
                tasksForClient = inst.orphanTasks.splice(0, reasonableTasksNumber);
                inst.addTasksToClient(tasksForClient, client);
                client = inst.orphanTasks.length? inst.getBestClient(): null;
            }
        }
    }, manageOrphanTasksInterval);
};

DistributedLoadingQueue.prototype.addTasksToClient = function(tasks, client) {
    var tasksPerConfigs = {};
    var key;
    tasks = Array.isArray(tasks)? tasks: [tasks];
    tasks.forEach(function(task) {
        tasksPerConfigs[task.code] = tasksPerConfigs[task.code] || {
                step: 'ItemStepClient',
                configCode: task.code,
                config: task.config,
                urls: []
            };
        tasksPerConfigs[task.code].urls.push(task.url);
        client.tasks.push({
            task: task,
            inProcess: true
        });
    });
    for (key in tasksPerConfigs) {
        client.client.sendData(tasksPerConfigs[key], 'parse_params');
    }
};

DistributedLoadingQueue.prototype.removeClientByConnection = function(connection) {
    var inst = this;
    function reAddToQueue(tasksFromClient) {
        tasksFromClient.forEach(function(task) {
            inst.orphanTasks.push(task.task);
        });
    }
    if (this.clients.length) {
        this.clients.every(function(client, index) {
            if (client.client.equalConnection(connection)) {
                reAddToQueue(client.tasks);
                client.tasks = null;
                inst.clients.splice(index, 1);
                return false;
            }
            return true;
        });
    }
};

DistributedLoadingQueue.prototype.resolveTask = function(data) {
    var url = data.extend.url;
    this.removeTaskFromClient(url);
    this.resolvers.every(function(resolver) {
        if (resolver.url == url) {
            resolver.resolver(data);
            console.log('Task for url "%s" was resolved.', url);
            return false;
        }
        return true;
    });
};

DistributedLoadingQueue.prototype.removeTaskFromClient = function(url) {
//TODO
};

DistributedLoadingQueue.prototype.start = function() {};

module.exports = {
    class: DistributedLoadingQueue,
    instance: function(http) {
        if (!instance && !wsServer) {
            wsServer = require('../common/WSServer').instance(http.server);
            instance = new DistributedLoadingQueue();
        }
        return instance;
    }
};
