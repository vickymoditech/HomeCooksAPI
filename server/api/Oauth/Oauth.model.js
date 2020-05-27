import mongoose from 'mongoose';

let findOrCreate = require('mongoose-findorcreate');
import {registerEvents} from './Oauth.events';

let OauthSchema = new mongoose.Schema({
    FBId: String,
    email: String,
    FirstName: String,
    LastName: String,
    Block: {type: Boolean, default: true},
    Password: String,
    Provider: String
});

OauthSchema.plugin(findOrCreate);
registerEvents(OauthSchema);
export default mongoose.model('Oauth', OauthSchema);
