/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
    // MongoDB connection options
    mongo: {
        uri: 'mongodb://strapi:Strapi#9012@178.128.20.185:27017/HomeCooks171?authSource=admin'
        // uri: 'mongodb://localhost:27017/HomeCooks'
    },

    FbAPP: {
        AppId: '859751524545101',
        AppSecret: '17256a829c096c13ccd6d0a33c7a3ec6',
        callbackURL: 'http://localhost:9000/api/Oauths/facebook/callback',
        successURL: 'http://localhost:3000/connect/facebook',
        failURL: 'http://localhost:3000/login',
        Base_API_URL: 'https://graph.facebook.com',
        scope: ['email'
            , 'pages_manage_cta'
            , 'pages_manage_instant_articles'
            , 'pages_show_list'
            , 'business_management'
            , 'pages_messaging'
            , 'pages_messaging_phone_number'
            , 'pages_messaging_subscriptions'
            , 'attribution_read'
            , 'pages_read_engagement'
            , 'pages_manage_metadata'
            , 'pages_read_user_content'
            , 'pages_manage_ads'
            , 'pages_manage_posts'
            , 'pages_manage_engagement']
    },

// Seed database on startup
    seedDB: true,
}
;
