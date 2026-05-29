import { CONFIG, path } from "./config.js";

// ===============================
// LOAD ADS
// ===============================
export function loadAds() {

    const app = document.body.dataset.app || "main";
    const page = document.body.dataset.page;

    const ads = CONFIG.ADS?.[app]?.[page] || [];

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

                        const status = ins?.getAttribute("data-ad-status");

                        // Google returned no ad
                        if (status === "unfilled") {

                            container.style.display = "none";
                        }

                    }, 3000);

                } catch (e) {

                    console.error("Adsense Error:", e);

                    // Hide failed ad container
                    container.style.display = "none";
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