import mongoose from 'mongoose';
import {registerEvents} from './Order.events';

let findOrCreate = require('mongoose-findorcreate');

let OrderSchema = new mongoose.Schema({
    FbSPID: String,
    FbPageId: String,
    BoxifyOrderNumber: String,
    Items: [{
        id: String,
        itemName: String,
        qty: Number,
        price: Number,
        keyword: String,
        SKU: String,
        total: Number
    }],
    Name: String,
    Total: Number,
    Status: {type: String, default: 'active'},
    FirstOrderDate: Date,
    MostRecentOrderDate: Date,
    ShippingOption: String,
    ShippingCharge: {type: Number, default: 0},
    PaymentStatus: {type: String, default: 'unpaid'},
    Confirmed: Boolean,
    Date: Date,
    ShippingName: String,
    ShippingMobile: String,
    ShippingAddress1: String,
    ShippingAddress2: String,
    ShippingPostalCode: String,
    DeliveryTimeSlot: mongoose.Schema.Types.Mixed,
    CheckoutResponse: mongoose.Schema.Types.Mixed,
    PaymentResponse: mongoose.Schema.Types.Mixed,
    Coupon: String,
    DiscountAmount: {type: Number, default: 0}
}, {collection: 'fbliveorder'});

OrderSchema.plugin(findOrCreate);
registerEvents(OrderSchema);
export default mongoose.model('fbliveorder', OrderSchema);
