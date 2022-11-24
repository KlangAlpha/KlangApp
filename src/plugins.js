
const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')
const path = require('path');
const request = require('electron-request') ;

async function requests(url){
  
  const defaultOptions = {
    method: 'GET',
    body: null,
    followRedirect: true,
    maxRedirectCount: 20,
    timeout: 5000,
    size: 0,
  };
  try {
    const response = await request(url, defaultOptions);
    console.log(response.config.statusCode)
    
    const text = await response.text();
    console.log(text)
    return text ;
  } catch{
    return -1;
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
