# Frontend Structure

This frontend is organized for static hosting with feature-based pages and shared assets.

## Layout

- `index.html`: Landing page.
- `about.html`, `contact.html`, `faq.html`: Marketing/info pages.
- `login.html`, `signup.html`: Auth entry pages.
- `personalTracker/`: Personal footprint feature pages.
- `websiteTracker/`: Website audit feature pages.
- `images/`: Image assets used across pages.
- `assets/`: Shared non-image assets.
  - `assets/css/`: Global/auth CSS files.
  - `assets/js/pages/`: Page-specific JavaScript modules.
  - `assets/data/`: Static JSON/reference data.

## URL Conventions

- Use canonical route casing:
  - `/websiteTracker/`
  - `/personalTracker/`
- Prefer absolute app routes for primary navigation when possible.

## Notes

- Tracker page scripts are extracted to:
  - `assets/js/pages/website-tracker.js`
  - `assets/js/pages/food-tracker.js`
  - `assets/js/pages/energy-tracker.js`
  - `assets/js/pages/transport-tracker.js`
  - `assets/js/pages/shopping-tracker.js`
- When adding new shared styles/scripts, place them in `assets/` and reference with stable relative paths.
