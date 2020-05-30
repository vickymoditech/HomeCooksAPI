let express = require('express');
let controller = require('./keyword.controller');
import validation from '../Validation';

let router = express.Router();

router.get('/:id', validation.validateAuthorization, controller.index);
router.post('/', validation.validateAuthorization, controller.create);
router.delete('/', validation.validateAuthorization, controller.destroy);

module.exports = router;
