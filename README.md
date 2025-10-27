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