/**
 * Oauth model events
 */

import {EventEmitter} from 'events';
var OauthEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
OauthEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Oauth) {
  for(var e in events) {
    let event = events[e];
    Oauth.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    OauthEvents.emit(event + ':' + doc._id, doc);
    OauthEvents.emit(event, doc);
  };
}

export {registerEvents};
export default OauthEvents;
