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
            Provider: profile.provider,
            userName: profile.id
        }, function(err, userProfile) {
            const user = {
                accessToken,
                userProfile
            };
            return cb(err, user);
        });
    }
));

router.get('/facebook', passport.authenticate('facebook', {authType: 'rerequest', scope: config.FbAPP.scope}));

router.get('/facebook/callback', passport.authenticate('facebook', {failureRedirect: config.FbAPP.failURL}), controller.facebookCallback);

router.post('/login', controller.login);

module.exports = router;
