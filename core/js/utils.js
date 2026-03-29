// ===============================
// UTILS JS (Core Helpers)
// ===============================

// CACHE STORAGE CONTROLL

const cache = {}; // in-memory cache per file

/**
 * Fetch any file (HTML, JS, CSS) with smart cache handling
 * @param {string} url - file URL
 * @param {object} options - { force: boolean, timeout: ms }
 */
export async function fetchHTML(url, { force = false, timeout = 8000 } = {}) {
    try {
        // Return cached memory version if available
        if (!force && cache[url]) return cache[url];

        // Append timestamp to force reload if file is updated
        const fetchUrl = force ? `${url}?v=${Date.now()}` : url;

        // Timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const res = await fetch(fetchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP Error: ${url}`);

        const content = await res.text();

        // Update memory cache
        cache[url] = content;

        return content;
    } catch (err) {
        console.error("❌ Failed to load:", url, err);
        return `<p style="color:red;">Failed to load component</p>`;
    }
}