const uuidv1 = require('uuid/v1');
const NodeCache = require('node-cache');

const myCache = new NodeCache();
export const jwtdata = {jwtSecretKey: '12334'};

//Todo Cache Keywords to access it.
export const KEY_WORDS = 'KEY_WORDS';


//error message response
export function errorJsonResponse(dev_msg, user_msg) {
    return {
        dev_msg: dev_msg,
        user_msg: user_msg
    };
}

export function getGuid() {
    return uuidv1();
}

export function setCache(key, value) {
    myCache.set(key, value, 0);
}

export function getCache(key) {
    let value = myCache.get(key);
    if(value === undefined) {
        return null;
    }
    return value;
}
