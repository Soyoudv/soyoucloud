const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('SC_API_custom', {
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
            console.error("SC_API_custom - getStatus error:", error);
            return 'error';
        }
    },

    control: (action) => {
        try {
            let target = null;

            switch (action) { // find the correct button based on the action
                case 'play':
                    target = document.querySelector('button[class*="playControls__play"]');
                    break;
                case 'next':
                    target = document.querySelector('button[class*="playControls__next"]') ||
                        document.querySelector('.skip-forward');
                    break;
                case 'prev':
                    target = document.querySelector('button[class*="playControls__prev"]') ||
                        document.querySelector('.skip-backward');
                    break;
            }

            if (target) { // if a button is found, click it
                target.click();
                return { success: true, action };
            } else {
                console.warn(`SC_API_custom - Bouton '${action}' introuvable.`);
                throw new Error("Button not found");
            }

        } catch (error) {
            console.error("SC_API_custom - Control error:", error);
            return { success: false, error: error.message, action };
        }
    }
});