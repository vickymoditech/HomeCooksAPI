let express = require('express');
let controller = require('./Order.controller');

let router = express.Router();

router.get('/paymentCallback', controller.paymentCallback);
router.get('/customer/:id', controller.order);
router.get('/:id', controller.show);
router.put('/', controller.updateOrder);
router.post('/checkout/:id', controller.checkout);

module.exports = router;
