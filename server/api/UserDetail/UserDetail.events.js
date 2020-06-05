/**
 * UserDetail model events
 */

import {EventEmitter} from 'events';
var UserDetailEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserDetailEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(UserDetail) {
  for(var e in events) {
    let event = events[e];
    UserDetail.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    UserDetailEvents.emit(event + ':' + doc._id, doc);
    UserDetailEvents.emit(event, doc);
  };
}

export {registerEvents};
export default UserDetailEvents;
