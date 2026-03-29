let alertContainer = null;

function createContainer() {
    let existing = document.getElementById('alert-container');
    if (existing) return existing;

    const container = document.createElement('div');
    container.id = 'alert-container';

    document.body.appendChild(container);

    return container;
}

export function showAlert({
    message = '',
    type = 'info',
    duration = 3000,
    closable = true,
    onClose = null
} = {}) {

    if (!message) return;

    const allowedTypes = ['info', 'success', 'error', 'warning'];
    if (!allowedTypes.includes(type)) type = 'info';

    const container = createContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const msg = document.createElement('span');
    msg.className = 'toast-message';
    msg.innerText = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '&times;';

    const progress = document.createElement('div');
    progress.className = 'toast-progress';

    toast.appendChild(msg);

    if (closable) {
        toast.appendChild(closeBtn);
    }

    toast.appendChild(progress);
    container.appendChild(toast);

    let start = Date.now();

    const interval = setInterval(() => {
        if (!toast.isConnected) {
            clearInterval(interval);
            return;
        }

        let elapsed = Date.now() - start;
        let percent = ((duration - elapsed) / duration) * 100;

        progress.style.width = `${Math.max(0, percent)}%`;

        if (elapsed >= duration) {
            clearInterval(interval);
            removeToast();
        }
    }, 50);

    function removeToast() {
        clearInterval(interval);

        toast.classList.add('hide');

        setTimeout(() => {
            toast.remove();
            if (typeof onClose === 'function') {
                onClose();
            }
        }, 300);
    }

    if (closable) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            removeToast();
        };
    }

    toast.addEventListener('click', removeToast);
}