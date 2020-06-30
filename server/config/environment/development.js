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
        access_key: 'FB235C1D71E06E9685A1',
        secret_key: '8071a69e374e3d6c4efffeba46d97994011e045b0db1c905fdf7526fd194e144b5c6ba5a76143884',
        complete_payment_url: 'https://liveorder.thevelocitee.com/success',
        error_payment_url: 'https://liveorder.thevelocitee.com/error'
    },

    logFile: {
        filePath: '/home/strapi/FbLiveOrder'
    },

// Seed database on startup
    seedDB: true,
};
