// alertmsg.js
export function init() {
    const alertBox = document.getElementById("alert-box");
    const closeBtn = document.getElementById("alert-close-btn");

    if (!alertBox || !closeBtn) return; // Exit if elements are missing

    closeBtn.addEventListener("click", function () {
        alertBox.style.display = "none";
    });
}