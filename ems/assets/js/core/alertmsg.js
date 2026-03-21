// alertmsg.js
import { UI_CONFIG } from './config.js';

// alert box
export function init() {
    const alert = document.getElementById('alert-box');
    if (!alert) return;

    // Close button 
    const closeBtn = document.getElementById('alert-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => alert.remove());
    }

    // Set alert time
    setTimeout(() => {
        alert.remove();
    }, UI_CONFIG.alertDuration);
}