var http = require('http');

var httpAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 3000
});
var options = {
    host: 'oz.by',
    path: '/',
    method: 'GET',
    agent: httpAgent,
    headers: {
        connection: 'keep-alive',
        accept: '*/*',
        //'Content-Length': 5000,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.94 Safari/537.36',
        //'accept-encoding': 'gzip, deflate, sdch',
        'accept-language': 'en-US,en;q=0.8,he;q=0.6,ru;q=0.4'
    }
};
/*http.get('http://oz.by', function(response) {
    response.resume();
}).on('error', function() {

});*/
console.time('Request');
var request = http.request(options, function (res) {
    var data = '';
    var index = 0;
    res.on('data', function (chunk) {
        data += chunk;
        index++;
    });
    res.on('end', function () {
        console.log('Size: ' + data.length);
        console.log('Count: ' + index);
        console.timeEnd('Request');
    });
});
request.on('error', function (e) {
});
request.end();
