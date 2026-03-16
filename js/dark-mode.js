// darkmode.js
export function init() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const body = document.body;

    if (!toggleButton) return; // Exit if toggle button not present

    // Initialize mode and icon
    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
        toggleButton.textContent = '☀️';  // Sun icon in dark mode
    } else {
        toggleButton.textContent = '🌙';  // Moon icon in light mode
    }

    // Toggle dark mode on click
    toggleButton.addEventListener('click', function () {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled');
            toggleButton.textContent = '☀️';
        } else {
            localStorage.setItem('dark-mode', 'disabled');
            toggleButton.textContent = '🌙';
        }
    });
}