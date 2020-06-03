import Oauth from './Oauth.model';
import FbPages from '../FbPages/fbPages.model';
import config from '../../config/environment';
import {jwtdata, errorJsonResponse} from '../../config/commonHelper';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function facebookCallback(req, res, next) {
    let UserProfile = req.user.userProfile;
    let UserPages = [];
    try {
        if(UserProfile.Block === false) {
            //Todo Get Facebook Token.
            let api = {
                method: 'GET',
                url: `${config.FbAPP.Base_API_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.FbAPP.AppId}&client_secret=${config.FbAPP.AppSecret}&fb_exchange_token=${req.user.accessToken}`
            };
            const response = await axios(api);
            api = {
                method: 'GET',
                url: `${config.FbAPP.Base_API_URL}/${UserProfile.FBId}/accounts?fields=name,access_token&access_token=${response.data.access_token}`
            };
            const pageResponse = await axios(api);
            //Todo Get Facebook Pages Token and Save into the Db.
            pageResponse.data.data.map((singlePageDetail) => {
                UserPages.push({FbPageId: singlePageDetail.id, FbPageName: singlePageDetail.name});
                FbPages.findOrCreate({FbPageId: singlePageDetail.id}, {
                    FbPageName: singlePageDetail.name,
                    FbUserId: UserProfile.FBId,
                    FbAccessToken: singlePageDetail.access_token,
                }, (err, PageResponse) => {
                    //console.log(PageResponse);
                });
            });
        }
        const expiresIn = 60 * 60 * 24; // expires in 24 hours
        const accessToken = jwt.sign({user: UserProfile}, jwtdata.jwtSecretKey, {
            expiresIn: expiresIn
        });
        res.redirect(config.FbAPP.successURL + '?access_token=' + accessToken);
    } catch(error) {
        console.log(error);
        res.redirect(config.FbAPP.failURL);
    }
}

export function login(req, res) {
    try {
        if(req.body) {
            let pass;
            let userId;
            let check_field = true;

            if(req.body.userId) {
                userId = req.body.userId;
                if(req.body.password) {
                    pass = req.body.password;
                } else {
                    check_field = false;
                    res.status(500)
                        .json(errorJsonResponse('password is required', 'password is required'));
                }
            } else {
                check_field = false;
                res.status(500)
                    .json(errorJsonResponse('userId is required', 'userId is required'));
            }

            if(check_field) {
                Oauth.findOne({userName: userId, password: pass, Block: false}, {_id: 0, __v: 0})
                    .exec(async function(err, loginUser) {
                        if(!err) {
                            if(loginUser) {
                                let expiresIn = 60 * 60 * 24; // expires in 24 hours
                                let accessToken = jwt.sign({user: loginUser}, jwtdata.jwtSecretKey, {
                                    expiresIn: expiresIn
                                });
                                res.status(200)
                                    .json({accessToken});
                            } else {
                                res.status(400)
                                    .json(errorJsonResponse('Invalid user', 'Invalid user'));
                            }
                        } else {
                            res.status(400)
                                .json(errorJsonResponse(err, 'sorry, come to the shop.'));
                        }
                    });
            }
        }
    } catch(error) {
        res.status(501)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}
