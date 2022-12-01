

const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', async () => {
    console.log(document.body.innerHTML)
    ipcRenderer.invoke("webviewContent",document.body.innerHTML)
})
  
