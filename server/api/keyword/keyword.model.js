import mongoose from 'mongoose';
import {registerEvents} from './keyword.events';

let KeywordSchema = new mongoose.Schema({
    description: String,
    keyword: String,
    price: Number,
    stock: Number,
    replay_message: String,
    FbPageId: String,
    maxQty: {type: Number, default: 0}
});

registerEvents(KeywordSchema);
export default mongoose.model('keywords', KeywordSchema);
