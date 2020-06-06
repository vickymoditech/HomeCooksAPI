import mongoose from 'mongoose';
import {registerEvents} from './keyword.events';
let findOrCreate = require('mongoose-findorcreate');

let KeywordSchema = new mongoose.Schema({
    description: String,
    keyword: String,
    price: Number,
    stock: Number,
    reply_message: String,
    FbPageId: String,
    maxQty: {type: Number, default: 0}
});

KeywordSchema.plugin(findOrCreate);
registerEvents(KeywordSchema);
export default mongoose.model('keywords', KeywordSchema);
