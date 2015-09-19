var express = require('express');
var router = express.Router();
module.exports = router;

router.get('/list', function(req, res, next) {
    res.send({ title: 'Express' });
    //res.json({ title: 'Express' });
});