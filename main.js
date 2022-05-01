const { app, BrowserWindow, screen } = require('electron')
const os = require('os');

const HOSTNAME = os.hostname().split('.')[0];
// const SERVER_HOSTNAME = 'HOBNJML-N0CUG8W';
// const SERVER_HOSTNAME = 'commodore';
const SERVER_HOSTNAME = '192.168.0.100';

const MAIN_DISPLAY_ID = 69731852;

const isOrbital = HOSTNAME.indexOf('orbital') !== -1;

// Source: https://thecodersblog.com/play-video-unmuted-in-electron-app/
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let winStructs = [];

function init(){
  let displays = screen.getAllDisplays();
  for(let i = 0; i < displays.length; i++){
    let display = displays[i];
    console.log('DISPLAY', display);
    if(display.id !== MAIN_DISPLAY_ID) {
      createWindow(display);
    }
  }

  screen.on('display-added', (event, newDisplay) => {
    console.log('NEW WINDOW', newDisplay);
    createWindow(newDisplay)
  });
  screen.on('display-removed', (event, oldDisplay) => destroyWindow(oldDisplay));
}


function createWindow (display) {
  // Create the browser window.
  let options = {
    // width: 1920,
    // height: 1080,
    frame: false,
    fullscreen: isOrbital,
    x: display.bounds.x,
    y: display.bounds.y,
    autoHideMenuBar: true,
    // kiosk: true,
    webSecurity: false,
    backgroundColor: '#000'
    // backgroundColor: 'transparent'
  };

  if (!isOrbital) {
    options.width = display.bounds.width;
    options.height = display.bounds.height;
  }

  let win = new BrowserWindow(options)

  // and load the index.html of the app.
  // win.loadFile('index.html')
  let theURL = `http://${SERVER_HOSTNAME}/orbital.html?host=${HOSTNAME}&displayid=${display.id}`;
  console.log(theURL)
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('PAGE FAILED TO LOAD', errorCode, errorDescription);
    setTimeout(() => {
      win.loadURL(theURL);
    }, 1000);
  });
  win.loadURL(theURL)

  // Open the DevTools.
  // win.webContents.openDevTools()
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    winStructs = winStructs.filter(winstruct => winstruct.win !== win);
  })

  winStructs.push({
    win,
    display
  });
}

function destroyWindow(display){
  console.log('DESTROY WINDOW', display);
  for(let i=0; i < winStructs.length; i++) {
    let winStruct = winStructs[i];
    if(winStruct.display.id === display.id) {
      winStruct.win.close();
      break;
    }
  }
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    init()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
