const child_process = require('child_process');
const { exec } = require('child_process');
const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')
const path = require('path');
const { net } = require('electron')



function get_request(url){
    const request = net.request(url)
    request.on('response', (response) => {
      console.log(`STATUS: ${response.statusCode}`)
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
      response.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`)
      })
      response.on('end', () => {
        console.log('No more data in response.')
      })
    })
    request.end()
}

ipcMain.handle("plugin_download",async(event,pluginurl) =>{
    
    user_home = app.getPath('home')
   
    console.log(pluginurl)
    get_request(pluginurl)
    
})

function plugin_init(){


}

module.exports = {
    plugin_init,

};
