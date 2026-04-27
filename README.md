# NASA Space Explorer App

Learning Accelerator - Coding for the Web project

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
