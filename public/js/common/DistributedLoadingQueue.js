var wsServer = require('../common/WSServer').instance();
var clientTasksLimit = 100;
var manageOrphanTasksInterval = 3000; //ms
DistributedLoadingQueue = function() {
    this.clients = [];
    this.orphanTasks = [];
    this.manageOrphanTasks();
    this.initBusinessLogic();
};

DistributedLoadingQueue.prototype.add = function(task) {
    this.orphanTasks.push(task);
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
        if (connectionWrapper.getTopic() == 'parser-client') {
            inst.clients.push({
                client: connectionWrapper,
                tasks: []
            })
        }
    });
    wsServer.addListener('parser-client', function(data) {
        console.log(data);
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
    tasks = Array.isArray(tasks)? tasks: [tasks];
    tasks.forEach(function(task) {
        tasksPerConfigs[task.code] = tasksPerConfigs[task.code] || {
                step: 'GenericStep',
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
    for (var key in tasksPerConfigs) {
        client.sendData(tasksPerConfigs[key]);
    }
};
