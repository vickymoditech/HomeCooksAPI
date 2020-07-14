let express = require('express');
let controller = require('./Coupon.controller');
import validation from '../Validation';

let router = express.Router();

router.get('/FbPage/:FbPageId/GetDetail/:PromoCode/Order/:orderNumber', validation.validateAuthorization, controller.getDetail);
router.get('/:id', validation.validateAuthorization, controller.show);
router.post('/', validation.validateAuthorization, controller.create);
router.put('/', validation.validateAuthorization, controller.update);
router.delete('/', validation.validateAuthorization, controller.destroy);

module.exports = router;
