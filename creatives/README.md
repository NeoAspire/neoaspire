# 🎨 Creative Hub — NeoAspire

Welcome to the **NeoAspire Creative Hub**.  
This section contains all creative assets (designs, graphics, templates) published under the **NeoAspire** brand.

Assets are structured for easy preview, download, and future scalability.

---

## 📁 Folder Overview

All creative resources live inside the `creative/` directory.


# Creative Hub — How to Add Creations

## Quick Start

1. **Add your files** to the `creative/assets/` folder (JPG, PNG, PSD, etc.)
2. **Update `creations.json`** with the asset metadata
3. **Commit** — the gallery renders automatically

## Adding a New Creation Entry

Edit `creative/creations.json` and add an object with:

```json
{
  "id": "unique-id",
  "title": "Your Design Title",
  "thumb": "/creative/assets/your-thumbnail.jpg",
  "author": "Your Name",
  "category": "Icons|Abstract|Wallpaper|etc",
  "downloads": 100,
  "tags": ["tag1", "tag2", "tag3"],
  "files": [
    { "label": "JPG", "url": "/creative/assets/file.jpg" },
    { "label": "PNG", "url": "/creative/assets/file.png" },
    { "label": "PSD", "url": "/creative/assets/file.psd" }
  ]
}
```

### Field Explanations

- **id** — unique identifier (no spaces, use hyphens)
- **title** — display name of the design
- **thumb** — path to thumbnail image (220x220px recommended)
- **author** — creator name
- **category** — broad category (Icons, Wallpaper, Abstract, Poster, etc.)
- **downloads** — optional stat showing download count
- **tags** — array of 1–5 keywords for discovery
- **files** — array of downloadable formats with their URLs

## Design Tips

- **Thumbnails**: Keep them 220×220px or similar ratio for best appearance  
- **File Naming**: Use clean names: `icon-pack-01.psd`, `gradient-bg.jpg`  
- **Categories**: Use consistent category names across entries  
- **Tags**: Use lowercase, single words or hyphenated phrases  

## Dark Mode

The cards automatically support dark mode based on the site's dark-mode class.

## Example Entry

```json
{
  "id": "gradient-wallpaper",
  "title": "Gradient Wallpaper",
  "thumb": "/creative/assets/gradient-wallpaper.jpg",
  "author": "Your Name",
  "category": "Wallpaper",
  "downloads": 890,
  "tags": ["gradient", "wallpaper", "colorful"],
  "files": [
    { "label": "JPG", "url": "/creative/assets/gradient-wallpaper.jpg" },
    { "label": "PNG", "url": "/creative/assets/gradient-wallpaper.png" }
  ]
}
```
