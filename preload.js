const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('monAPI', {
    ping: () => console.log('ping depuis main'),
});