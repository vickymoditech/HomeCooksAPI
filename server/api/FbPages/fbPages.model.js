import mongoose from 'mongoose';

let findOrCreate = require('mongoose-findorcreate');

let FbPagesSchema = new mongoose.Schema({
    FbPageId: String,
    FbPageName: String,
    FbUserId: String,
    FbAccessToken: String,
    Is_Live: {type: Boolean, default: false},
    ReplyMessage: String,
    OutOfStockMessage: String,
    PersonalMessage: String
});

FbPagesSchema.plugin(findOrCreate);
export default mongoose.model('fbpages', FbPagesSchema);
