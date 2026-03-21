// darkmode.js → Handles theme toggle
import { STORAGE_KEYS } from './config.js';

localStorage.getItem(STORAGE_KEYS.darkMode);


export function initDarkMode() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) return;

    const isDark = localStorage.getItem('dark-mode') === 'enabled';

    // Apply saved mode
    document.body.classList.toggle('dark-mode', isDark);
    toggleButton.textContent = isDark ? '☀️' : '🌙';

    // Toggle mode
    toggleButton.addEventListener('click', () => {
        const enabled = document.body.classList.toggle('dark-mode');

        toggleButton.textContent = enabled ? '☀️' : '🌙';
        localStorage.setItem('dark-mode', enabled ? 'enabled' : 'disabled');
    });
}
