const uuidv1 = require('uuid/v1');

export const jwtdata = {jwtSecretKey: '12334'};

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
