// utils/blocklist.js
const fs = require('fs');
const path = require('path');

function loadBlocklist(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Filtrer les lignes : pas de #, pas vide, prendre juste le domaine
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.split(/\s+/)[1]) // Prendre le second mot (le domaine)
            .filter(domain => domain); // Éliminer undefined/vidéos
    } catch (error) {
        console.error("Erreur chargement blocklist:", error.message);
        return [];
    }
}

module.exports = { loadBlocklist };