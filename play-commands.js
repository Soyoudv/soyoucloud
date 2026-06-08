const { ipcMain } = require('electron');

/**
 * Exécute un script JS dans le renderer et gère les erreurs silencieusement
 * @param {BrowserWindow} window - La fenêtre cible
 * @param {string} script - Le code JS à exécuter
 */
async function safeExecute(window, script) {
    try {
        return await window.webContents.executeJavaScript(script);
    } catch (err) {
        console.error(`[Tray] ExecuteJS error: ${err.message}`);
        return null;
    }
}

async function handleTogglePlayPause(mainWindow) { // toggle play/pause based on current status
    const status = await mainWindow.webContents.executeJavaScript('window.soundcloudApi.getStatus()');

    if (status === 'playing') {
        try {
            mainWindow.webContents.executeJavaScript("window.soundcloudApi.control('pause')");
        } catch (err) {
            console.error('Pause command failed:', err);
        }
    } else if (status === 'paused') {
        try {
            mainWindow.webContents.executeJavaScript("window.soundcloudApi.control('play')");
        } catch (err) {
            console.error('Play command failed:', err);
        }
    } else {
        console.warn('Unknown status, cannot toggle play/pause');
    }
}

async function handleControlCommand(mainWindow, action) { // send a simple command (play/pause/next/prev)
    try {
        await safeExecute(mainWindow, `window.soundcloudApi.control('${action}')`);
    } catch (err) {
        console.warn(`Could not send '${action}' command:`, err);
    }
}

module.exports = {
    handleTogglePlayPause,
    handleControlCommand,
    safeExecute // Utile si besoin ailleurs
};