import FbPages from '../FbPages/fbPages.model';
import config from '../../config/environment';
import axios from 'axios/index';
import {socketPublishMessage} from '../Socket';
import {getCache, KEY_WORDS, FB_PAGES, getGuid, errorJsonResponse, setCache} from '../../config/commonHelper';
import {GetallKeywords} from '../keyword/keyword.controller';
import {GetallFbPages} from '../FbPages/fbPages.controller';
import Order from '../Order/Order.model';
import Keyword from '../keyword/keyword.model';
import UserDetail from '../UserDetail/UserDetail.model';
import Log from '../../config/Log';

let moment = require('moment-timezone');


let GetAllPages = {
    AllPages: []
};

let data = GetallKeywords();
data = GetallFbPages();
const uniqueId = getGuid();

setInterval(async() => {
    //Todo Find all Pages
    const AllPages = await FbPages.find()
        .exec();
    //Todo Check any Pages
    if(AllPages !== null && AllPages.length !== GetAllPages.AllPages.length) {
        AllPages.map(async(singlePages) => {
            const findOldPages = GetAllPages.AllPages.length > 0 ? GetAllPages.AllPages.find((data) => data.FbPageId === singlePages.FbPageId) : false;
            if(!findOldPages) {
                Log.writeLog(Log.eLogLevel.info, `[New Page] : ${JSON.stringify(singlePages)}`, uniqueId);
                let NewPage = {
                    FbPageId: singlePages.FbPageId,
                    FbPageName: singlePages.FbPageName,
                    FbUserId: singlePages.FbUserId,
                    FbAccessToken: singlePages.FbAccessToken,
                    Is_deleted: false,
                    AllPosts: []
                };
                GetAllPages.AllPages.push(NewPage);
                setInterval(async() => {
                    const AllPosts = await getAllPosts(singlePages.FbPageId, singlePages.FbAccessToken, singlePages.Is_deleted);
                    if(AllPosts !== null) {
                        AllPosts.map((singlePost) => {
                            const postId = singlePost.id;
                            let findOldPost = NewPage.AllPosts.length > 0 ? NewPage.AllPosts.find((postData) => postData.FbPostId === postId) : false;
                            if(!findOldPost) {
                                Log.writeLog(Log.eLogLevel.info, `[New Post] : ${JSON.stringify(singlePost)}`, uniqueId);
                                let NewPost = {
                                    FbPageId: singlePages.FbPageId,
                                    FbAccessToken: singlePages.FbAccessToken,
                                    FbPostId: postId,
                                    FbPostName: singlePost.message,
                                    AllComments: null,
                                    nextToken: null,
                                    Is_Online: true,
                                };
                                NewPage.AllPosts.push(NewPost);
                                //Todo work here get all new comments
                                setInterval(async() => {
                                    const AllComments = await getAllComments(NewPost.FbPageId, NewPost.FbPostId, NewPost.FbAccessToken, NewPost.AllComments, NewPost.nextToken);
                                    if(AllComments !== null && AllComments.data.length > 0) {

                                        //Fetch Last new Comments from the post.
                                        const AllCommentsFilter = AllComments.data.filter((data) => moment.tz(data.created_time, 'Asia/Singapore')
                                            .format() >= moment()
                                            .subtract((5 * 60), 'seconds')
                                            .tz('Asia/Singapore')
                                            .format());

                                        if(NewPost.AllComments !== null) {
                                            //Todo second Time
                                            AllCommentsFilter.map(async(singleComment) => {
                                                const CheckNewComment = NewPost.AllComments.find((data) => data.id === singleComment.id);
                                                if(!CheckNewComment) {
                                                    Log.writeLog(Log.eLogLevel.info, `[New Comment] : ${JSON.stringify(singleComment)}`, uniqueId);
                                                    await order(singleComment, NewPost.FbPageId, NewPost.FbAccessToken);
                                                }
                                            });

                                            //Todo save all the comments and Next Link If we have.
                                            NewPost.AllComments = AllComments.data;
                                            if(AllComments.paging && AllComments.paging.next) {
                                                NewPost.nextToken = AllComments.paging.next;
                                            }

                                        } else {
                                            //Todo first Time calling
                                            AllCommentsFilter.map(async(singleComment) => {
                                                Log.writeLog(Log.eLogLevel.info, `[New Comment] : ${JSON.stringify(singleComment)}`, uniqueId);
                                                await order(singleComment, NewPost.FbPageId, NewPost.FbAccessToken);
                                            });

                                            //Todo save All the Comments and Next Link If we have.
                                            NewPost.AllComments = AllComments.data;
                                            if(AllComments.paging && AllComments.paging.next) {
                                                NewPost.nextToken = AllComments.paging.next;
                                            }
                                        }
                                    }
                                }, 10 * 1000);
                            } else {
                                findOldPost.Is_Online = true;
                            }
                        });
                    }
                }, 10 * 1000);
            }
        });
    }
}, 10 * 1000);

async function getAllPosts(FbPageId, FbPageAccessToken, Is_deleted) {
    try {
        const AllPagesCache = getCache(FB_PAGES);
        const SinglePage = AllPagesCache.find((singlePageCache) => singlePageCache.FbPageId === FbPageId && singlePageCache.Is_Live === true);
        if(SinglePage) {
            if(!Is_deleted) {
                const api = {
                    method: 'GET',
                    url: `${config.FbAPP.Base_API_URL}/${FbPageId}/posts?access_token=${FbPageAccessToken}&limit=100`
                };
                const posts = await axios(api);
                const findNewPosts = posts.data.data.filter((data) => moment.tz(data.created_time, 'Asia/Singapore')
                    .format() >= moment()
                    .subtract(7, 'days')
                    .tz('Asia/Singapore')
                    .format());
                return findNewPosts;
            } else {
                return null;
            }
        } else {
            console.log(`Page is offline ${FbPageId}`);
            let FindPage = GetAllPages.AllPages.find((singlePage) => singlePage.FbPageId === FbPageId);
            FindPage.AllPosts.map((singlePost) => {
                singlePost.Is_Online = false;
            });
            return null;
        }
    } catch(error) {
        console.log(`getAllPosts - ${FbPageId}`, JSON.stringify(error));
        let FindPage = GetAllPages.AllPages.find((singlePage) => singlePage.FbPageId === FbPageId);
        FindPage.Is_deleted = true;
        Log.writeLog(Log.eLogLevel.error, `[getAllPosts][${FbPageId}] : ${errorJsonResponse(error.message.toString(), error.message.toString())}`, uniqueId);
        return null;
    }
}

async function getAllComments(FbPageId, FbPostId, FbPageAccessToken, AllComments, nextURL) {
    try {
        const AllPagesCache = getCache(FB_PAGES);
        const SinglePage = AllPagesCache.find((singlePageCache) => singlePageCache.FbPageId === FbPageId && singlePageCache.Is_Live === true);
        let FindPage = GetAllPages.AllPages.find((singlePage) => singlePage.FbPageId === FbPageId);
        const SinglePageCheck = SinglePage && FindPage.AllPosts.find((data) => data.FbPostId === FbPostId && data.Is_Online === true);
        if(SinglePage && SinglePageCheck) {
            let api = {
                method: 'GET',
                url: `${config.FbAPP.Base_API_URL}/${FbPostId}/comments?access_token=${FbPageAccessToken}&limit=10000`
            };
            if(nextURL) {
                api = {
                    method: 'GET',
                    url: nextURL
                };
            }
            const posts = await axios(api);
            Log.writeLog(Log.eLogLevel.info, `[getAllComments][${FbPostId}] : ${posts.data.data.length}`, uniqueId);
            return posts.data;
        } else {
            console.log(`getAllComments - FbPostId is offline ${FbPostId}`);
            return null;
        }
    } catch(error) {
        console.log(error);
        Log.writeLog(Log.eLogLevel.error, `[getAllComments][${FbPageId}] : ${JSON.stringify(error)}`, uniqueId);
        return null;
    }
}

async function sendMessageToUser(FbPageId, CommentId, FbPageAccessToken, from, Description, Qty, Price, reply_message, outofstock = false) {
    try {
        if(from !== null && from !== undefined) {
            let messageDetail = reply_message;
            let orderDetail = `- ${Description} : x ${Qty} : ${Price * Qty} \n    `;
            messageDetail = messageDetail.replace('{order detail}', orderDetail);
            messageDetail = messageDetail.replace('{shoppingcartlink}', config.FbAPP.ShoppingLink);
            const api = {
                method: 'POST',
                url: `${config.FbAPP.Base_API_URL}/${FbPageId}/messages?&access_token=${FbPageAccessToken}`,
                data: {
                    'messaging_type': 'RESPONSE',
                    'recipient': {
                        'comment_id': CommentId
                    },
                    'message': {
                        'text': messageDetail
                    }
                }
            };
            Log.writeLog(Log.eLogLevel.debug, `[sendMessageToUser] Request URL - ${config.FbAPP.Base_API_URL}/${FbPageId}/messages?&access_token=${FbPageAccessToken}`, uniqueId);
            axios(api)
                .then((response) => {
                    if(response.status === 200) {
                        Log.writeLog(Log.eLogLevel.info, `[sendMessageToUser] PageId - [${FbPageId}] CommentId - [${CommentId}] message - [${messageDetail}] : ${'success'}`, uniqueId);
                    }
                })
                .catch((error) => {
                    Log.writeLog(Log.eLogLevel.error, `[sendMessageToUser] PageId - [${FbPageId}] CommentId - [${CommentId}] message - [${messageDetail}] : ${errorJsonResponse(error.message.toString(), error.message.toString())}`, uniqueId);
                    return false;
                });
            return true;
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        Log.writeLog(Log.eLogLevel.error, `[sendMessageToUser] PageId - [${FbPageId}] CommentId - [${CommentId}] postId - [${postId}] : ${errorJsonResponse(error.message.toString(), error.message.toString())}`, uniqueId);
        return false;
    }
}

async function order(singleComment, FbPageId, FbAccessToken) {
    try {
        const AllPagesCache = getCache(FB_PAGES);
        const SinglePage = AllPagesCache.find((singlePageCache) => singlePageCache.FbPageId === FbPageId && singlePageCache.Is_Live === true);
        if(SinglePage) {
            const AllKeyWord = getCache(KEY_WORDS);
            const splitKeyword = singleComment.message.toString()
                .split('+');
            if(splitKeyword.length === 2) {
                try {
                    const matchKeyWord = AllKeyWord.find((data) => data.FbPageId === FbPageId && data.keyword.trim()
                        .toLowerCase() === splitKeyword[0].trim()
                        .toLowerCase() && (data.maxQty === 0 || data.maxQty >= Number(splitKeyword[1].trim())));

                    const qty = Number(splitKeyword[1].trim());
                    //Todo check order.
                    const checkOrder = await Order.findOne({FbSPID: singleComment.from.id});
                    let placeOrder = true;
                    if(checkOrder) {
                        const findItems = checkOrder.Items.filter((data) => data.id === matchKeyWord._id.toString());
                        let totalCount = 0;
                        findItems.map((data) => {
                            totalCount += data.qty;
                        });
                        if(matchKeyWord.maxQty !== 0 && (totalCount + qty) > matchKeyWord.maxQty) {
                            placeOrder = false;
                        }
                    }
                    if(placeOrder) {
                        let updateQty = await Keyword.findOneAndUpdate(
                            {
                                _id: matchKeyWord._id,
                                stock: {$gte: qty}
                            }, {
                                $inc: {stock: -qty}
                            }, {new: true});
                        if(matchKeyWord && updateQty) {
                            //Todo save order.
                            if(singleComment.from !== null && singleComment.from !== undefined) {
                                //Todo find User and create one
                                await UserDetail.findOrCreate({FbSPID: singleComment.from.id}, {
                                    FbPageId: FbPageId,
                                    Name: singleComment.from.name,
                                });
                                //Todo find order and create
                                let momentDateTime = moment()
                                    .tz('Asia/Singapore')
                                    .format();
                                let currentDate = new Date(momentDateTime);
                                let InsertBookingItems = await Order.findOneAndUpdate({FbSPID: singleComment.from.id}, {
                                    FbPageId: FbPageId,
                                    $push: {
                                        Items: {
                                            id: matchKeyWord._id.toString(),
                                            itemName: matchKeyWord.description,
                                            qty: qty,
                                            price: matchKeyWord.price,
                                            total: (matchKeyWord.price * qty)
                                        }
                                    },
                                    Name: singleComment.from.name,
                                    $inc: {Total: (matchKeyWord.price * qty)},
                                    Date: currentDate.toUTCString()
                                }, {upsert: true, new: true});
                                if(InsertBookingItems) {
                                    let result = socketPublishMessage(FbPageId, InsertBookingItems);
                                    result = socketPublishMessage(FbPageId, {
                                        type: 'keywordUpdate',
                                        keyword: updateQty
                                    });
                                    result = socketPublishMessage('AdminUser', InsertBookingItems);
                                    result = socketPublishMessage('AdminUser', {
                                        type: 'keywordUpdate',
                                        keyword: updateQty
                                    });
                                    matchKeyWord.stock -= qty;
                                    setCache(KEY_WORDS, AllKeyWord);
                                    result = sendMessageToUser(FbPageId, singleComment.id, FbAccessToken, singleComment.from, matchKeyWord.description, qty, matchKeyWord.price, SinglePage.ReplyMessage + '\n' + matchKeyWord.reply_message);
                                    Log.writeLog(Log.eLogLevel.info, `[saveOrder] order - [${JSON.stringify(InsertBookingItems)}]`, uniqueId);
                                } else {
                                    Log.writeLog(Log.eLogLevel.error, `[saveOrder] order - [${JSON.stringify(InsertBookingItems)}]`, uniqueId);
                                }
                            }
                        }
                        else if(matchKeyWord) {
                            const result = sendMessageToUser(FbPageId, singleComment.id, FbAccessToken, singleComment.from, matchKeyWord.description, 0, 0, SinglePage.OutOfStockMessage, true);
                        }
                    }
                } catch(error) {
                    console.log(error);
                }
            }
        } else {
            console.log(`Page is offline ${FbPageId}`);
        }
        return true;
    } catch(error) {
        return false;
    }
}
