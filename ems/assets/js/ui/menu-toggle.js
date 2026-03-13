// Toggle navigation menu Humburger

console.log("Menu toggle loaded"); // Toggle navigation menu Hamburger

const menuToggle = document.getElementById("menuToggle");
const emsNav = document.getElementById("emsNav");

menuToggle.addEventListener("click", function(){
    emsNav.classList.toggle("show");
});


