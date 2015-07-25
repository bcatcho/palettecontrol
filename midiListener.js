var applescript = require('applescript');
var midi = require('midi');

var INTERVAL = 128/32;
var currentValue = 0;
var needsFirst = true;
var DataCallback = function() {};

var GetAdjustVolumeAppleScript = function(isRaising, iterations) {
  var keyCode = isRaising ? 111 : 103;
  return `tell application "System Events" to tell process "Console"
  	repeat ${iterations} times
  		key code ${keyCode} using {command down}
  	end repeat
  end tell`;
};

var input = new midi.input();
input.on('message', function(deltaTime, message){
  DataCallback({ controlId: message[0], value: message[2], other: message[1] });
  if (message[1] != exports.volumeFilter)
    return;

  var value = message[2];
  if (needsFirst) {
    currentValue = value;
    needsFirst = false;
    return;
  }

  var valueDiff = value - currentValue;
  if (Math.abs(valueDiff) >= INTERVAL) {
    currentValue = value;
    var max = (Math.abs(valueDiff) - Math.abs(valueDiff)%INTERVAL)/INTERVAL;
    var isRaisingVolume = valueDiff > 0;
    var result = GetAdjustVolumeAppleScript(isRaisingVolume, max);
    applescript.execString(result);
  }
});

exports.volumeFilter = 0;

exports.addDebugCallback = function(callback) {
  DataCallback = callback;
}

exports.startListening = function() {
  input.openPort(0);
}
