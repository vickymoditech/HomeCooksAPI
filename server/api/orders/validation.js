let jwtDecode = require('jwt-decode');
//import Joi from 'joi';

export default {
    // route middleware to verify a token
    validateAuthorization: function(req, res, next) {
        // check header or url parameters or post parameters for token
        let authorizationHeader = req.headers['authorization'];
        let token = '';
        if(authorizationHeader) {
            let headerParts = authorizationHeader.trim()
                .split(' ');
            if(headerParts[0].toLowerCase() === 'bearer') {
                token = headerParts[headerParts.length - 1];
            }
            else {
                let statusCode = 401;
                return res.status(statusCode)
                    .json({
                        user_msg: 'Failed to authenticate token.',
                        dev_msg: 'Failed to authenticate token.',
                    });
            }
        }

        // decode token
        if(token) {
            // verifies secret and checks exp
            const decode = jwtDecode(token);
            if(decode) {
                if(decode.isAdmin) {
                    req.decoded = decode;
                    next();
                } else {
                    let statusCode = 403;
                    return res.status(statusCode)
                        .json({
                            user_msg: 'UnAuthorized user.',
                            dev_msg: 'UnAuthorized user.',
                        });
                }
            } else {
                let statusCode = 401;
                return res.status(statusCode)
                    .json({
                        user_msg: 'Failed to authenticate token.',
                        dev_msg: 'Failed to authenticate token.',
                    });
            }
        } else {
            // if there is no token
            let statusCode = 401;
            return res.status(statusCode)
                .json({
                    user_msg: 'No token provided.',
                    dev_msg: 'No token provided.',
                });
        }
    },
};
