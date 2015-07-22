var applescript = require('applescript');
var readline = require('readline');
var midi = require('midi');
// var robot = require("kbm-robot");

var script = 'tell application "iTunes" to set the sound volume to ';
var raiseVolumeScript = 'tell application "System Events" to tell process "Console" to key code 111 using {command down}';
var lowerVolumeScript = 'tell application "System Events" to tell process "Console" to key code 103 using {command down}';
var input = new midi.input();
var COUNTDOWN_MAX = .02;
var deltaCountdown = COUNTDOWN_MAX;
var INTERVAL = 128/32;
var currentValue = 0;
var needsFirst = true;
var queue = [];
var isProcessing = false;
// robot.startJar();

var processScriptQueue = function() {
  if (queue.length == 1) {
    isProcessing = true;
    applescript.execString(queue.shift(), processScriptQueue);
  }
  else if (queue.length > 1) {

  }
  else
  {
    isProcessing = false;
  }
}

input.on('message', function(deltaTime, message){
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
    // queue.push(scriptString);
    // if (!isProcessing) {
    //   processScriptQueue();
    // }
  }

  // deltaCountdown -= deltaTime;
  // if (deltaCountdown < 0)
  // {
  //   deltaCountdown = COUNTDOWN_MAX;
  //   var value = 100 * message[2]/127;
    // console.log(message);
    // applescript.execString(script + value, function(){});
  // }
});


// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
//
//
input.openPort(0);

// rl.question("stop", function(answer) {
//   input.closePort();
//   rl.close();
// });

// process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
  input.closePort();
  // robot.stopJar();
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
