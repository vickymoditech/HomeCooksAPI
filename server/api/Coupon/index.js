var express = require('express');
var controller = require('./Coupon.controller');

var router = express.Router();

router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/', controller.destroy);

module.exports = router;
