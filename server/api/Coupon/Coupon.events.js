/**
 * Coupon model events
 */

import {EventEmitter} from 'events';
var CouponEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CouponEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Coupon) {
  for(var e in events) {
    let event = events[e];
    Coupon.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    CouponEvents.emit(event + ':' + doc._id, doc);
    CouponEvents.emit(event, doc);
  };
}

export {registerEvents};
export default CouponEvents;
