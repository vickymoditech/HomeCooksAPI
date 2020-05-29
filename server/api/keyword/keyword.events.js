/**
 * Keyword model events
 */

import {EventEmitter} from 'events';
var KeywordEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
KeywordEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Keyword) {
  for(var e in events) {
    let event = events[e];
    Keyword.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    KeywordEvents.emit(event + ':' + doc._id, doc);
    KeywordEvents.emit(event, doc);
  };
}

export {registerEvents};
export default KeywordEvents;
