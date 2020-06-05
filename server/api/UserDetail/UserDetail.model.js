import mongoose from 'mongoose';

let findOrCreate = require('mongoose-findorcreate');
import {registerEvents} from './UserDetail.events';

let UserDetailSchema = new mongoose.Schema({
    FbSPID: String,
    Name: String,
    FbPageId: String,
});

UserDetailSchema.plugin(findOrCreate);
registerEvents(UserDetailSchema);
export default mongoose.model('UserDetail', UserDetailSchema);
