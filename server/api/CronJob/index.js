import FbPages from '../FbPages/fbPages.model';
import config from '../../config/environment';
import axios from 'axios/index';
import {socketPublishMessage} from '../Socket';
import {getCache, KEY_WORDS, FB_PAGES} from '../../config/commonHelper';
import {GetallKeywords} from '../keyword/keyword.controller';
import {GetallFbPages} from '../FbPages/fbPages.controller';
import Order from '../Order/Order.model';
import UserDetail from '../UserDetail/UserDetail.model';

let moment = require('moment-timezone');

let fbPageCommentEventLib = require('fb-page-comment-event');


let GetAllPages = {
    AllPages: []
};

let data = GetallKeywords();
data = GetallFbPages();

setInterval(async() => {
    //Todo Find all Pages
    const AllPages = await FbPages.find()
        .exec();
    //Todo Check any Pages
    if(AllPages !== null && AllPages.length !== GetAllPages.AllPages.length) {
        AllPages.map(async(singlePages) => {
            const findOldPages = GetAllPages.AllPages.length > 0 ? GetAllPages.AllPages.find((data) => data.FbPageId === singlePages.FbPageId) : false;
            if(!findOldPages) {
                console.log('A new Page has been Registered', singlePages.FbPageName);
                const pageCommentEventApp = fbPageCommentEventLib.pageCommentEventApp({
                    accessToken: singlePages.FbAccessToken,
                    pullInterval: 5 * 1000
                });
                let NewPage = {
                    FbPageId: singlePages.FbPageId,
                    FbPageName: singlePages.FbPageName,
                    FbUserId: singlePages.FbUserId,
                    FbAccessToken: singlePages.FbAccessToken,
                    Is_deleted: false,
                    AllPosts: [],
                    pageCommentEventApp
                };
                GetAllPages.AllPages.push(NewPage);
                setInterval(async() => {
                    const AllPosts = await getAllPosts(singlePages.FbPageId, singlePages.FbAccessToken, singlePages.Is_deleted);
                    if(AllPosts !== null && AllPosts.length !== NewPage.AllPosts.length) {
                        AllPosts.map((singlePost) => {
                            const postId = singlePost.id.toString()
                                .split('_');
                            const findOldPost = NewPage.AllPosts.length > 0 ? NewPage.AllPosts.find((postData) => postData.FbPostId === postId[1]) : false;
                            if(!findOldPost) {
                                console.log('A new Post has been Registered', singlePost.message);
                                let findPage = GetAllPages.AllPages.find((data) => data.FbPageId === postId[0]);
                                findPage.pageCommentEventApp.registerMonitorPost({pageId: postId[0], postId: postId[1]});
                                let NewPost = {
                                    FbPostId: postId[1],
                                    FbPostName: singlePost.message,
                                };
                                NewPage.AllPosts.push(NewPost);
                            }
                        });
                    }
                }, 15 * 1000);

                NewPage.pageCommentEventApp.run((events) => {
                    const AllPagesCache = getCache(FB_PAGES);
                    events.map(async(singleComment) => {
                        const SinglePage = AllPagesCache.find((singlePageCache) => singlePageCache.FbPageId === singleComment.data.pageId && singlePageCache.Is_Live === true);
                        if(SinglePage) {
                            console.log('we got a new comment', JSON.stringify(singleComment));
                            const AllKeyWord = getCache(KEY_WORDS);
                            const splitKeyword = singleComment.data.message.toString()
                                .split('+');
                            if(splitKeyword.length === 2) {
                                try {
                                    const matchKeyWord = AllKeyWord.find((data) => data.FbPageId === singleComment.data.pageId && data.keyword.trim()
                                        .toLowerCase() === splitKeyword[0].trim()
                                        .toLowerCase() && (data.maxQty === 0 || data.maxQty >= Number(splitKeyword[1].trim())));
                                    if(matchKeyWord) {
                                        //Todo save order.
                                        if(singleComment.data.from !== null && singleComment.data.from !== undefined) {
                                            const qty = Number(splitKeyword[1].trim());
                                            //Todo find User and create one
                                            await UserDetail.findOrCreate({FbSPID: singleComment.data.from.id}, {
                                                FbPageId: singleComment.data.pageId,
                                                Name: singleComment.data.from.name,
                                            });
                                            //Todo find order and create
                                            let InsertBookingItems = await Order.findOneAndUpdate({FbSPID: singleComment.data.from.id}, {
                                                FbPageId: singleComment.data.pageId,
                                                $push: {
                                                    Items: {
                                                        itemName: matchKeyWord.description,
                                                        qty: qty,
                                                        price: matchKeyWord.price,
                                                        total: (matchKeyWord.price * qty)
                                                    }
                                                },
                                                Name: singleComment.data.from.name,
                                                $inc: {Total: (matchKeyWord.price * qty)},
                                                Date: moment()
                                                    .tz('Asia/Singapore')
                                                    .format('DD-MM-YYYY HH:mm')
                                            }, {upsert: true, new: true});

                                            if(InsertBookingItems) {
                                                let result = socketPublishMessage(singleComment.data.pageId, InsertBookingItems);
                                                result = socketPublishMessage('AdminUser', InsertBookingItems);
                                                result = sendMessageToUser(singleComment.data.pageId, singleComment.data.commentId, singleComment.data.postId, NewPage.FbAccessToken, singleComment.data.from, matchKeyWord.description, qty, matchKeyWord.price, matchKeyWord.reply_message);
                                            } else {
                                                console.log(JSON.stringify(InsertBookingItems));
                                            }
                                        }
                                    }
                                } catch(error) {
                                    console.log(error);
                                }
                            }
                        } else {
                            console.log(`Page is offline ${singleComment.data.pageId}`);
                        }
                    });
                    return;
                });
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
                    url: `${config.FbAPP.Base_API_URL}/${FbPageId}?fields=posts{message,id}&access_token=${FbPageAccessToken}`
                };
                const posts = await axios(api);
                return posts.data.posts.data;
            } else {
                return null;
            }
        } else {
            console.log(`Page is offline ${FbPageId}`);
            return null;
        }
    } catch(error) {
        console.log(`getAllPosts - ${FbPageId}`, JSON.stringify(error));
        let FindPage = GetAllPages.AllPages.find((singlePage) => singlePage.FbPageId === FbPageId);
        FindPage.Is_deleted = true;
        return null;
    }
}

async function sendMessageToUser(FbPageId, CommentId, postId, FbPageAccessToken, from, Description, Qty, Price, reply_message) {
    try {
        if(from !== null && from !== undefined) {
            const AllPagesCache = getCache(FB_PAGES);
            const SinglePage = AllPagesCache.find((singlePageCache) => singlePageCache.FbPageId === FbPageId && singlePageCache.Is_Live === true);
            if(SinglePage) {
                const messageDetail = SinglePage.ReplyMessage;
                const api = {
                    method: 'POST',
                    url: `${config.FbAPP.Base_API_URL}/${FbPageId}/messages?&access_token=${FbPageAccessToken}`,
                    data: {
                        'messaging_type': 'RESPONSE',
                        'recipient': {
                            'comment_id': postId + '_' + CommentId
                        },
                        'message': {
                            'text': messageDetail
                        }
                    }
                };
                axios(api)
                    .then((response) => {
                        if(response.status === 200) {
                            console.log(response);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        return false;
                    });
                return true;
            } else {
                console.log(`Page is offline ${FbPageId}`);
                return false;
            }
        } else {
            return false;
        }
    } catch(error) {
        console.log(error);
        return false;
    }
}

