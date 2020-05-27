import Oauth from './Oauth.model';
import config from '../../config/environment';
import {jwtdata} from '../../config/commonHelper';
import jwt from 'jsonwebtoken';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if(entity) {
            return res.status(statusCode)
                .json(entity);
        }
        return null;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode)
            .send(err);
    };
}

export function facebookCallback(req, res, next) {
    let expiresIn = 60 * 60 * 24; // expires in 24 hours
    let accessToken = jwt.sign({user: req.user.userProfile}, jwtdata.jwtSecretKey, {
        expiresIn: expiresIn
    });
    //Todo Get Facebook Token.
    //Todo Get FaceBook All Pages.
    res.redirect(config.FbAPP.successURL + '?access_token=' + accessToken);
}
