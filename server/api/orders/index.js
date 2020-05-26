import validations from './validation';
import {errorJsonResponse} from '../../config/commonHelper';

let express = require('express');
let controller = require('./orders.controller');


let router = express.Router();

router.post('/', validations.validateAuthorization, controller.index);

router.use(function(err, req, res, next) {
    let arrayMessages = [];
    let allErrorField;
    console.log(err);
    for(let i = 0; i < err.errors.length; i++) {
        let Single_error = err.errors[i].messages.toString()
            .replace(/"/g, '');
        arrayMessages.push(Single_error);
    }
    allErrorField = arrayMessages.join(',');
    res.status(400)
        .json(errorJsonResponse(allErrorField, allErrorField));
});

module.exports = router;
