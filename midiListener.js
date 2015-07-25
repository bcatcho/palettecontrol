var applescript = require('applescript');
var midi = require('midi');

var script = 'tell application "iTunes" to set the sound volume to ';
var raiseVolumeScript = 'tell application "System Events" to tell process "Console" to key code 111 using {command down}';
var lowerVolumeScript = 'tell application "System Events" to tell process "Console" to key code 103 using {command down}';
var input = new midi.input();
var COUNTDOWN_MAX = .02;
var deltaCountdown = COUNTDOWN_MAX;
var INTERVAL = 128/32;
var currentValue = 0;
var needsFirst = true;
var DataCallback = function() {};

input.on('message', function(deltaTime, message){
  DataCallback({ controlId: message[0], value: message[2] });
  var value = message[2];
  if (needsFirst) {
    currentValue = value;
    needsFirst = false;
    return;
  }

  var valueDiff = value - currentValue;
  if (Math.abs(valueDiff) >= INTERVAL) {
    currentValue = value;
    var scriptString = raiseVolumeScript;
    if (valueDiff < 0) {
      scriptString = lowerVolumeScript;
    }
    var result = "";
    var max = (Math.abs(valueDiff) - Math.abs(valueDiff)%INTERVAL)/INTERVAL;
    for (var i = 0; i < max; ++i ) {
      result += "\n" + scriptString;
    }
    applescript.execString(result);
  }
});

exports.addDebugCallback = function(callback) {
  DataCallback = callback;
}

exports.startListening = function() {
  input.openPort(0);
}
