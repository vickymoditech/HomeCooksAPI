let express = require('express');
let controller = require('./Order.controller');

let router = express.Router();

router.get('/checkout', controller.checkout);
router.get('/customer/:id', controller.order);
router.get('/:id', controller.show);
router.put('/', controller.updateOrder);
router.post('/checkout', controller.checkout);
router.put('/checkout', controller.checkout);

module.exports = router;
