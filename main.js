var applescript = require('applescript');
var readline = require('readline');
var midi = require('midi');

var script = 'tell application "iTunes" to set the sound volume to ';
var input = new midi.input();
var COUNTDOWN_MAX = .02;
var deltaCountdown = COUNTDOWN_MAX;
input.on('message', function(deltaTime, message){
  deltaCountdown -= deltaTime;
  if (deltaCountdown < 0)
  {
    deltaCountdown = COUNTDOWN_MAX;
    var value = 100 * message[2]/127;
    // console.log(value);
    applescript.execString(script + value, function(){});
  }
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
