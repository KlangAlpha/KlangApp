const { app, BrowserWindow ,dialog,shell,ipcMain,Menu,globalShortcut} = require('electron');
const path = require('path');
const child_process= require('child_process');
const menu = require('./menu');
const {close_server,start_server} = require('./python');
const download_init = require('./download');
const {plugin_init} = require('./plugins');
const {strategy_init} = require('./strategy');

const fs = require('fs');
const { session } = require('electron')
require("@electron/remote/main").initialize()

app.commandLine.hasSwitch('disable-gpu')

 //platform == win32
 
root_path = path.join(__dirname) 
icopath = root_path + '/icons/win/icon.ico'

function createWindow () {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    icon: icopath,
   
    webPreferences: {
 
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: false,
      webviewTag:true,
    }
  })

 
   

  // 现在不使用 download 功能，之前是为了下载python
  // download_init(win);

  plugin_init()
  strategy_init()

  
  // 先 检查 之前是否启动了 klang server
  close_server();

  // 关闭需要时间，因此1秒后启动
  
  setTimeout(start_server,1000);
   // 3秒再次检查启动
  setTimeout(start_server,3000);
 
 


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

  win.on("blur",()=>{
    
    globalShortcut.unregister("CommandOrControl+F")
  })




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
  let i = 0;

  for (i=0;i<cookies.length;i++){
    if (cookies[i].name == "v"){
      return cookies[i].value
    }
  }
  
  return ""
  
})

ipcMain.handle("saveconfs",async(event,message) =>{
  confs = JSON.parse(message)
  filename = confs.filename
  delete confs['filename']
  fs.writeFileSync(filename,JSON.stringify(confs))
})

ipcMain.handle('webviewContent',async (event,message) => {
  // send to mainwinrpc , 
   app.mainWin.webContents.send('webviewContent',message);
})



ipcMain.handle("getdefaultconfs",async(event,message) =>{
  user_home = app.getPath('home')

  console.log(user_home)
  try {
    data = fs.readFileSync(user_home + "/.klang/strategy/config.json")
    app.confs = data.toString()
    app.mainWin.webContents.send('confs',app.confs)
  } catch{}

})

//主页显示plugin数据
ipcMain.handle("getplugin",async(event,message) =>{
  root_path = path.join(__dirname)
  var plugindata = []
  //1. 读取默认的plugin
  try{
   
    data = fs.readFileSync(root_path + "/plugin_macd.json").toString()
    data = data.replaceAll(/[\n\r]/g,"")
    plugindata.push(JSON.parse(data))
 
    data = fs.readFileSync(root_path + "/plugin_macdrelay.json").toString()
    data = data.replaceAll(/[\n\r]/g,"")
    plugindata.push(JSON.parse(data))

    data = fs.readFileSync(root_path + "/plugin_turn.json").toString()
    data = data.replaceAll(/[\n\r]/g,"")
    plugindata.push(JSON.parse(data))

    
    data = fs.readFileSync(root_path + "/plugin_volatility.json").toString()
    data = data.replaceAll(/[\n\r]/g,"")
    plugindata.push(JSON.parse(data))

    data = fs.readFileSync(root_path + "/plugin_vol.json").toString()
    data = data.replaceAll(/[\n\r]/g,"")
    plugindata.push(JSON.parse(data))

    data = fs.readFileSync(root_path + "/plugin_ma.json").toString()
    data = data.replaceAll(/[\n\r]/g,"")
    plugindata.push(JSON.parse(data))

    data = fs.readFileSync(root_path + "/plugin_default.json").toString()
    data = data.replaceAll(/[\n\r]/g,"")
    plugindata.push(JSON.parse(data))


  } catch{}
  
  //2. 读取安装的 plugins
  user_home = app.getPath('home')
  file_path = user_home + "/.klang/plugins" 

  try{
    filelist = fs.readdirSync(file_path)

    console.log(filelist);
    var i;
    for (i=0;i<filelist.length;i++){
      data = fs.readFileSync(file_path + "/" + filelist[i]).toString()
      data = data.replaceAll(/[\n\r]/g,"")
      data = JSON.parse(data)
      if (data.enable == 1) {
        plugindata.push(data)
      } 
      
    }
  }catch{}


  app.mainWin.webContents.send('plugindata',JSON.stringify(plugindata))

})

//插件配置页面显示插件数据
ipcMain.handle("getplugindir",async(event,message) =>{
      //1. 读取安装的 plugins
      user_home = app.getPath('home')
      file_path = user_home + "/.klang/plugins" 
    
      try{
        filelist = fs.readdirSync(file_path)
        var plugindata = []
        console.log(filelist);
        var i;
        for (i=0;i<filelist.length;i++){
          data = fs.readFileSync(file_path + "/" + filelist[i]).toString()
          data = data.replaceAll(/[\n\r]/g,"")
          data = JSON.parse(data)
          data['filename'] = filelist[i] 
          plugindata.push(data)
        }
    
        app.mainWin.webContents.send('plugindir',JSON.stringify(plugindata))
    }catch{}
})

//策略页面显示策略列表
ipcMain.handle('getstrategylist',async(e,m) =>{
  user_home = app.getPath('home')
  file_path = user_home + "/.klang/strategy"
  
  try{
    filelist = fs.readdirSync(file_path)
    var strategydata = []
    console.log(filelist);
    var i;
    for (i=0;i<filelist.length;i++){
      data = fs.readFileSync(file_path + "/" + filelist[i]).toString()
       
      data = JSON.parse(data)
      data['filename'] = filelist[i]

      // config.json 放在第一个，默认策略

      if (filelist[i] == "config.json"){
        strategydata = [data].concat(strategydata)
      } else {
        strategydata.push(data)
      }
      
    }
    //返回给 策略页面，事件名称一样，但是这是返回数据
    app.mainWin.webContents.send('getstrategylist',JSON.stringify(strategydata))
}catch{}

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
