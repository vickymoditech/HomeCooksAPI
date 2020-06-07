let express = require('express');
let controller = require('./fbPages.controller');
import validation from '../Validation';

let router = express.Router();

router.get('/', validation.validateAuthorization, controller.index);

router.post('/status/:FbPageId', validation.validateAuthorization, controller.status);

router.post('/MessageFormat/:FbPageId', validation.validateAuthorization, controller.MessageFormat);

router.get('/Message/:FbSPID', validation.validateAuthorization, controller.PersonalMessage);

router.get('/All/Message/:FbPageId', validation.validateAuthorization, controller.Messages);

module.exports = router;
