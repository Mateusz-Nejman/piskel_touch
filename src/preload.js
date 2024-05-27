const { contextBridge, ipcRenderer, BrowserWindow } = require('electron')
const fs = require('fs');

contextBridge.exposeInMainWorld( 'electron', {
    send: ( channel, data ) => ipcRenderer.invoke( channel, data ),
    handle: ( channel, func ) => ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
    openDialog: async (channel, data) => {
        if(channel == 'saveDialog') {
            return await ipcRenderer.invoke('getSaveDialog', data);
        }
    },
    writeFile: async (data) => {
        return fs.writeFile(data.fileName, data.content, data.endFunc);
    },
    readFile: async(data) => {
        return fs.readFile(data.fileName, data.encoding, data.endFunc);
    },
} )