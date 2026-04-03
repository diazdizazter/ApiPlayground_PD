# NASA Space Explorer App

ApiPlayground_PD - 2nd part LAC.

Small frontend project built around NASA's Astronomy Picture of the Day (APOD) API. The app lets a user pick a date range, fetch a 9-day APOD window, and browse paired cards in a modal-friendly gallery.

## What It Does

- Loads APOD results for a user-selected start and end date.
- Enforces a 9-day APOD window so the gallery is always built from 9 consecutive days.
- Renders paired rows:
  - Left card: official APOD day from the selected range.
  - Right card: random APOD match (same media type when possible).
- Opens any gallery item in a modal with the full explanation text.
- Shows a loading status while requests are in flight.
- Handles APOD video entries with thumbnails and a direct modal link.

## Project Files

- `index.html`: Main app structure, controls, gallery, logo frame, and modal.
- `styles.css`: NASA-inspired visual styling and responsive layout.
- `dateRange.js`: APOD date limits and safe date clamping helpers.
- `script.js`: Fetch logic, 9-day pairing workflow, gallery rendering, and modal behavior.
- `config.local.example.js`: Template for a local API key file.
- `config.local.js`: Local-only API key file (ignored by git).
- `README.md`: Project overview and run instructions.
- `nasaapi_md.txt`: Original assignment brief and feature checklist.

## Assignment Notes

The APOD API supports dates from `1995-06-16` through today. The app uses those limits to keep the date inputs valid and to prevent out-of-range requests.

Some APOD entries are videos instead of images. Those still render in the gallery and can be opened in the modal for their metadata and explanation.

## Run Locally

1. Open `index.html` in a browser.
2. Copy `config.local.example.js` to `config.local.js`.
3. Put your NASA API key in `config.local.js`.
4. Pick a date range.
5. Click **Get Space Images**.

## API Key

The app reads `window.NASA_API_KEY` from `config.local.js` and falls back to `DEMO_KEY` if no local key is set.

```js
const NASA_API_KEY = window.NASA_API_KEY || "DEMO_KEY";
```

This keeps your real key out of tracked source files.
