let express = require('express');
let controller = require('./UserDetail.controller');
import validation from '../Validation';

let router = express.Router();

router.get('/:FbPageId', validation.validateAuthorization, controller.index);
router.delete('/:id', validation.validateAuthorization, controller.destroy);

module.exports = router;
