
const { ipcRenderer } = require('electron');

const information = document.getElementById('download_info')

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
//调用 main.js 函数，很多实现在python.js里面
 async function reset_server(){
    await ipcRenderer.invoke('reset_server',"");
 }

 async function install_default_python_func(){
    await ipcRenderer.invoke('install_default_python',"");
 }

 async function install_lib(){
    await ipcRenderer.invoke('install_lib',"");
 }
//const result = await ipcRenderer.invoke('get_status', "")