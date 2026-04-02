# NASA Space Explorer App

Small frontend project built around NASA's Astronomy Picture of the Day (APOD) API. The app lets a user pick a date range, fetch the returned APOD entries, and browse them in a gallery with a modal detail view.

## What It Does

- Loads APOD results for a user-selected start and end date.
- Renders each result as a gallery card with title, date, and media.
- Opens any gallery item in a modal with the full explanation text.
- Shows a loading status while requests are in flight.
- Adds two bonus cards on each run:
  - APOD for today.
  - APOD from a random date in the full APOD range.

## Project Files

- `index.html`: Main app structure, controls, gallery, bonus panel, and modal.
- `styles.css`: NASA-inspired visual styling and responsive layout.
- `dateRange.js`: APOD date limits and safe date clamping helpers.
- `script.js`: Fetch logic, gallery rendering, modal behavior, and bonus card loading.
- `README.md`: Project overview and run instructions.
- `nasaapi_md.txt`: Original assignment brief and feature checklist.

## Assignment Notes

The APOD API supports dates from `1995-06-16` through today. The app uses those limits to keep the date inputs valid and to prevent out-of-range requests.

Some APOD entries are videos instead of images. Those still render in the gallery and can be opened in the modal for their metadata and explanation.

## Run Locally

1. Open `index.html` in a browser.
2. Pick a date range.
3. Click **Get Space Images**.

## API Key

The app defaults to `DEMO_KEY` in `script.js`:

```js
const NASA_API_KEY = "DEMO_KEY";
```

Replace it with your own NASA API key if you want better rate limits.
