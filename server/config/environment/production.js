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
        AppId: '841493816358784',
        AppSecret: '922620654211668e99e0b4d4b6e2a4f5',
        callbackURL: 'http://localhost:9000/Oauths/facebook/callback',
        failURL: 'http://localhost:3000/login'
    },

};
