var express = require('express');
var controller = require('./Order.controller');

var router = express.Router();

router.get('/:id', controller.show);
router.get('/customer/:id', controller.order);

module.exports = router;
