/**
 * Orders model events
 */

import {EventEmitter} from 'events';
var OrdersEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OrdersEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Orders) {
  for(var e in events) {
    let event = events[e];
    Orders.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    OrdersEvents.emit(event + ':' + doc._id, doc);
    OrdersEvents.emit(event, doc);
  };
}

export {registerEvents};
export default OrdersEvents;
