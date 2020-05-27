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
        AppId: '841493816358784',
        AppSecret: '922620654211668e99e0b4d4b6e2a4f5',
        callbackURL: 'http://localhost:9000/api/Oauths/facebook/callback',
        successURL: 'http://localhost:3000/connect/facebook',
        failURL: 'http://localhost:3000/login'
    },

// Seed database on startup
    seedDB: true,
}
;
