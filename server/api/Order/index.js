var express = require('express');
var controller = require('./Order.controller');

var router = express.Router();

router.get('/:id', controller.show);

module.exports = router;
