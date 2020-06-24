import mongoose from 'mongoose';

let findOrCreate = require('mongoose-findorcreate');

let FbPagesSchema = new mongoose.Schema({
    FbPageId: String,
    FbPageName: String,
    FbUserId: String,
    FbAccessToken: String,
    Is_Live: {type: Boolean, default: false},
    ReplyMessage: {type: String, default: 'Thank you'},
    OutOfStockMessage: {type: String, default: 'Out of Stock'},
    PersonalMessage: {type: String, default: 'Thank you'},
    MassMessage: {type: String, default: 'Thank you'},
    StatusActiveTime: Date,
    DeliveryDate: mongoose.Schema.Types.Mixed,
    Minimum: Number,
    ShippingMinimum: Number
});

FbPagesSchema.plugin(findOrCreate);
export default mongoose.model('fbpages', FbPagesSchema);
