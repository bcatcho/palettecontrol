var menubar = require('menubar');
var midiListener = require('./midiListener');
var Tray = require('tray');
var nativeImage = require('native-image');
var ipc = require('ipc');
var iconLocation = process.cwd() + "/images/icons/iconTemplate.png";

// preload the window to make it load faster on first click
var mb = menubar({
  dir: __dirname,
  preloadWindow: true,
  icon: iconLocation
});

mb.on('ready', function ready () {
  console.log('app is ready');
  midiListener.addDebugCallback(midiCallback);
  midiListener.startListening();

  ipc.on('midi-filter', function(event, arg) {
    midiListener.volumeFilter = arg;
  });

});

mb.on('show', function show () {
  // the window will appear
});

var midiCallback = function(midiData) {
  // the window won't be available until it has been loaded
  if(typeof mb.window !== 'undefined' ) {
    mb.window.webContents.send('midi-message', midiData);
  }
}
