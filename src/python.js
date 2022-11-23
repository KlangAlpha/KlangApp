const child_process = require('child_process');
const { exec } = require('child_process');
const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')

const iconv = require('iconv-lite')

const logger = new console.Console({ stdout: process.stdout, stderr: process.stderr });
var path = require("path")
root_path = path.join(__dirname)

const isWin = process.platform === 'win32'

// This function will output the lines from the script 
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, errcallback,successcallback) {
    var child = child_process.spawn(command, args,{shell:true});
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
       console.log(error)
    });

    child.stdout.on('data', (data) => {
        //Here is the output
        if (isWin){
            data = Buffer.from(iconv.decode(data,"GB2312"))
        }
            
        console.log(data.toString())
 
        if (typeof successcallback === 'function')
            successcallback(data.toString());      
    });


    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        //mainWindow.webContents.send('mainprocess-response', data);
        //Here is the output from the command

        if (typeof errcallback === 'function')
            errcallback( );
        
    });

    child.on('close', (code) => {


    });

}


var server_status = ""
var server_status_stderr=""
function exec_status (cmd,args,isshell){
   
    const handle = child_process.spawn(cmd, args,{env: {NODE_ENV: 'production'},
                                                    shell:isshell});


   
     handle.stdout.on('data', (data) => {

        if (isWin){
            data = Buffer.from(iconv.decode(data,"GB2312"))
        }
        console.log(data.toString());
        
        date = new Date();
        try {
            app.mainWin.webContents.send("status",date.toString() +": "+ data.toString()+"\n");
        } catch(e){

        }
        
        server_status += date.toString() +": "+ data.toString()+"\n";
    });

    // python 进度条库使用stderr作为输入出。
    handle.stderr.on('data', (data) => {

        
        if (isWin){
            data = Buffer.from(iconv.decode(data,"GB2312"))
        }
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
    
    close_server()

    setTimeout(start_server,1000);

    setTimeout(start_server,3000);
    
    return 'ok'
})


ipcMain.handle('stop_server',async (event, message) => {
 
    close_server()
    return 'ok'
})




ipcMain.handle('download_data_zip',async (event, message) => {
    download_data_zip();
    return 'ok'
})

function download_data_zip(){
    if(isWin){
        exec_status(root_path +"\\Klang\\dist\\dowload.exe",[],false)
    } else {
        exec_status(root_path +"/Klang/dist/dowload",[],false)
    }
   
}




var manager_handler;
var server_handler;
var server_handler1;
var server_handler2;
var server_handler3;
var server_handler4;
var server_handler5;
var server_handler6;

function start_server(){


    if(isWin){
        manager_path = "\\Klang\\dist\\kws_manager\\kws_manager.exe"
        server_path =  "\\Klang\\dist\\kws_server\\kws_server.exe"
    }else {
        manager_path = "/Klang/dist/kws_manager/kws_manager"
        server_path =  "/Klang/dist/kws_server/kws_server"
    }
        //启动 Klang服务器
        // python -u  无缓冲输出
        // python.exe .\src\Klang\server\kws_manager.py
        if (typeof manager_handler != "object"){
           manager_handler = exec_status(root_path + manager_path,  [],false)
        }
        
       
        if (typeof server_handler != "object"){
             // python.exe .\src\Klang\server\kws_server.py
            server_handler = exec_status(root_path + server_path,  ["canUpdate"],false)
        }
      
        if (typeof server_handler1 != "object"){
            // python.exe .\src\Klang\server\kws_server.py
           server_handler1 = exec_status(root_path + server_path,  [],false)
       }

       if (typeof server_handler2 != "object"){
            // python.exe .\src\Klang\server\kws_server.py
            server_handler2 = exec_status(root_path + server_path,  [],false)
       }

       if (typeof server_handler3 != "object"){
        // python.exe .\src\Klang\server\kws_server.py
        server_handler3 = exec_status(root_path + server_path,  [],false)
         }

        if (typeof server_handler4 != "object"){
         // python.exe .\src\Klang\server\kws_server.py
            server_handler4 = exec_status(root_path + server_path,  [],false)
        }
        if (typeof server_handler5 != "object"){
            // python.exe .\src\Klang\server\kws_server.py
               server_handler4 = exec_status(root_path + server_path,  [],false)
           }
        if (typeof server_handler6 != "object"){
            // python.exe .\src\Klang\server\kws_server.py
               server_handler4 = exec_status(root_path + server_path,  [],false)
           }

}

function close_server(){
    console.log("close_server")
    if (isWin){
        run_script('taskkill  -F /IM "kws_manager.exe"',[],true,function(){},function(){})
        run_script('taskkill  -F /IM "kws_server.exe"',[],true,function(){},function(){})
    } else {
        run_script('killall  -9 "kws_manager"',[],true,function(){},function(){})
        run_script('killall  -9 "kws_server"',[],true,function(){},function(){})
    }
    

    if (typeof manager_handler == "object"){
       
        try {
            manager_handler.kill()
            server_handler.kill()
            server_handler1.kill()
            server_handler2.kill()
            server_handler3.kill()
            server_handler4.kill()
            server_handler5.kill()
            server_handler6.kill()

        } catch{}

        console.log("server kill")
    };
    manager_handler = ""
    server_handler  = ""
    server_handler1 = ""
    server_handler2 = ""
    server_handler3 = ""
    server_handler4 = ""
    server_handler5 = ""
    server_handler6 = ""


}




module.exports = {
    close_server,
    start_server,
};
