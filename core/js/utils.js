// ===============================
// UTILS JS (Core Helpers)
// ===============================

// In-memory cache
const cache = {};

// Cache version (change this to clear all cached HTML)
const CACHE_VERSION = "v1";

// ===============================
// FETCH HTML WITH CACHE + TIMEOUT
// ===============================

export async function fetchHTML(url, timeout = 8000) {
    try {

        // 1. Memory cache
        if (cache[url]) {
            return cache[url];
        }

        const key = `cache_${CACHE_VERSION}_${url}`;

        // 2. LocalStorage cache
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                cache[url] = stored;
                return stored;
            }
        } catch (e) {
            // If storage is corrupted or blocked
            localStorage.removeItem(key);
        }

        // 3. Timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // 4. Fetch request
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        // 5. HTTP Error Handling
        if (!res.ok) throw new Error(`HTTP Error: ${url}`);

        const html = await res.text();

        // 6. Save in cache
        cache[url] = html;
        try {
            localStorage.setItem(key, html);
        } catch (e) {
            console.warn("LocalStorage full or blocked:", e);
        }

        return html;

    } catch (err) {
        console.error("❌ Failed to load:", url, err);

        return `<p style="color:red;">Failed to load component</p>`;
    }
}