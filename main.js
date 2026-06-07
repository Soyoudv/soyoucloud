const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// LOAD BLOCKLIST
const { loadBlocklist } = require('./utils/blocklist/parse-blocklist');

// CONFIG PATHS
const userDataPath = path.join(__dirname, 'data', 'profile');
app.setPath('userData', userDataPath);
// console.log(`📂 User profile: ${userDataPath}`);

// LOAD BLOCKLIST
const BLOCKED_DOMAINS = loadBlocklist(path.join(__dirname, 'utils', 'blocklist', 'soundcloud-blocklist.txt'));
// console.log(`[${new Date().toISOString()}] Active blocking: ${BLOCKED_DOMAINS.length} domains`);

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
}

app.whenReady().then(createWindow);
