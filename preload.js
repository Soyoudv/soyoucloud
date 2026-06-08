const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('soundcloudApi', {
    getStatus: () => {
        try {
            const playBtn = document.querySelector('button[title*=" current"]');

            if (playBtn) {
                const title = playBtn.getAttribute('title') || '';
                if (title.includes('Pause current')) {
                    return 'playing';
                }
                else if (title.includes('Play current')) {
                    return 'paused';
                }
            }

            return 'unknown';

        } catch (error) {
            console.error("SoundCloud API - getStatus error:", error);
            return 'error';
        }
    },

    control: (action) => {
        try {
            let target = null;

            switch (action) { // find the correct button based on the action
                case 'play':
                    target = document.querySelector('button[title="Play current"]');
                    break;
                case 'pause':
                    target = document.querySelector('button[title="Pause current"]');
                    break;
                case 'next':
                    target = document.querySelector('[class*="playControls__next"]') ||
                        document.querySelector('.skip-forward');
                    break;
                case 'prev':
                    target = document.querySelector('[class*="playControls__prev"]') ||
                        document.querySelector('.skip-backward');
                    break;
            }

            if (target) { // if a button is found, click it
                target.click();
                return { success: true, action };
            } else {
                console.warn(`Soncloud API - Bouton '${action}' introuvable.`);
                throw new Error("Button not found");
            }

        } catch (error) {
            console.error("SoundCloud API - Control error:", error);
            return { success: false, error: error.message, action };
        }
    }
});