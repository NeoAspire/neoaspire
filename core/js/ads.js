import { CONFIG, path } from "./config.js";

// ===============================
// LOAD ADS
// ===============================
export function loadAds() {

    const app = document.body.dataset.app || "main";
    const page = document.body.dataset.page;

    const rootGlobalAds = CONFIG.ADS?.global || [];
    const appGlobalAds = CONFIG.ADS?.[app]?.global || [];
    const pageAds = CONFIG.ADS?.[app]?.[page] || [];

    const ads = [
        ...rootGlobalAds,
        ...appGlobalAds,
        ...pageAds
    ];

    ads.forEach(ad => {

        setTimeout(() => {

            const container = document.querySelector(ad.location);

            if (!container) return;

            // Prevent duplicate loading
            if (container.dataset.loaded) return;

            // ===============================
            // ADSENSE
            // ===============================
            if (ad.type === "adsense") {

                container.innerHTML = `
                    <ins class="adsbygoogle"
                        style="display:block"
                        data-ad-client="${CONFIG.ADSENSE.client}"
                        data-ad-slot="${ad.slot}"
                        data-ad-format="auto"
                        data-adtest="on"
                        data-full-width-responsive="true"></ins>
                `;

                try {

                    (window.adsbygoogle = window.adsbygoogle || []).push({});

                    // Hide unfilled ads automatically
                    setTimeout(() => {

                        const ins = container.querySelector(".adsbygoogle");

                        if (!ins) {
                            container.remove();
                            return;
                        }

                        const status = ins.getAttribute("data-ad-status");

                        // Explicit unfilled
                        if (status === "unfilled") {
                            container.remove();
                            return;
                        }

                        // No visible ad rendered
                        const height = ins.offsetHeight;
                        const width = ins.offsetWidth;

                        if (height < 20 || width < 20) {
                            container.remove();
                        }

                    }, 1500);

                } catch (e) {

                    console.error("Adsense Error:", e);

                    // Hide failed ad container
                    container.remove();
                }
            }

            // ===============================
            // AFFILIATE IMAGE
            // ===============================
            else if (ad.type === "affiliate") {

                container.innerHTML = `
                    <a href="${ad.link}" target="_blank" rel="noopener noreferrer sponsored">
                        <img src="${path(ad.image)}"
                             alt="Advertisement"
                             class="affiliate-ad">
                    </a>
                `;
            }

            // ===============================
            // CUSTOM HTML
            // ===============================
            else if (ad.type === "html") {

                container.innerHTML = ad.html;
            }

            container.dataset.loaded = "true";

        }, ad.delay || 0);

    });
}