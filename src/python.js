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
            successcallback(data.toString());      
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
var server_status_stderr=""
function exec_status (cmd,args,isshell){
   
    const handle = child_process.spawn(cmd, args,{env: {NODE_ENV: 'production'},
                                                    shell:isshell});


   
     handle.stdout.on('data', (data) => {

        data = Buffer.from(iconv.decode(data,"GB2312"))
        console.log(data.toString());
        
        date = new Date();
        try {
            app.mainWin.webContents.send("status",date.toString() +": "+ data.toString()+"\n");
        } catch(e){

        }
        
        server_status += date.toString() +": "+ data.toString()+"\n";
    });

    handle.stderr.on('data', (data) => {

        
        data = Buffer.from(iconv.decode(data,"GB2312"))
        console.log(data.toString());
        date = new Date();
        try {
            app.mainWin.webContents.send("status_stderr",date.toString() +": "+ data.toString()+"\n");
        } catch(e){

        }
        
        server_status_stderr += date.toString() +": "+ data.toString()+"\n";
    });
    return handle
}


ipcMain.handle('get_status', async (event, message) => {
    console.log(server_status);
    return server_status;
})

ipcMain.handle('get_status_stderr', async (event, message) => {
    console.log(server_status_stderr);
    return server_status_stderr;
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


ipcMain.handle('stop_server',async (event, message) => {
        
    run_script("wmic", ["process where \"commandline like '%kws%' and name like '%python%' \" get processid"],function(){},function(data){
        data = data.toString()
        pids = data.split('\n')
        for (i=1;i<pids.length;i++){
            run_script("taskkill",["/F /pid " +  pids[i]],function(){},function(){})  
        }
            
    })
  
    close_server()
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

    exec_status("powershell.exe",["python.exe -u '" + root_path + "\\Klang\\tools\\download.py'"],true)
}


function instal_default_python(){
    
    exec_status("powershell.exe",  ['Start-Process',"'" + root_path + "\\python-3.10.7-amd64.exe'"],false)
}

var manager_handler;
var server_handler;
function start_server(){

        //启动 Klang服务器
        // python -u  无缓冲输出
        manager_handler = exec_status("python.exe",  ["-u", root_path + "\\Klang\\server\\kws_manager.py"],false)
        // python.exe .\src\Klang\server\kws_manager.py
       
        server_handler = exec_status("python.exe",  ["-u", root_path + "\\Klang\\server\\kws_server.py"],false)
        // python.exe .\src\Klang\server\kws_server.py
}

function close_server(){
    console.log("close_server")

    if (typeof manager_handler == "object"){
       

        manager_handler.kill()
        server_handler.kill()
        console.log("server kill")
    };

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
    close_server();

    // 检查是否安装python3
    run_script("where.exe",[" pip3.exe"],function(){
        //没有发现pip3.exe
        app.mainWin.loadFile('./dist/main/python_check.html');
    },function(data){
        //发现了pip3.exe,检查路径有没有310, 不是python3.10版本提示安装3.10版本

        //防止出现控制字符串
        if ( data.indexOf('pip3.exe') != -1  &&  data.indexOf("310") ==  -1){
           
            app.mainWin.loadFile('./dist/main/python_check.html');
        }


    }); 

    // 检查是否安装过Klang，如果没有，就安装依赖，安装Klang
    run_script("pip3.exe",["show --file Klang"],function( ){

        install_lib("data")
           
    });


    setTimeout(start_server,1000);

}


module.exports = {
    python_check,
    close_server,
};