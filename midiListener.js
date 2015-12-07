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

var GetSleepAppleScript = function () {
  return `tell app "System Events" to sleep`;
}

var input = new midi.input();
input.on('message', function(deltaTime, message){
  DataCallback({ controlId: message[0], value: message[2], other: message[1] });
  switch (message[1]) {
    case exports.volumeFilter:
      adjustVolume(deltaTime, message);
      break;
    case exports.sleepFilter:
      goToSleep(deltaTime, message);
      break;
  }
});

var adjustVolume = function(deltaTime, message) {
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
}

var goToSleep = function(deltaTime, message) {
  if (message[0] != 128)
    return;
  applescript.execString(GetSleepAppleScript());
}

exports.volumeFilter = 0;
exports.sleepFilter = 1;
exports.sleepControlId = 128

exports.addDebugCallback = function(callback) {
  DataCallback = callback;
}

exports.startListening = function() {
  input.openPort(0);
}
