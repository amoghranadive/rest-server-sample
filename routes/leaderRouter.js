var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify');

var router = express.Router();

router.use(bodyParser.json());

router.route('/')
.all(function(req, res, next) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    next();
})

.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    res.end('Will send all the leadership info to you!');
})

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    res.end('Will add the leader: ' + req.body.name + ' with details: ' + req.body.description);
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    res.end('Deleting all leadership info');
});


router.route('/:id')
.all(function(req, res, next) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    next();
})

.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    res.end('Will send details of the leader: ' + req.params.id +' to you!');
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    res.write('Updating the leader: ' + req.params.id + '\n');
    res.end('Will update the leader: ' + req.body.name + 
            ' with details: ' + req.body.description);
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    res.end('Deleting leader: ' + req.params.id);
});

module.exports = router;