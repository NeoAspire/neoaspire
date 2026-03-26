// LOADER JS

export function loadPageScript() {
    const pageScript = document.body.dataset.pageJs;
    if (!pageScript) return;

    // prevent duplicate
    if (document.querySelector(`script[src="${pageScript}"]`)) return;

    const script = document.createElement('script');
    script.type = 'module';
    script.src = pageScript;

    document.body.appendChild(script);
}

