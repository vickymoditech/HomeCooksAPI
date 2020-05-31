import FbPages from '../FbPages/fbPages.model';
import config from '../../config/environment';
import axios from 'axios/index';
import {socketPublishMessage} from '../Socket';
import {getCache, KEY_WORDS} from '../../config/commonHelper';
import {GetallKeywords} from '../keyword/keyword.controller';

let fbPageCommentEventLib = require('fb-page-comment-event');


let GetAllPages = {
    AllPages: []
};

const data = GetallKeywords();

setInterval(async() => {
    //Todo Find all Pages
    const AllPages = await FbPages.find()
        .exec();
    //Todo Check any Pages
    if(AllPages.length !== GetAllPages.AllPages.length) {
        AllPages.map(async(singlePages) => {
            const findOldPages = GetAllPages.AllPages.length > 0 ? GetAllPages.AllPages.find((data) => data.FbPageId === singlePages.FbPageId) : false;
            if(!findOldPages) {
                console.log('new Page Register', singlePages.FbPageName);
                const pageCommentEventApp = fbPageCommentEventLib.pageCommentEventApp({
                    accessToken: singlePages.FbAccessToken,
                    pullInterval: 15 * 1000
                });
                let NewPage = {
                    FbPageId: singlePages.FbPageId,
                    FbPageName: singlePages.FbPageName,
                    FbUserId: singlePages.FbUserId,
                    FbAccessToken: singlePages.FbAccessToken,
                    AllPosts: [],
                    pageCommentEventApp
                };
                setInterval(async() => {
                    const AllPosts = await getAllPosts(singlePages.FbPageId, singlePages.FbAccessToken);
                    if(AllPosts.length !== NewPage.AllPosts.length) {
                        AllPosts.map((singlePost) => {
                            const postId = singlePost.id.toString()
                                .split('_');
                            const findOldPost = NewPage.AllPosts.length > 0 ? NewPage.AllPosts.find((postData) => postData.FbPostId === postId[1]) : false;
                            if(!findOldPost) {
                                console.log('new Post Register', singlePost.message);
                                pageCommentEventApp.registerMonitorPost({pageId: postId[0], postId: postId[1]});
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
                    events.map(async(singleComment) => {
                        const AllKeyWord = getCache(KEY_WORDS);
                        const splitKeyword = singleComment.data.message.toString().split('+');
                        if(splitKeyword.length === 2) {
                            try {
                                const matchKeyWord = AllKeyWord.find((data) => data.keyword === splitKeyword[0].trim() && data.maxQty >= Number(splitKeyword[1].trim()));
                                if(matchKeyWord) {
                                    let result = await socketPublishMessage(singleComment.data.pageId, singleComment);
                                    result = await socketPublishMessage("AdminUser", singleComment);
                                }
                            } catch(error) {
                                console.log(error);
                            }
                        }
                    });
                    return;
                });
                GetAllPages.AllPages.push(NewPage);
            }
        });
    }
}, 15 * 1000);


async function getAllPosts(FbPageId, FbPageAccessToken) {
    try {
        const api = {
            method: 'GET',
            url: `${config.FbAPP.Base_API_URL}/${FbPageId}?fields=posts{message,id,comments}&access_token=${FbPageAccessToken}`
        };
        const posts = await axios(api);
        return posts.data.posts.data;
    } catch(error) {
        console.log(error);
        return null;
    }
}
