console.log("JS LOADED");

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('creations-gallery');
  if (!gallery) return;

  const downloadCounts = JSON.parse(localStorage.getItem('creationDownloads') || '{}');

  function isLabelPremium(label) {
    if (!label) return false;
    return /\b(premium|paid|pro)\b/i.test(label);
  }

  const incrementDownload = (itemId, baseCount, countBadge) => {
    downloadCounts[itemId] = (downloadCounts[itemId] || 0) + 1;
    localStorage.setItem('creationDownloads', JSON.stringify(downloadCounts));

    if (countBadge) {
      const total = (baseCount || 0) + downloadCounts[itemId];
      countBadge.innerHTML = `📥 ${total}`;
    }
  };

  async function fetchData() {
    try {
      const res = await fetch('./creations.json');
      if (!res.ok) throw new Error("Fetch failed");
      return await res.json();
    } catch (err) {
      console.error(err);
      gallery.innerHTML = "<p>Failed to load data</p>";
    }
  }

  (async () => {
    const data = await fetchData();
    renderGallery(data || []);
  })();

  function renderGallery(items) {
    if (!items.length) return;

    const grid = document.createElement('div');
    grid.className = 'creative-grid';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'creative-card';

      // THUMB
      const thumb = document.createElement('div');
      thumb.className = 'thumb';

      const img = document.createElement('img');
      img.src = item.thumb;
      img.alt = item.title;
      img.loading = 'lazy';
      thumb.appendChild(img);

      // COUNT
      const countBadge = document.createElement('div');
      countBadge.className = 'download-count';

      const baseCount = item.downloads || 0;
      const storedDelta = downloadCounts[item.id] || 0;

      countBadge.innerHTML = `📥 ${baseCount + storedDelta}`;
      thumb.appendChild(countBadge);

      // OVERLAY
      const overlay = document.createElement('div');
      overlay.className = 'thumb-overlay';

item.files.forEach(file => {

  const isPremium = file.premium === true;

  const btn = document.createElement('button');
  btn.className = 'overlay-btn';

  if (isPremium) {
    btn.textContent = `💎 ${file.label}`;

    // ❌ Disable download
    btn.addEventListener('click', () => {
      alert("This is a Premium file 🔒");
    });

  } else {
    btn.textContent = file.label;

    // ✅ Free download
    btn.addEventListener('click', () => {
      incrementDownload(item.id, baseCount, countBadge);

      const a = document.createElement('a');
      a.href = file.url;
      a.download = '';
      a.click();
    });
  }

  overlay.appendChild(btn);
});
      // PREVIEW
      const previewBtn = document.createElement('button');
      previewBtn.className = 'overlay-btn';
      previewBtn.textContent = 'Preview';

      previewBtn.addEventListener('click', () => {
        window.open(item.thumb, '_blank');
      });

      overlay.appendChild(previewBtn);

      thumb.appendChild(overlay);
      card.appendChild(thumb);

      // BODY
      const body = document.createElement('div');
      body.className = 'card-body';

      const title = document.createElement('h3');
      title.textContent = item.title;

      const author = document.createElement('p');
      author.textContent = `By ${item.author}`;

      body.appendChild(title);
      body.appendChild(author);

      card.appendChild(body);
      gridContainer.appendChild(card);
    });

    grid.appendChild(gridContainer);
    gallery.appendChild(grid);
  }
});