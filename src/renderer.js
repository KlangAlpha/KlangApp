
const { ipcRenderer } = require('electron');
const {getCurrentWebContents,session,webContents } = require("@electron/remote")
const {FindInPage} = require("electron-find/src/index.js")

const information = document.getElementById('download_info')

window.webContents = webContents

let findInPage = new FindInPage(getCurrentWebContents(),{
   preload:true,
   offsetTop:6,
   offsetRight:10
})

ipcRenderer.on('onfind',(e,args)=>{
   console.log("get ctrl+f")
   console.log(getCurrentWebContents)
   //findInPage.update()

   findInPage.openFindWindow()
   
})

function close_dialog(){  
    $(".sweet-container").hide();
} 

ipcRenderer.on('download', (event, message) => {
    information.innerHTML = "下载：" + message.bytes.toFixed(2) +"/" + message.TotalBytes.toFixed(2) + "MB , 速度:" + message.speed.toFixed(2) + "KB,百分比:" +  message.per  +"%"
    if (message.per == 100){
        setTimeout("close_dialog()",1000 );  

    }
})

ipcRenderer.on('log', (event, message) => {
   var content =  $("#editorJS").html();
   $("#editorJS").html(content + message);
})


ipcRenderer.on('status', (event, message) => {
   
    var content = $("#server_status").html();

    $("#server_status").html(content + message);

 })
 ipcRenderer.on('status_stderr', (event, message) => {
   
    var content = $("#server_status_stderr").html();

    $("#server_status_stderr").html(content + message);

 })
//调用 main.js 函数，很多实现在python.js里面
 async function reset_server(){
    await ipcRenderer.invoke('reset_server',"");
 }

 async function stop_server_func(){
    await ipcRenderer.invoke('stop_server',"");
 }


 async function download_data_zip(){
    await ipcRenderer.invoke('download_data_zip',"");
 }

ipcRenderer.on('cookies', (event, message) => {
   
   $("#cookies").html(message);

})

ipcRenderer.on('savefile', async (event, message) => {
 
   confs = {filename:message}
   confs.sourcelist = vue.sourcelist
   confs.runconfs  = vue.runconfs
   await ipcRenderer.invoke('saveconfs',JSON.stringify(confs));
})




//index.html 调用
async function getdefaultconfs (){
   console.log("getdefaultconfs")
   await ipcRenderer.invoke('getdefaultconfs',"");
   // main.js 处理后会回调 confs
}

//  main 相应 getdefaultconfs的调用，返回数据
ipcRenderer.on('confs', async (event, message) => {
   confs = JSON.parse(message)
   //不能直接赋值，防止覆盖插件部分。
   vue.strategysavetitle    = confs.title
   vue.strategysavecontent  = confs.content
   vue.strategysavefilename = confs.filename
   keys = Object.keys(confs.sourcelist)
   keys.forEach(function(k){
      vue.sourcelist[k] = confs.sourcelist[k]
   })
   
   vue.runconfs = confs.runconfs
})


//index.html 调用
async function getplugin (){
   
   await ipcRenderer.invoke('getplugin',"");
   // main.js 处理后会回调 getplugin
}

//plugin_set.html
async function getplugindir (){
   
   await ipcRenderer.invoke('getplugindir',"");
   // main.js 处理后会回调 getplugindir
}


//appinit函数调用
String.prototype.format = function() {
   var formatted = this;
   for( var arg in arguments ) {
       formatted = formatted.replaceAll("{" + arg + "}", arguments[arg]);
   }
   return formatted;
};

//main.js 相应 getplugin 的调用，返回数据
ipcRenderer.on('plugindata', async (event, message) => {
   
   appinit(message)
  
})

//plugin_set.html 发起调用
async function downplugin(url){
   await ipcRenderer.invoke('plugin_download',url);
   //plugins.js 处理
}

ipcRenderer.on('installinfo',async(e,message)=>{
   vue.$data.installinfo += "<p>" + message + "</p>"
})

//main.js 相应 getplugin 的调用，返回数据
ipcRenderer.on('plugindir', async (event, message) => {
   
   plugininit(message)
  
})


//main.js 相应 getstrategylist 的调用，返回数据
ipcRenderer.on('getstrategylist', async (event, message) => {
   
   strategyinit(message)
  
})

//get session
async function get_cookies(domain){
   const ses = session.fromPartition('persist:jqk')
   const cookies  = await ses.cookies.get({ url: 'http://q.10jqka.com.cn' })
   let i = 0;
   var val="";
   for(i=0;i<cookies.length;i++){
     let c = cookies[i]
      await session.defaultSession.cookies.set({url:domain,name:c['name'],value:c['value']})
      if (c.name == "v"){
         val  = c.value
      }
   }
   console.log(val)
   return val 
}

