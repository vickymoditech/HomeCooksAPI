import mongoose from 'mongoose';
import {registerEvents} from './Order.events';

let OrderSchema = new mongoose.Schema({
    FbSPID: String,
    FbPageId: String,
    Items: mongoose.Schema.Types.Mixed,
    Name: String,
    Total: Number
}, {collection: 'fbliveorder'});

registerEvents(OrderSchema);
export default mongoose.model('fbliveorder', OrderSchema);
