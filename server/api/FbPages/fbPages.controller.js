import FbPages from './fbPages.model';
import {errorJsonResponse, FB_PAGES, setCache} from '../../config/commonHelper';
import Keyword from '../keyword/keyword.model';

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
        const result = await FbPages.updateOne({FbPageId: req.params.FbPageId}, {$set: {Is_Live: req.body.status}});
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


export async function GetallFbPages() {
    try {
        const allPages = await FbPages.find({}, {
            FbPageId: 1, Is_Live: 1,
            ReplyMessage: 1,
            OutOfStockMessage: 1
        })
            .exec();
        setCache(FB_PAGES, allPages);
        return allPages;
    } catch(error) {
        console.log(error);
        return null;
    }
}


