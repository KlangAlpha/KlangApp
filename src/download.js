const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')
const path = require('path');

function getMilliSecond(){
   return  Math.floor(Date.now())/1000;
}
function download_init(win){


  //监控下载文件
  win.webContents.session.on('will-download', (e, item) => {
    const filePath = path.join(app.getPath('downloads'), item.getFilename());
    console.log(filePath);
    item.setSavePath(filePath);  
    //监听下载过程，计算并设置进度条进度
    start = getMilliSecond()

    item.on('updated', (evt, state) => {
      if ('progressing' === state) {
        //此处  用接收到的字节数和总字节数求一个比例  就是进度百分比
        if (item.getReceivedBytes() && item.getTotalBytes()) {
          value = parseInt(
            100 * (
              item.getReceivedBytes() / item.getTotalBytes()
            )
          )
 
          win.webContents.send('updateProgressing', value);

        // mac 程序坞、windows 任务栏显示进度
          win.setProgressBar(value);
          console.log(getMilliSecond());
          console.log(item.getReceivedBytes(),item.getTotalBytes());
          win.webContents.send("download",{"bytes":
          item.getReceivedBytes()/1024/1024,
          "TotalBytes":item.getTotalBytes()/1024/1024,
          "speed":item.getReceivedBytes()/1024/(getMilliSecond()-start),
          "per":value});
          
        }

      }
    });

    //监听下载结束事件
    item.on('done', (e, state) => {
      //如果窗口还在的话，去掉进度条
      if (!win.isDestroyed()) {
        win.setProgressBar(-1);
      }
      //下载被取消或中断了
      if (state === 'interrupted') {
        dialog.showErrorBox('下载失败', `文件 ${item.getFilename()} 因为某些原因被中断下载`);
      }
      // 下载成功后打开文件所在文件夹
      if (state === 'completed') {
        setTimeout(() => {
          shell.showItemInFolder(filePath)
        }, 1000);
      }
    });
  });

}

module.exports=download_init;