let express = require('express');
let controller = require('./Order.controller');

let router = express.Router();

router.get('/:id', controller.show);
router.get('/customer/:id', controller.order);
router.put('/', controller.updateOrder);

module.exports = router;
