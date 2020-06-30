let express = require('express');
let controller = require('./Order.controller');

let router = express.Router();

router.get('/customer/:id', controller.order);
router.get('/orderSearch/:id', controller.orderSearch);
router.get('/:id', controller.show);
router.put('/', controller.updateOrder);
router.post('/paymentCallback', controller.paymentCallback);
router.post('/checkout/:id', controller.checkout);
router.post('/importOrder/:FbPageId', controller.importOrder);

module.exports = router;
