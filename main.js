const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// LOAD BLOCKLIST
const { loadBlocklist } = require('./utils/blocklist/parse-blocklist');

// CONFIG PATHS
// const userDataPath = path.join(__dirname, 'data', 'profile');
// app.setPath('userData', userDataPath);
// console.log(`📂 User profile: ${app.getPath('userData')}`);

// LOAD BLOCKLIST
const BLOCKED_DOMAINS = loadBlocklist(path.join(__dirname, 'utils', 'blocklist', 'soundcloud-blocklist.txt'));
// console.log(`[${new Date().toISOString()}] Active blocking: ${BLOCKED_DOMAINS.length} domains`);

let mainWindow;
let tray = null;

// --- CREATE WINDOW ---
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),

            webSecurity: true
        },
        show: false, // dont show until ready
        autoHideMenuBar: true // hide menu bar for cleaner look
    });

    // go to tray when closing
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide(); // just hide the window, dont quit the app
            return false;
        }
        return true;
    });

    // --- INITIALISATION OF TRAY ---
    const iconPath = path.join(__dirname, 'assets', 'sc_icon.png');

    // Chargement et redimensionnement de l'icône
    const rawImg = nativeImage.createFromPath(iconPath);
    if (process.platform === 'linux') {
        trayIcon = rawImg.resize({ width: 32, height: 32 });
    } else if (process.platform === 'darwin') {
        trayIcon = rawImg.resize({ width: 22, height: 22 }).setTemplateImage(true);
    } else {
        trayIcon = rawImg.resize({ width: 16, height: 16 });
    }

    tray = new Tray(trayIcon);

    // Menu contextuel (clic droit sur l'icône)
    const contextMenu = Menu.buildFromTemplate([
        // {
        //     label: 'Play/Pause',
        //     click: () => {
        //     }
        // },
        // {
        //     label: 'Next',
        //     click: () => {
        //     }
        // },
        // {
        //     label: 'Previous',
        //     click: () => {
        //     }
        // },
        {
            label: 'Show App', click: () => {
                mainWindow.show();
                mainWindow.focus();
            }
        },
        // { type: 'separator' },
        // { label: 'Reload', click: () => { mainWindow.reload(); } },
        { type: 'separator' },
        {
            label: 'Restart App',
            click: () => {
                app.isQuitting = true;
                mainWindow.close();
                app.quit();
                app.relaunch(); // relaunch the app after quitting
            }
        },
        { type: 'separator' },
        {
            label: 'Exit',
            click: () => {
                app.isQuitting = true;
                mainWindow.close();
                app.quit();
            }
        }
    ]);

    tray.setToolTip('SoyouCloud');
    tray.setContextMenu(contextMenu);

    // left click on tray icon to toggle window
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    // --- CSS CUSTOM ---

    // hide scrollbar
    const noscrollbarPath = path.join(__dirname, 'styles', 'no-scrollbar.css');
    const customStyles = fs.readFileSync(noscrollbarPath, 'utf8');
    mainWindow.webContents.insertCSS(customStyles);

    // hide banners
    const nobannerPath = path.join(__dirname, 'styles', 'no-banner.css');
    const customStyles2 = fs.readFileSync(nobannerPath, 'utf8');
    mainWindow.webContents.insertCSS(customStyles2);

    // hide soundcloud go
    const noscgoPath = path.join(__dirname, 'styles', 'no-soundcloud-go.css');
    const customStyles3 = fs.readFileSync(noscgoPath, 'utf8');
    mainWindow.webContents.insertCSS(customStyles3);

    //hide mobile app promo
    const nomobilePath = path.join(__dirname, 'styles', 'no-mobile.css');
    const customStyles4 = fs.readFileSync(nomobilePath, 'utf8');
    mainWindow.webContents.insertCSS(customStyles4);

    // BLOCKING TRACKERS/ADS
    const filter = {
        urls: [
            '*://*/*',
            '*://*/*.js',
            '*://*/*.css',
            '*://*/*.png',
            '*://*/*.jpg'
        ]
    };
    mainWindow.webContents.session.webRequest.onBeforeRequest(filter, (details, callback) => {
        const url = details.url;

        // filter blocked domains
        const isBlocked = BLOCKED_DOMAINS.some(domain => {
            return url.includes(domain) ||
                url.endsWith(domain) ||
                url.includes('.' + domain) ||
                url.includes('/' + domain + '/');
        });

        if (isBlocked) {
            // console.log(`🚫 Blocked : ${url}`);
            callback({ cancel: true });  // cancel request
        } else {
            callback({});  // allow request
        }
    });

    // --- LOAD SOUNDCLOUD ---
    mainWindow.loadURL('https://soundcloud.com/signin');
    // mainWindow.webContents.openDevTools();

    // show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // macOS specific: re-create window when dock icon is clicked and no other windows are open
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
}

app.whenReady().then(createWindow);

// Handle app quitting to allow proper cleanup and prevent issues with tray on some platforms
app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('window-all-closed', (event) => {
    if (process.platform !== 'darwin' && !app.isQuitting) {
        event.preventDefault(); // prevent quitting on non-macOS platforms when all windows are closed
    }
});