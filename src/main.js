const { app, BrowserWindow ,dialog,shell,ipcMain,Menu,globalShortcut} = require('electron');
const path = require('path');
const child_process= require('child_process');
const menu = require('./menu');
const {close_server,start_server} = require('./python');
const download_init = require('./download');

const { session } = require('electron')
require("@electron/remote/main").initialize()


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

  require("@electron/remote/main").enable(win.webContents)
  win_event(win);
  app.mainWin = win;
  win.loadFile('./dist/main/index.html')
 
  win.on("focus",()=>{
    globalShortcut.register("CommandOrControl+F",function(){
     
      try{
       
        win.webContents.send('onfind','')
      } catch {}
           
    })
  })

  win.on("blue",()=>{
    globalShortcut.unregister("CommandOrControl+F")
  })

  download_init(win);

  // 先 检查 之前是否启动了 klang server
  close_server();

  // 关闭需要时间，因此1秒后启动
  
  setTimeout(start_server,1000);
   // 3秒再次检查启动
  setTimeout(start_server,3000);
 
 

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

  globalShortcut.unregister("CommandOrControl+F")

  close_server()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


ipcMain.handle('get_cookies',async (event, message) => {
  const ses = session.fromPartition('persist:jqk')
  const cookies  = await ses.cookies.get({ url: 'http://q.10jqka.com.cn' })

  return cookies[0].value
  
})

// 控制新窗口
function win_event(win){
  win.webContents.on('new-window',function(event,url,fname,disposition,options){
    let child ;
    child = new BrowserWindow({
      height:900,
      width:1440,
      webPreferences:{nodeIntegration:true},
    });
    win_event(child);
    child.loadURL(url);
    event.preventDefault();
  })


}
