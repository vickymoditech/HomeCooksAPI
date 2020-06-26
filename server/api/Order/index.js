let express = require('express');
let controller = require('./Order.controller');

let router = express.Router();

router.get('/paymentCallback', controller.paymentCallbackGET);
router.get('/customer/:id', controller.order);
router.get('/:id', controller.show);
router.put('/', controller.updateOrder);
router.post('/checkout/:id', controller.checkout);
router.post('/paymentCallback', controller.paymentCallbackPOST);

module.exports = router;
