const child_process = require('child_process');
const { exec } = require('child_process');
const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')

const iconv = require('iconv-lite')

const logger = new console.Console({ stdout: process.stdout, stderr: process.stderr });
var path = require("path")
root_path = path.join(__dirname)


// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, errcallback,successcallback) {
    var child = child_process.spawn(command, args,{shell:true});
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
        dialog.showMessageBox({
            title: 'where.exe',
            type: 'warning',
            message: 'where.exe pip3.exe 执行错误\r\n' + error
        });
    });

    child.stdout.on('data', (data) => {
        //Here is the output
        data = Buffer.from(iconv.decode(data,"GB2312"))
        console.log(data.toString())
 
        if (typeof successcallback === 'function')
            successcallback(data);      
    });


    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        //mainWindow.webContents.send('mainprocess-response', data);
        //Here is the output from the command

        utf8buf = Buffer.from(iconv.decode(data,"GB2312"))
        //logger.info("logger:",utf8buf.toString())

        if (typeof errcallback === 'function')
            errcallback( );
        
    });

    child.on('close', (code) => {


    });

}

function exec_out (cmd,args,callback){
    const handle = child_process.spawn(cmd, args,{env: {NODE_ENV: 'production'},shell:true});


     handle.stdout.on('data', (data) => {
        data = Buffer.from(iconv.decode(data,"GB2312"))
        console.log(data.toString());
        
        app.mainWin.webContents.send("log",data.toString()+"\n");
    });

    handle.stderr.on('data', (data) => {
        data = Buffer.from(iconv.decode(data,"GB2312"))
        console.log(data.toString());
        
        app.mainWin.webContents.send("log",data.toString()+"\n");
    });
    handle.on("exit",(code)=>{
        console.log(code)
        if (code == 1) return 
        if (typeof callback === 'function'){
            callback()
        }
            
    })

}

var server_status = ""
function exec_status (cmd,args){
    const handle = child_process.spawn(cmd, args,{env: {NODE_ENV: 'production'},shell:true});


   
     handle.stdout.on('data', (data) => {

        data = Buffer.from(iconv.decode(data,"GB2312"))
        console.log(data.toString());
        
        date = new Date();
        app.mainWin.webContents.send("status",date.toString() +": "+ data.toString()+"\n");
        server_status += date.toString() +": "+ data.toString()+"\n";
    });

    handle.stderr.on('data', (data) => {

        
        data = Buffer.from(iconv.decode(data,"GB2312"))
        console.log(data.toString());
        date = new Date();
        app.mainWin.webContents.send("status",date.toString() +": "+ data.toString()+"\n");
        server_status += date.toString() +": "+ data.toString()+"\n";
    });

}


ipcMain.handle('get_status', async (event, message) => {
    console.log(server_status);
    return server_status;
})
  
ipcMain.handle('reset_server',async (event, message) => {
        
    run_script("wmic", ["process where \"commandline like '%kws%' and name like '%python%' \" get processid"],function(){},function(data){
        data = data.toString()
        pids = data.split('\n')
        for (i=1;i<pids.length;i++){
            run_script("taskkill",["/F /pid " +  pids[i]],function(){},function(){})  
        }
            
      
    })
    setTimeout(start_server,1000);
    
    return 'ok'
})

ipcMain.handle('install_default_python',async (event, message) => {
    instal_default_python();
    return 'ok'
})

ipcMain.handle('install_lib',async (event, message) => {
    install_lib("data");
    return 'ok'
})

ipcMain.handle('download_data_zip',async (event, message) => {
    download_data_zip();
    return 'ok'
})

function download_data_zip(){

    exec_status("powershell.exe",["python.exe -u '" + root_path + "\\Klang\\tools\\download.py'"])
}


function instal_default_python(){
    exec_status("powershell.exe ",  ["powershell.exe '" + root_path + "\\python-3.10.7-amd64.exe'"])
}

function start_server(){
        //启动 Klang服务器
        exec_status("powershell.exe",  [" python.exe  -u '" + root_path + "\\Klang\\server\\kws_manager.py'"])
        // python.exe .\src\Klang\server\kws_manager.py
        exec_status("powershell.exe",  ["python.exe -u '" + root_path + "\\Klang\\server\\kws_server.py'"])
        // python.exe .\src\Klang\server\kws_server.py
}

function install_lib(data){

    app.mainWin.loadFile('./dist/main/install_klang.html');        
             
    exec_out("powershell.exe",  ["pip3.exe install '" + root_path + "\\TA_Lib-0.4.24-cp310-cp310-win_amd64.whl'"],function(){
        exec_out("powershell.exe",  ["pip3.exe install -r '" + root_path + "\\Klang\\requirements.txt'"],function(){
            exec_out("powershell.exe",["pip3.exe install '" + root_path + "\\Klang'"],function(){
                if (data == "data"){
                    app.mainWin.webContents.send("log","Klang 安装完成,正在下载数据"+"\n");
                    console.log("Klang 安装完成，正在下载数据");
                    exec_out("powershell.exe",["python.exe -u '" + root_path + "\\Klang\\tools\\download.py'"],function(){
                        app.mainWin.webContents.send("log","数据下载完成,重启APP后使用"+"\n");
                        console.log("数据下载完成,重启APP后使用");
                    })
                }else {
                    app.mainWin.webContents.send("log","Klang 安装完成,重启APP后使用"+"\n");
                    console.log("Klang 安装完成，重启APP后使用");
                }

            })
        })
    })
   
   
}
function python_check(){


    // 先 检查 之前是否启动了 klang server
    
    run_script("wmic", ["process where \"commandline like '%kws%' and name like '%python%' \" get processid"],function(){},function(data){
        data = data.toString()
        pids = data.split('\n')
        for (i=1;i<pids.length;i++){
            run_script("taskkill",["/F /pid " +  pids[i]],function(){},function(){})  
        }
            
      
    })
    // 检查是否安装python3
    run_script("where.exe",[" pip3.exe"],function( ){
        app.mainWin.loadFile('./dist/main/python_check.html');
    }); 

    // 检查是否安装过Klang，如果没有，就安装依赖，安装Klang
    run_script("pip3.exe",["show --file Klang"],function( ){

        install_lib("data")
           
    });


    setTimeout(start_server,1000);

}


module.exports = python_check;