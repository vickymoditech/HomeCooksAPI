import validations from './validation';
import {errorJsonResponse} from '../../config/commonHelper';
import Oauth from './Oauth.model';
import config from '../../config/environment';

let express = require('express');
let controller = require('./Oauth.controller');
let router = express.Router();

let passport = require('passport');
let FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new FacebookStrategy({
        clientID: config.FbAPP.AppId,
        clientSecret: config.FbAPP.AppSecret,
        callbackURL: config.FbAPP.callbackURL,
        profileFields: ['id', 'first_name', 'last_name', 'email']

    },
    function(accessToken, refreshToken, profile, cb) {
        Oauth.findOrCreate({FBId: profile.id}, {
            FirstName: profile._json.first_name,
            LastName: profile._json.last_name,
            email: profile._json.email,
            Password: '',
            Provider: profile.provider
        }, function(err, userProfile) {
            const user = {
                accessToken,
                userProfile
            };
            return cb(err, user);
        });
    }
));

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', {failureRedirect: config.FbAPP.failURL}), controller.facebookCallback);

router.use(function(err, req, res, next) {
    let arrayMessages = [];
    let allErrorField;
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
