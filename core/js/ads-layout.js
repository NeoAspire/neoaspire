// ===============================
//  CREATE AD SLOTS
// ===============================
export function createAdSlots(ads = []) {

    const main = document.querySelector("main") || document.body;

    ads.forEach(ad => {

        // Skip if no location
        if (!ad.location) return;

        // Convert "#top-ad" -> "top-ad"
        const id = ad.location.replace("#", "");

        // Prevent duplicate
        if (document.getElementById(id)) return;

        // Create container
        const container = document.createElement("div");
        container.id = id;

        // ===============================
        // TOP AD
        // ===============================
        if (id === "top-ad") {

            main.prepend(container);
        }

        // ===============================
        // MIDDLE AD
        // ===============================
        else if (id === "middle-ad") {

            const sections = main.querySelectorAll("section");

            if (sections[1]) {
                sections[1].after(container);
            } else {
                main.append(container);
            }
        }

        // ===============================
        // BOTTOM AD
        // ===============================
        else {

            main.append(container);
        }

    });
}