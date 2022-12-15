
const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')
const path = require('path');
const axios = require( 'axios');
const fs = require("fs")

axios.defaults.timeout = 3000;

async function axios_get(url){
  console.log(url)
  try {
    resp = await axios.get(url)
    return resp   
  } catch (err){
    console.log("get error")
    //console.log (err.response.status)
    return -1
  }
}

function save_plugin_file(filename,content){
  user_home = app.getPath('home')
  console.log(filename)

 

  //1. read same name file
     
  //2.
  fs.writeFileSync(file_path + "/" + filename,content)

}

ipcMain.handle("savepluginfile",async(event,message) =>{

  filecontent = JSON.parse(message)
  filename = filecontent['filename']
  delete filecontent['filename']

  save_plugin_file(filename,JSON.stringify(filecontent))
})

ipcMain.handle("removeplugin",async(e,message)=>{
  filecontent = JSON.parse(message)
  filename = filecontent['filename']
  user_home = app.getPath('home')
  console.log(filename)

  file_path = user_home + "/.klang/plugins" 
  fs.unlinkSync(file_path + "/" + filename)
})
async function list_request(url){

  var ext_path = "raw/main/"
  var files_list = "files.json"


  if (url.substr(-1) !== "/") ext_path = "/" + ext_path

 
  ret = await axios_get(url + ext_path + files_list)
  if (ret == -1) {
    return ret 
  }

  files = ret.data
  await app.mainWin.webContents.send('installinfo','解析到'+files.length+'个文件')
  for (let i = 0;i<files.length;i++){
    item = files [i]
    app.mainWin.webContents.send('installinfo', i+1 + "、 " + item.path)
    ret = await axios_get(url + ext_path + item.path) 


    if (ret != - 1){
      await app.mainWin.webContents.send('installinfo','下载成功')
      if (typeof ret.data == "string"){
        data = ret.data 
      } else {
        data  = JSON.stringify(ret.data)
      }

      save_plugin_file(item.path,data)
    } else {

      await app.mainWin.webContents.send('installinfo','下载失败')
      return -1;
    }
  }

  return 0



}
async function requests(url){
 
  await app.mainWin.webContents.send('installinfo','正在下载插件信息')
  ret = await list_request(url)
  if ( ret != -1){
    await app.mainWin.webContents.send('installinfo','插件安装完成,此页面可以关闭')
    return ret 
  }
  await app.mainWin.webContents.send('installinfo','下载失败，再次尝试下载')
  ret = await  list_request( "https://gh-proxy.com/"+url)
  if ( ret != -1){
    await app.mainWin.webContents.send('installinfo','插件安装完成,此页面可以关闭')
    return ret 
  }

  await app.mainWin.webContents.send('installinfo','下载失败，再次尝试下载')
  ret = await list_request( "https://ghproxy.com/"+url)
  if ( ret != -1){
    await app.mainWin.webContents.send('installinfo','插件安装完成,此页面可以关闭')
    return ret 
  }

  
  await app.mainWin.webContents.send('installinfo','插件安装失败，可能是网络原因，请稍后再此尝试')

}


ipcMain.handle("plugin_download",async(event,pluginurl) =>{
    
   
   
    console.log(pluginurl)
    await requests(pluginurl)
    
})

function plugin_init(){
  user_home = app.getPath('home')
  file_path = user_home + "/.klang/plugins" 
  try {
    fs.mkdirSync (file_path); //没有就创建
  }catch{}
  

}

module.exports = {
    plugin_init,
};
