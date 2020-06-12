import mongoose from 'mongoose';
import {registerEvents} from './Order.events';

let findOrCreate = require('mongoose-findorcreate');

let OrderSchema = new mongoose.Schema({
    FbSPID: String,
    FbPageId: String,
    Items: mongoose.Schema.Types.Mixed,
    Name: String,
    Total: Number,
    Status: {type: String, default: 'active'},
    FirstOrderDate: Date,
    MostRecentOrderDate: Date,
    ShippingOption: String,
    PaymentStatus: {type: String, default: 'unpaid'},
    Confirmed: Boolean,
    Date: Date,
    ShippingName: String,
    ShippingMobile: String,
    ShippingAddress1: String,
    ShippingAddress2: String,
    ShippingAddress3: String,
    ShippingPostalCode: String,
    DeliveryTimeSlot: mongoose.Schema.Types.Mixed
}, {collection: 'fbliveorder'});

OrderSchema.plugin(findOrCreate);
registerEvents(OrderSchema);
export default mongoose.model('fbliveorder', OrderSchema);
