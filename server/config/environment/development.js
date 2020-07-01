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
        access_key: '049E05D3BE8E873D9C61',
        secret_key: 'fb6c662dedd34c10f229069617844bca418d6282804d7e6e1ef659538940671c7c5d60718c43262f',
        complete_payment_url: 'https://liveorder.thevelocitee.com/success',
        error_payment_url: 'https://liveorder.thevelocitee.com/error',
        complete_checkout_url: 'https://liveorder.thevelocitee.com/checkout',
        payment_url: 'https://api.rapyd.net/v1/checkout'
    },

    logFile: {
        filePath: '/home/strapi/FbLiveOrder'
    },

// Seed database on startup
    seedDB: true,
};
