const EventEmitter = require("events");
const emitter = new EventEmitter();

// On is used to add a callback function that's going to be executed when the event is triggered
// "Time" is the name of the event
emitter.on("time", (message) => {
  console.log("Time received:", message);
});

if(require.main === module) {
  setInterval(() => {
    const currentTime = new Date().toString();
    // Emit is used to trigger an event, this emitter signals that the Time event has happened and will call all Time events
    emitter.emit("time", currentTime);
  }, 5000);
}

module.exports = emitter;