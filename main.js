const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const { loadBlocklist } = require('./utils/blocklist/parse-blocklist');

const userDataPath = path.join(__dirname, 'data', 'profile');
app.setPath('userData', userDataPath);

const BLOCKED_DOMAINS = loadBlocklist(path.join(__dirname, 'blocklist.txt'));
console.log(`[${new Date().toISOString()}] Blocage actif : ${BLOCKED_DOMAINS.length} domaines`);

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

    const noscrollbarPath = path.join(__dirname, 'styles', 'no-scrollbar.css');
    const customStyles = fs.readFileSync(noscrollbarPath, 'utf8');
    mainWindow.webContents.insertCSS(customStyles);

    // --- BLOCAGE DES REQUÊTES RÉSEAU ---
    const filter = {
        urls: [
            '*://*/*',  // Intercepte TOUTES les requêtes HTTP/HTTPS
            '*://*/*.js',
            '*://*/*.css',
            '*://*/*.png',
            '*://*/*.jpg'
        ]
    };

    mainWindow.webContents.session.webRequest.onBeforeRequest(filter, (details, callback) => {
        const url = details.url;

        // Vérifier si l'URL contient un domaine bloqué
        const isBlocked = BLOCKED_DOMAINS.some(domain => {
            // Évite les faux positifs (ex: soundcloud.ad.com ≠ ad.domain.com)
            return url.includes(domain) ||
                url.endsWith(domain) ||
                url.includes('.' + domain) ||
                url.includes('/' + domain + '/');
        });

        if (isBlocked) {
            console.log(`🚫 Bloqué : ${url}`);
            callback({ cancel: true });  // Annule la requête
        } else {
            callback({});  // Laisse passer
        }
    });

    // --- INJECTION CSS (Optionnel - nettoie ce qui est déjà chargé) ---
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS(`
            *::-webkit-scrollbar { display: none; }
            * { scrollbar-width: none; -ms-overflow-style: none; }
            /* Ajoute tes autres règles anti-pub cosmétiques */
            .ad-banner, .advertisement, .promo { display: none !important; }
        `);
    });

    // chargement de soundcloud
    mainWindow.loadURL('https://soundcloud.com/discover');
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);
