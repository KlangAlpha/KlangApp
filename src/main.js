const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron');
const path = require('path');
const child_process= require('child_process');
const menu = require('./menu');
const python_check = require('./python');
const download_init = require('./download');


function createWindow () {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
  
   
    webPreferences: {
 
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: false,
      webviewTag:true,
    }
  })

  app.mainWin = win;
  win.loadFile('./dist/main/index.html')
 


  download_init(win);

  python_check();
 
}

app.whenReady().then(() => {
 

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


