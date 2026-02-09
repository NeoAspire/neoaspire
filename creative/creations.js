document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('creations-gallery');
  if (!gallery) return;

  // Load download counts from localStorage
  const downloadCounts = JSON.parse(localStorage.getItem('creationDownloads') || '{}');

  // Helper: detect premium-like words in labels (used as fallback)
  function isLabelPremium(label) {
    if (!label) return false;
    return /\b(premium|paid|pro)\b/i.test(label) || /\(premium\)/i.test(label) || /\(paid\)/i.test(label);
  }

  // Helper function to increment download count (store only per-browser delta)
  const incrementDownload = (itemId, baseCount, countBadge) => {
    downloadCounts[itemId] = (downloadCounts[itemId] || 0) + 1;
    localStorage.setItem('creationDownloads', JSON.stringify(downloadCounts));
    if (countBadge) {
      const total = (baseCount || 0) + (downloadCounts[itemId] || 0);
      countBadge.innerHTML = `📥 ${total}`;
    }
  };

  // Load optional global premium rules then creations
  // Use multiple fallback paths because pages may be opened from different base URLs
  const premiumPaths = ['/creative/premium.json', 'creative/premium.json', './creative/premium.json'];
  const creationsPaths = ['/creative/creations.json', 'creative/creations.json', './creative/creations.json'];

  async function tryFetchJson(paths, opts = {}) {
    for (const p of paths) {
      try {
        const res = await fetch(p, opts);
        console.log('fetch', p, '->', res.status);
        if (res.ok) return res.json();
      } catch (e) {
        console.warn('fetch failed', p, e);
      }
    }
    throw new Error('All fetch attempts failed for: ' + paths[0]);
  }

  (async () => {
    try {
      let premiumRules = {};
      try {
        premiumRules = await tryFetchJson(premiumPaths);
      } catch (e) {
        console.info('premium.json not found or failed; continuing with defaults');
      }

      const data = await tryFetchJson(creationsPaths);
      renderGallery(data, premiumRules || {});
    } catch (err) {
      gallery.innerHTML = '<p style="text-align: center; color: #999;">Unable to load creations. Check creations.json.</p>';
      console.error('Error loading creations or premium rules:', err);
    }
  })();

  function renderGallery(items, premiumRules) {
    if (!items || !items.length) {
      gallery.innerHTML = '<p style="text-align: center; color: #999;">No creations found.</p>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'creative-grid';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid';

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'creative-card';

      // Thumbnail with overlay
      const thumbContainer = document.createElement('div');
      thumbContainer.className = 'thumb';

      const img = document.createElement('img');
      img.alt = item.title || 'creation';
      img.src = item.thumb || '/images/favicon/favicon.png';
      thumbContainer.appendChild(img);

      // Download count badge: combine server baseline with per-browser delta
      const countBadge = document.createElement('div');
      countBadge.className = 'download-count';
      const baseCount = item.downloads || 0;
      const storedDelta = downloadCounts[item.id] || 0;
      const displayCount = (baseCount || 0) + (storedDelta || 0);
      countBadge.innerHTML = `📥 ${displayCount}`;
      thumbContainer.appendChild(countBadge);

      // Overlay with download button
      const overlay = document.createElement('div');
      overlay.className = 'thumb-overlay';

      if (Array.isArray(item.files) && item.files.length > 0) {
        const firstFile = item.files[0];
        // Detect premium: per-file flag, or item-level flag, or label keywords
        let isPremium = (firstFile.premium === true) || (item.premium === true) || isLabelPremium(firstFile.label);

        // Apply global premium rules if provided
        if (!isPremium && premiumRules) {
          try {
            if (premiumRules.force === true) isPremium = true;
            if (Array.isArray(premiumRules.ids) && premiumRules.ids.includes(item.id)) isPremium = true;
            if (Array.isArray(premiumRules.extensions) && firstFile.url) {
              const ext = (firstFile.url.split('.').pop() || '').toLowerCase();
              if (premiumRules.extensions.map(e => e.toLowerCase()).includes(ext)) isPremium = true;
            }
            if (Array.isArray(premiumRules.labels) && firstFile.label) {
              const lbl = firstFile.label.toLowerCase();
              if (premiumRules.labels.some(p => lbl.includes(p.toLowerCase()))) isPremium = true;
            }
          } catch (e) { console.warn('premiumRules error', e); }
        }

        const btn = document.createElement('a');
        btn.className = 'download-btn';

        if (isPremium) {
          const label = firstFile.label || 'Premium';
          btn.textContent = '💎 ' + label + ' Premium';
          btn.href = '#';
          btn.style.cursor = 'not-allowed';
          btn.style.opacity = '0.85';
          btn.title = label + ' is a premium resource — contact us for pricing & licensing';
          btn.setAttribute('aria-label', label + ' is a premium resource — contact us for pricing and licensing');
          // prevent navigation on click but no alert — tooltip shows message on hover
          btn.addEventListener('click', (e) => e.preventDefault());
        } else {
          btn.href = firstFile.url;
          btn.textContent = '⬇ Download';
          btn.setAttribute('download', '');
          btn.addEventListener('click', () => incrementDownload(item.id, baseCount, countBadge));
        }
        overlay.appendChild(btn);
      }

      thumbContainer.appendChild(overlay);
      card.appendChild(thumbContainer);

      // Card body
      const body = document.createElement('div');
      body.className = 'card-body';

      // Meta: Category
      if (item.category) {
        const meta = document.createElement('div');
        meta.className = 'card-meta';
        meta.innerHTML = `<span class="card-category">${item.category}</span>`;
        body.appendChild(meta);
      }

      // Title
      const h3 = document.createElement('h3');
      h3.textContent = item.title || 'Untitled';
      body.appendChild(h3);

      // Author
      if (item.author) {
        const author = document.createElement('p');
        author.className = 'card-author';
        author.textContent = `By ${item.author}`;
        body.appendChild(author);
      }

      // Tags
      if (Array.isArray(item.tags) && item.tags.length > 0) {
        const tagContainer = document.createElement('div');
        tagContainer.className = 'card-tags';
        item.tags.slice(0, 3).forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.className = 'card-tag';
          tagEl.textContent = tag;
          tagContainer.appendChild(tagEl);
        });
        body.appendChild(tagContainer);
      }

      // Download button for mobile/accessibility
      if (Array.isArray(item.files)) {
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';
        actions.style.marginTop = '10px';
        actions.style.flexWrap = 'wrap';

        item.files.forEach(f => {
          const a = document.createElement('a');
          a.className = 'download-btn';

          // Detect premium per-file or by item flag (fallback to PSD label)
          let isPremiumFile = (f.premium === true) || (item.premium === true) || isLabelPremium(f.label);
          // apply global premium rules
          if (!isPremiumFile && premiumRules) {
            try {
              if (premiumRules.force === true) isPremiumFile = true;
              if (Array.isArray(premiumRules.ids) && premiumRules.ids.includes(item.id)) isPremiumFile = true;
              if (Array.isArray(premiumRules.extensions) && f.url) {
                const ext = (f.url.split('.').pop() || '').toLowerCase();
                if (premiumRules.extensions.map(e => e.toLowerCase()).includes(ext)) isPremiumFile = true;
              }
              if (Array.isArray(premiumRules.labels) && f.label) {
                const lbl = f.label.toLowerCase();
                if (premiumRules.labels.some(p => lbl.includes(p.toLowerCase()))) isPremiumFile = true;
              }
            } catch (e) { console.warn('premiumRules error', e); }
          }

          if (isPremiumFile) {
            const label = f.label || 'Premium';
            a.textContent = label + ' 💎 Premium';
            a.style.opacity = '0.6';
            a.style.backgroundColor = '#FFD700';
            a.style.color = '#333';
            a.style.cursor = 'not-allowed';
            a.title = label + ' is a premium resource — contact us for pricing & licensing';
            a.setAttribute('aria-label', label + ' is a premium resource — contact us for pricing and licensing');
          } else {
            a.href = f.url;
            a.textContent = f.label || 'Download';
            a.setAttribute('download', '');
          }

          a.style.fontSize = '12px';
          a.style.padding = '6px 12px';
          a.addEventListener('click', (e) => {
            if (isPremiumFile) {
              e.preventDefault();
            } else {
              incrementDownload(item.id, baseCount, countBadge);
            }
          });
          actions.appendChild(a);
        });
        body.appendChild(actions);
      }

      card.appendChild(body);
      gridContainer.appendChild(card);
    });

    grid.appendChild(gridContainer);
    gallery.appendChild(grid);
  }
});
