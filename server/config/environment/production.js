/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
    // Server IP
    ip: process.env.OPENSHIFT_NODEJS_IP
        || process.env.ip
        || undefined,

    // Server port
    port: process.env.OPENSHIFT_NODEJS_PORT
        || process.env.PORT
        || 8080,

    // MongoDB connection options
    mongo: {
        uri: 'mongodb://strapi:Strapi#9012@178.128.20.185:27017/HomeCooks171?authSource=admin'
    },

    FbAPP: {
        AppId: '566200570964800',
        AppSecret: '8d50d318ccbbcac250b0aba336653326',
        callbackURL: 'https://fblive.thevelocitee.com:9000/api/Oauths/facebook/callback',
        successURL: 'https://fblive.thevelocitee.com/connect/facebook',
        failURL: 'https://fblive.thevelocitee.com/login',
    },

};
