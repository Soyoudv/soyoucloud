const { app, BrowserWindow } = require('electron');
const path = require('path');

const userDataPath = path.join(__dirname, 'data', 'profile');
app.setPath('userData', userDataPath);

const fs = require('fs');
const cssPath = path.join(__dirname, 'styles', 'no-scrollbar.css');
const customStyles = fs.readFileSync(cssPath, 'utf8');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),

            webSecurity: true
        }
    });

    mainWindow.webContents.insertCSS(customStyles);

    // chargement de soundcloud
    mainWindow.loadURL('https://soundcloud.com/discover');
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);
