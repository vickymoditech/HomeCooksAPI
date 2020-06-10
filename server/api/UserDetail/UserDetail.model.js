import mongoose from 'mongoose';

let findOrCreate = require('mongoose-findorcreate');
import {registerEvents} from './UserDetail.events';

let UserDetailSchema = new mongoose.Schema({
    FbSPID: String,
    Name: String,
    FbPageId: String,
    ShippingMobile: {type: String, default: null},
    ShippingAddress1: {type: String, default: null},
    ShippingPostalCode: {type: String, default: null},
});

UserDetailSchema.plugin(findOrCreate);
registerEvents(UserDetailSchema);
export default mongoose.model('UserDetail', UserDetailSchema);
