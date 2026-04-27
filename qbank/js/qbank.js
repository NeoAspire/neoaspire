 const paymentEnabled = false; // 🔥 change to true when Razorpay added
  
document.addEventListener("DOMContentLoaded", () => {
 
  const container = document.getElementById("qbankContainer");

  const searchInput = document.getElementById("searchInput");
  const classFilter = document.getElementById("classFilter");
  const subjectFilter = document.getElementById("subjectFilter");
  const suggestionBox = document.getElementById("searchSuggestions");

  const modal = document.getElementById("noResultsModal");
  const paymentModal = document.getElementById("paymentModal");
  
  const closeModal = document.getElementById("closeModal");
  const resetBtn = document.getElementById("resetFilters");
  const resetAllBtn = document.getElementById("resetAllFilters");

  // 🔥 NEW (for paid)
  let selectedDownloadLink = "";

  let cards = [];
  let classGroups = [];
  let allData = [];

  /* =========================
     FETCH JSON DATA
  ========================= */
  fetch("./data/qbank.json")
    .then(res => res.json())
    .then(data => {
      renderQBank(data);
      populateFilters(data);
      initAfterRender();
    })
    .catch(err => console.error("JSON Load Error:", err));

  /* =========================
     RENDER FUNCTION
  ========================= */
  function renderQBank(data) {
    container.innerHTML = "";

    const grouped = {};

    data.forEach(item => {
      if (!grouped[item.class]) grouped[item.class] = [];
      grouped[item.class].push(item);
    });

    Object.keys(grouped).forEach(cls => {

      const group = document.createElement("div");
      group.className = "class-group";

      group.innerHTML = `
        <h2 class="class-title">Class ${cls} Resources</h2>
        <div class="subject-grid"></div>
      `;

      const grid = group.querySelector(".subject-grid");

      grouped[cls].forEach(subject => {

        let content = "";

        subject.resources.forEach(res => {
          content += `<div class="resource-category">${res.category}</div>`;

          res.items.forEach(item => {

            // 🔥 Smart links
            const viewLink = item.view || item.pdf;
            const downloadLink = item.download === false ? null : (item.download || item.pdf);

            const hasView = viewLink && viewLink !== "#" && !viewLink.includes("url");
            const hasDownload = downloadLink && downloadLink !== "#" && !downloadLink.includes("url");

            const isPaid = item.paid === true;
            const price = item.price || "";

            content += `
              <div class="resource-item">
                <span>${item.name}</span>
                <div class="actions">

                  ${hasView ? `<button class="viewPdf" data-pdf="${viewLink}">👁 View</button>` : ``}

                  ${hasDownload ? `
                    <a href="${downloadLink}" 
                       class="downloadPdf" 
                       data-paid="${isPaid}">
                       ${isPaid ? `💰 ₹${price}` : "⬇ Download"}
                    </a>
                  ` : ``}

                  ${!hasView && !hasDownload ? `<span style="color: var(--color-text-muted)">Not Available</span>` : ``}

                </div>
              </div>
            `;
          });
        });

        const card = document.createElement("div");
        card.className = "subject-card";
        card.dataset.class = subject.class;
        card.dataset.subject = subject.subject;

        card.innerHTML = `
          <div class="dropdown">
            <button class="dropbtn">${subject.title}</button>
            <div class="dropdown-content">${content}</div>
          </div>
        `;

        grid.appendChild(card);
      });

      container.appendChild(group);
    });
  }

  /* =========================
     GLOBAL CLICK EVENTS
  ========================= */
  document.addEventListener("click", e => {

    // 👁 VIEW
    if (e.target.classList.contains("viewPdf")) {
      const pdfUrl = e.target.getAttribute("data-pdf");

      if (pdfUrl && pdfUrl !== "#") {
        window.open(pdfUrl, "_blank");
      } else {
        alert("PDF not available");
      }
    }

    // ⬇ DOWNLOAD / 💰 PAID
    if (e.target.classList.contains("downloadPdf")) {
      e.preventDefault();

      const link = e.target.getAttribute("href");
      const isPaid = e.target.dataset.paid === "true";

      if (!link || link === "#") {
        alert("Download not available");
        return;
      }

      if (isPaid) {
        // 🔥 OPEN PAYMENTMODAL
        selectedDownloadLink = link;

        const paymentTitle = document.getElementById("paymentTitle");
       const paymentMessage = document.getElementById("paymentMessage");
       const payBtn = document.getElementById("payNowBtn");

        // ✅ Check if payment modal exists
  if (paymentEnabled) {
    // ✅ Normal payment
    paymentTitle.innerText = "Complete Payment";
    paymentMessage.innerText = "Click below to proceed";
    payBtn.style.display = "inline-block";

  } else {
    // ❌ Payment not available
    paymentTitle.innerText = "Payment Unavailable";
    paymentMessage.innerText = "⚠ Payment system is not available right now. Please try later.";
    
    if (payBtn) payBtn.style.display = "none";
  }

  paymentModal.classList.add("show");
}
       else {
        // FREE DOWNLOAD
        window.open(link, "_blank");
      }
    }

    // Dropdown toggle
    if (e.target.classList.contains("dropbtn")) {
      const parent = e.target.parentElement;

      document.querySelectorAll(".dropdown").forEach(d => {
        if (d !== parent) d.classList.remove("active");
      });

      parent.classList.toggle("active");
    }

    // Close suggestions
    if (!e.target.closest(".search-wrapper")) {
      suggestionBox.classList.remove("show");
    }
  });

  /* =========================
     PAYMENT BUTTON
  ========================= */
  document.getElementById("payNowBtn")?.addEventListener("click", () => {

    alert("Payment Successful!"); // 🔥 Replace with Razorpay later

    if (selectedDownloadLink) {
      window.open(selectedDownloadLink, "_blank");
    }

   paymentModal.classList.remove("show");
  });

  /* =========================
     FILTERS
  ========================= */
  function populateFilters(data) {
    const classes = new Set();
    const subjects = new Set();

    data.forEach(item => {
      classes.add(item.class);
      subjects.add(item.subject);
    });

    classes.forEach(cls => {
      const option = document.createElement("option");
      option.value = cls;
      option.textContent = `Class ${cls}`;
      classFilter.appendChild(option);
    });

    subjects.forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      subjectFilter.appendChild(option);
    });
  }

  function initAfterRender() {
    cards = document.querySelectorAll(".subject-card");
    classGroups = document.querySelectorAll(".class-group");
    buildSearchData();
    attachEvents();
  }

  function buildSearchData() {
    allData = [];

    cards.forEach(card => {
      card.innerText.split("\n").forEach(item => {
        const clean = item.trim();
        if (clean.length > 3 && !allData.includes(clean)) {
          allData.push(clean);
        }
      });
    });
  }

  function filterQBank() {
    const searchValue = searchInput.value.toLowerCase();
    const classValue = classFilter.value;
    const subjectValue = subjectFilter.value;

    let visibleCount = 0;

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      const cardClass = card.dataset.class;
      const cardSubject = card.dataset.subject;

      let show = true;

      if (!text.includes(searchValue)) show = false;
      if (classValue !== "all" && cardClass !== classValue) show = false;
      if (subjectValue !== "all" && cardSubject !== subjectValue) show = false;

      card.style.display = show ? "block" : "none";

      if (show) visibleCount++;
    });

    classGroups.forEach(group => {
      const visibleCards = group.querySelectorAll(".subject-card[style*='block']");
      group.style.display = visibleCards.length ? "block" : "none";
    });

    modal.classList.toggle("show", visibleCount === 0);
    paymentModal.classList.remove("show");
  }

  function attachEvents() {

    searchInput.addEventListener("input", () => {
      const value = searchInput.value.toLowerCase();
      suggestionBox.innerHTML = "";

      if (!value) {
        suggestionBox.classList.remove("show");
        filterQBank();
        return;
      }

      const filtered = allData
        .filter(item => item.toLowerCase().includes(value))
        .slice(0, 6);

      filtered.forEach(item => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerText = item;

        div.onclick = () => {
          searchInput.value = item;
          suggestionBox.classList.remove("show");
          filterQBank();
        };

        suggestionBox.appendChild(div);
      });

      suggestionBox.classList.toggle("show", filtered.length > 0);
      filterQBank();
    });

    classFilter.addEventListener("change", filterQBank);
    subjectFilter.addEventListener("change", filterQBank);

    resetAllBtn.addEventListener("click", () => {
      searchInput.value = "";
      classFilter.value = "all";
      subjectFilter.value = "all";
      suggestionBox.classList.remove("show");
      modal.classList.remove("show");
        paymentModal.classList.remove("show");

      filterQBank();
    });

    resetBtn.addEventListener("click", () => resetAllBtn.click());

    closeModal.addEventListener("click", () => {
      modal.classList.remove("show");
      paymentModal.classList.remove("show");
    });
  }

});