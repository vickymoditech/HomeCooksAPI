/**
 * Order model events
 */

import {EventEmitter} from 'events';
var OrderEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OrderEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Order) {
  for(var e in events) {
    let event = events[e];
    Order.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    OrderEvents.emit(event + ':' + doc._id, doc);
    OrderEvents.emit(event, doc);
  };
}

export {registerEvents};
export default OrderEvents;
