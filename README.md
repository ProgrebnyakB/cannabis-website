# Borough Botanicals

A simple, responsive website for Borough Botanicals showcasing premium hemp and CBD products.

## Features

- Responsive design with mobile-first approach
- Product showcase
- Contact form with AJAX submission
- Dark mode support
- Accessible navigation

## Local Development

1. Clone the repository
2. Open `index.html` in your browser or use a local server:
   - VS Code: Use Live Server extension
   - Python: `python -m http.server 8000`
   - Node: `npx serve`

## Structure

```
/
├── index.html      # Main page
├── styles/
│   └── main.css    # Styles
└── scripts/
    └── main.js     # UI behaviors
```

## License

MIT License - see LICENSE file for details.

## Recent fixes

- Fixed homepage structure and cleaned up header/main nesting to stabilize layout on first paint.
- Improved responsive hero layout and centered major page blocks (`.hero-copy`, pillars, testimonial, newsletter).
- Added touch-friendly improvements (larger tap targets, focus styles, touch-action hints).
- Added Open Graph / Twitter meta tags and a simple OG SVG at `assets/og-image.svg` for better social previews.

If you want to revert any change, look at the commits in the repository or ask me to roll back a specific file.

## Logo & favicon instructions

To use your provided logo across the site, add the image files to the `assets/` folder with these names:

- `assets/logo.png` — regular logo used in the header (recommended ~120-240px wide)
- `assets/logo@2x.png` — 2x retina version for HiDPI screens (double the pixel size of `logo.png`)
- `assets/logo-32.png` — 32x32 favicon PNG
- `assets/logo-180.png` — 180x180 apple-touch-icon
- `assets/logo-192.png` — 192x192 PNG (Android / web manifest)

If you have ImageMagick installed, you can create these from your original file (PowerShell examples):

```powershell
# assume source is assets/source-logo.png
magick convert assets/source-logo.png -resize 240x240 assets/logo.png
magick convert assets/source-logo.png -resize 480x480 assets/logo@2x.png
magick convert assets/source-logo.png -resize 32x32 assets/logo-32.png
magick convert assets/source-logo.png -resize 180x180 assets/logo-180.png
magick convert assets/source-logo.png -resize 192x192 assets/logo-192.png
```

After you place these files in `assets/`, the site will use them automatically (favicon and HiDPI support). If you prefer I generate and add these files for you, attach the full-resolution logo image here or tell me where to find it and I'll create optimized copies and push them to the repo.