import mongoose from 'mongoose';
import {registerEvents} from './orders.events';

let OrdersSchema = new mongoose.Schema({
    FBId: String,
    description: String,
    ordernumber: String,
    shippingaddress1: String,
    shippingaddress2: String,
    shippingcity: String,
    shippingcost: {type: mongoose.Decimal128, default: 0},
    shippingcountry: String,
    shippingname: String,
    shippingoption: String,
    shippingphonenumber: String,
    shippingpostcode: String,
    shippingstate: String,
    totalexcludeshipping: {type: mongoose.Decimal128, default: 0},
    totalincludeshipping: {type: mongoose.Decimal128, default: 0},
    customerName: String,
    contactNumber: String,
    email_id: String,
    Items: mongoose.Schema.Types.Mixed,
    total: {type: mongoose.Decimal128, default: 0},
});

registerEvents(OrdersSchema);
export default mongoose.model('orders', OrdersSchema);
