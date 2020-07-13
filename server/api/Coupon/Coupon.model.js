import mongoose from 'mongoose';
import {registerEvents} from './Coupon.events';

let CouponSchema = new mongoose.Schema({
    PromoCode: String,
    DiscountAmount: String,
    FbPageId: String,
});

registerEvents(CouponSchema);
export default mongoose.model('Coupon', CouponSchema);
