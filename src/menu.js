const { app, BrowserWindow ,dialog,shell,ipcMain,Menu} = require('electron')
const fs = require('fs');

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: '主页',
        click: async () => {
          app.mainWin.loadFile("./dist/main/index.html");
        }
      },
      {
        label:"打开配置文件",
        click:async()=>{
          filename = await dialog.showOpenDialog({ properties: ['openFile'],
          filters: [{ name: 'Json', extensions: ['json'] }]
          })
          console.log(filename.filePaths)
          if (filename.filePaths.length > 0 ){
                 
                data = fs.readFileSync(filename.filePaths[0])
                app.confs = data.toString()
                app.mainWin.webContents.send('confs',app.confs)
            }
        }
      },
      /*{
        label:"保存配置文件",
        click:async()=>{
          user_home = app.getPath('home')

          defpath = user_home + "/.klang/strategy/config.json"

          if  (process.platform == 'win32'){
              defpath = user_home + '\\.klang\\strategy\\config.json'
          }
          
          filename = await dialog.showSaveDialog({ properties: ['openFile'],
          filters: [{ name: 'Json', extensions: ['json'] }],
          defaultPath: defpath,
          })

          console.log(filename.filePath)
          if (filename.filePath.length > 0 ){
            app.mainWin.webContents.send('savefile',filename.filePath)
          }
        }
      },*/
      {
        label:"插件设置",
        click:async()=>{
          app.mainWin.loadFile("./dist/main/plugin_set.html");
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: '关于Klang',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://klang.org.cn/')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

module.exports = Menu
