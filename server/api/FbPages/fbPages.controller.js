import FbPages from './fbPages.model';
import {errorJsonResponse, FB_PAGES, getGuid, setCache} from '../../config/commonHelper';
import Order from '../Order/Order.model';
import config from '../../config/environment';
import Log from '../../config/Log';
import axios from 'axios';

let moment = require('moment-timezone');

// Gets a list of FbPages
export async function index(req, res) {
    try {
        let query = {};
        const user = req.decoded.user;
        if(user.is_admin === false) {
            query = {FbUserId: user.FBId};
        }
        const GetallFbPages = await FbPages.find(query, {
            FbPageId: 1, FbPageName: 1,
            Is_Live: 1,
            ReplyMessage: 1,
            OutOfStockMessage: 1,
            PersonalMessage: 1
        });
        res.status(200)
            .json(GetallFbPages);
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function status(req, res, next) {
    try {
        let momentDateTime = moment()
            .tz('Asia/Singapore')
            .format();
        let currentDate = new Date(momentDateTime);
        const result = await FbPages.updateOne({FbPageId: req.params.FbPageId}, {
                $set: {
                    Is_Live: req.body.status,
                    StatusActiveTime: currentDate.toUTCString()
                }
            })
        ;
        await GetallFbPages();
        if(result.ok === 1) {
            res.status(200)
                .json({
                    FbPageId: req.params.FbPageId,
                    result: req.body.status
                });
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function MessageFormat(req, res, next) {
    try {
        const result = await FbPages.updateOne({FbPageId: req.params.FbPageId}, {
            $set: {
                ReplyMessage: req.body.ReplyMessage,
                OutOfStockMessage: req.body.OutOfStockMessage,
                PersonalMessage: req.body.PersonalMessage
            }
        });
        await GetallFbPages();
        if(result.ok === 1) {
            res.status(200)
                .json({
                    FbPageId: req.params.FbPageId,
                    result: {
                        ReplyMessage: req.body.ReplyMessage,
                        OutOfStockMessage: req.body.OutOfStockMessage,
                        PersonalMessage: req.body.PersonalMessage
                    }
                });
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function PersonalMessage(req, res, next) {
    try {
        const uniqueId = getGuid();
        const result = await Order.findOne({FbSPID: req.params.FbSPID});
        console.log(result);
        if(result) {
            const PageResult = await FbPages.findOne({FbPageId: result.FbPageId});
            console.log(PageResult);
            const FbPageId = PageResult.FbPageId;
            const FBSPID = req.params.FbSPID;
            const messageDetail = PageResult.PersonalMessage;
            const api = {
                method: 'POST',
                url: `${config.FbAPP.Base_API_URL}/${PageResult.FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`,
                data: {
                    'messaging_type': 'RESPONSE',
                    'recipient': {
                        'id': FBSPID
                    },
                    'message': {
                        'text': messageDetail
                    }
                }
            };
            axios(api)
                .then((response) => {
                    if(response.status === 200) {
                        Log.writeLog(Log.eLogLevel.info, `[sendMessageToUser] PageId - [${FbPageId}] FBSPID - [${FBSPID}] message - [${messageDetail}] : ${'success'}`, uniqueId);
                    }
                })
                .catch((error) => {
                    res.status(401)
                        .json(errorJsonResponse(error.toString(), error.toString()));
                    Log.writeLog(Log.eLogLevel.error, `[sendMessageToUser] PageId - [${FbPageId}] FBSPID - [${FBSPID}] message - [${messageDetail}] : ${errorJsonResponse(error.message.toString(), error.message.toString())}`, uniqueId);
                });

            Log.writeLog(Log.eLogLevel.debug, `[sendMessageToUser] Request URL - ${config.FbAPP.Base_API_URL}/${PageResult.FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`, uniqueId);
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function GetallFbPages() {
    try {
        const allPages = await FbPages.find({}, {
            FbPageId: 1, Is_Live: 1,
            ReplyMessage: 1,
            OutOfStockMessage: 1,
            StatusActiveTime: 1
        })
            .exec();
        setCache(FB_PAGES, allPages);
        return allPages;
    } catch(error) {
        console.log(error);
        return null;
    }
}


