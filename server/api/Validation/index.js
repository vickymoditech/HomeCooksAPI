import jwt from 'jsonwebtoken';
import {jwtdata} from '../../config/commonHelper';
import Joi from 'joi';

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
            jwt.verify(token, jwtdata.jwtSecretKey, function(err, decoded) {
                if(err) {
                    let statusCode = 401;
                    return res.status(statusCode)
                        .json({
                            user_msg: 'Failed to authenticate token.',
                            dev_msg: 'Failed to authenticate token.',
                        });
                } else {
                    // if everything is good, save to request for use in other routes
                    if(decoded.user.Block === false) {
                        req.decoded = decoded;
                        next();
                    } else {
                        let statusCode = 403;
                        return res.status(statusCode)
                            .json({
                                user_msg: 'UnAuthorized user.',
                                dev_msg: 'UnAuthorized user.',
                            });
                    }
                }
            });
        } else {
            // if there is no token
            // return an error
            let statusCode = 401;
            return res.status(statusCode)
                .json({
                    user_msg: 'No token provided.',
                    dev_msg: 'No token provided.',
                });
        }
    },
};
