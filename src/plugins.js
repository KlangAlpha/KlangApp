
const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')
const path = require('path');
const axios = require( 'axios');
const fs = require("fs")

async function axios_get(url){
  console.log(url)
  try {
    resp = await axios.get(url)
    return resp   
  } catch (err){
    console.log (err.response.status)
    return -1
  }
}

function save_plugin_file(filename,content){
  user_home = app.getPath('home')
  console.log(filename)

  file_path = user_home + "/.klang/plugins" 
  try {
    fs.mkdirSync (file_path); //没有就创建
  }catch{}
  

  //1. read same name file
     
  //2.
  fs.writeFileSync(file_path + "/" + filename,content)

}
async function list_request(url){

  var ext_path = "raw/main/"
  var files_list = "files.json"


  if (url.substr(-1) !== "/") ext_path = "/" + ext_path

  ret = await axios_get(url + ext_path + files_list)
  if (ret == -1) return ret 
  

  files = ret.data

  files.forEach(async function(item){
    ret = await axios_get(url + ext_path + item.path) 

    if (ret != - 1){
      save_plugin_file(item.path,JSON.stringify(ret.data))
    }
  })

}
async function requests(url){
 

  ret = await list_request(url)
  if ( ret != -1){
    return ret 
  }

  ret = await  list_request( "https://gh-proxy.com/"+url)
  if ( ret != -1){
    return ret 
  }

  ret = await list_request( "https://ghproxy.com/"+url)
  if ( ret != -1){
    return ret 
  }

  ret = await list_request( "https://ghproxy.net/"+url)
  if ( ret != -1){
    return ret 
  }


}


ipcMain.handle("plugin_download",async(event,pluginurl) =>{
    
    user_home = app.getPath('home')
   
    console.log(pluginurl)
    await requests(pluginurl)
    
})

function plugin_init(){


}

module.exports = {
    plugin_init,
};
