import mongoose from 'mongoose';

let findOrCreate = require('mongoose-findorcreate');

let FbPagesSchema = new mongoose.Schema({
    FbPageId: String,
    FbPageName: String,
    FbUserId: String,
    FbAccessToken: String,
});

FbPagesSchema.plugin(findOrCreate);
export default mongoose.model('fbpages', FbPagesSchema);
