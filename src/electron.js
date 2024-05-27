const { app, BrowserWindow, ipcMain } = require('electron')
const path = require("path");

const createWindow = () => {
    let win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
          }
    });

    win.on('close', ev => {
        ev.preventDefault();
        win.webContents.send('close', 'close');
      });

    ipcMain.handle('closeEmit', data => {
        app.exit(0);
    })

    ipcMain.handle('getSaveDialog', async( event, data) => {
        return require('electron').dialog.showSaveDialog(data);
    });

    win.removeMenu();
    win.loadFile('./dest/prod/index.html');
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});