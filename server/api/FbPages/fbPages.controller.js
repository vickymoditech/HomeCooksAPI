import FbPages from './fbPages.model';
import {errorJsonResponse, FB_PAGES, getGuid, setCache} from '../../config/commonHelper';
import Order from '../Order/Order.model';
import config from '../../config/environment';
import Log from '../../config/Log';
import axios from 'axios';
import UserDetail from '../UserDetail/UserDetail.model';
import Keyword from '../keyword/keyword.model';
import {GetallKeywords} from '../keyword/keyword.controller';

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
            PersonalMessage: 1,
            MassMessage: 1,
            DeliveryDate: 1,
            Minimum: 1,
            ShippingMinimum: 1
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
        });
        if(req.body.status === false) {
            const findKeyword = await Keyword.find({FbPageId: req.params.FbPageId});
            findKeyword.map(async(data) => {
                await  Keyword.updateOne({_id: data._id}, {
                    maxQty: data.defaultMaxQty
                });
            });
        } else {
            await GetallKeywords();
        }
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

export async function PersonalMessage(req, res, next) {
    const uniqueId = getGuid();
    try {
        const result = await Order.findOne({FbSPID: req.params.FbSPID});
        if(result) {
            const PageResult = await FbPages.findOne({FbPageId: result.FbPageId});
            const FbPageId = PageResult.FbPageId;
            const FBSPID = req.params.FbSPID;
            let messageDetail = PageResult.PersonalMessage;
            let orderDetail = '';
            result.Items.map((singleItem) => {
                orderDetail += `- ${singleItem.itemName} : ${singleItem.keyword} : x ${singleItem.qty} : ${singleItem.total} \n    `;
            });
            messageDetail = messageDetail.replace('{order detail}', orderDetail);
            //messageDetail = messageDetail.replace('{shoppingcartlink}', config.FbAPP.ShoppingLink);
            const api = {
                method: 'POST',
                url: `${config.FbAPP.Base_API_URL}/${PageResult.FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`,
                data: {
                    'messaging_type': 'MESSAGE_TAG',
                    'tag': 'CONFIRMED_EVENT_UPDATE',
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
                        res.status(200)
                            .json({
                                result: 'successfully send',
                            });
                    }
                })
                .catch((error) => {
                    res.status(401)
                        .json(errorJsonResponse(error.toString(), error.toString()));
                    Log.writeLog(Log.eLogLevel.error, `[sendMessageToUser] PageId - [${FbPageId}] FBSPID - [${FBSPID}] message - [${messageDetail}] : ${JSON.stringify(error)}`, uniqueId);
                });

            Log.writeLog(Log.eLogLevel.debug, `[sendMessageToUser] Request URL - ${config.FbAPP.Base_API_URL}/${PageResult.FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`, uniqueId);
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
        Log.writeLog(Log.eLogLevel.error, `[sendMessageToUser] : ${JSON.stringify(error)}`, uniqueId);
    }
}

export async function Messages(req, res, next) {
    try {
        const uniqueId = getGuid();
        const AllUser = await UserDetail.find({FbPageId: req.params.FbPageId});
        const PageResult = await FbPages.findOne({FbPageId: req.params.FbPageId});
        AllUser.map(async(singleUser) => {
            const result = await Order.findOne({FbSPID: singleUser.FbSPID});
            const FbPageId = PageResult.FbPageId;
            const FBSPID = singleUser.FbSPID;
            let messageDetail = PageResult.MassMessage;
            let orderDetail = '';
            if(result) {
                result.Items.map((singleItem) => {
                    orderDetail += `- ${singleItem.itemName} : x ${singleItem.qty} : ${singleItem.total} \n    `;
                });
                messageDetail = messageDetail.replace('{order detail}', orderDetail);
                messageDetail = messageDetail.replace('{shoppingcartlink}', config.FbAPP.ShoppingLink);
                const api = {
                    method: 'POST',
                    url: `${config.FbAPP.Base_API_URL}/${FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`,
                    data: {
                        'messaging_type': 'MESSAGE_TAG',
                        'tag': 'CONFIRMED_EVENT_UPDATE',
                        'recipient': {
                            'id': FBSPID
                        },
                        'message': {
                            'text': messageDetail
                        }
                    }
                };
                try {
                    const result = axios(api);
                    Log.writeLog(Log.eLogLevel.info, `[Messages] Request URL - ${config.FbAPP.Base_API_URL}/${PageResult.FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`, uniqueId);
                } catch(error) {
                    Log.writeLog(Log.eLogLevel.error, `[Messages] ${JSON.stringify(error)}`, uniqueId);
                    Log.writeLog(Log.eLogLevel.error, `[Messages] Request URL - ${config.FbAPP.Base_API_URL}/${PageResult.FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`, uniqueId);
                }
            }
            Log.writeLog(Log.eLogLevel.debug, `[Messages] Request URL - ${config.FbAPP.Base_API_URL}/${PageResult.FbPageId}/messages?&access_token=${PageResult.FbAccessToken}`, uniqueId);
        });
        res.status(200)
            .json({
                result: 'successfully send'
            });
    } catch(error) {
        console.log(error);
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function Update(req, res, next) {
    try {
        const result = await FbPages.findOneAndUpdate({FbPageId: req.params.FbPageId}, req.body, {new: true});
        await GetallFbPages();
        if(result) {
            res.status(200)
                .json({
                    result: 'Successfully updated',
                    data: result
                });
        } else {
            res.status(500)
                .json(errorJsonResponse(JSON.stringify(result), JSON.stringify(result)));
        }
    } catch(error) {
        console.log(error);
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
            StatusActiveTime: 1,
            PersonalMessage: 1,
            MassMessage: 1,
            DeliveryDate: 1,
            Minimum: 1,
            ShippingMinimum: 1
        })
            .exec();
        setCache(FB_PAGES, allPages);
        return allPages;
    } catch(error) {
        console.log(error);
        return null;
    }
}


