let homeDir = require('homedir');

module.exports = {
    // MongoDB connection options
    mongo: {
        uri: 'mongodb://strapi:Strapi#9012@178.128.20.185:27017/HomeCooks171?authSource=admin'
        // uri: 'mongodb://localhost:27017/HomeCooks'
    },

    FbAPP: {
        AppId: '566200570964800',
        AppSecret: '8d50d318ccbbcac250b0aba336653326',
        callbackURL: 'https://liveorder.thevelocitee.com:9000/api/Oauths/facebook/callback',
        successURL: 'https://liveorder.thevelocitee.com/connect/facebook',
        failURL: 'https://liveorder.thevelocitee.com/login',
        Base_API_URL: 'https://graph.facebook.com',
        Base_Streaming_API_URL: 'https://streaming-graph.facebook.com',
        ShoppingLink: 'https://liveorder.thevelocitee.com/checkout/',
        scope: ['pages_show_list'
            , 'pages_manage_metadata'
            , 'pages_read_engagement'
            , 'pages_read_user_content'
            , 'pages_messaging'
        ]
    },

    Rapyd: {
        access_key: 'DFCE7012B4215129F89E',
        secret_key: 'b9d3fe9be792ae34a2d2bbb71ce813ca021d43093ca383c492f6b233888a4012301558d5bd178f27',
        complete_payment_url: 'https://liveorder.thevelocitee.com/success',
        error_payment_url: 'https://liveorder.thevelocitee.com/error',
        complete_checkout_url: 'https://liveorder.thevelocitee.com/checkout',
        payment_url: 'https://sandboxapi.rapyd.net/v1/checkout'
    },

    logFile: {
        filePath: '/home/strapi/FbLiveOrder'
    },

// Seed database on startup
    seedDB: true,
};
