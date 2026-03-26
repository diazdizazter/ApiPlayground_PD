# API Playground

A hands-on student project for learning how to fetch data from public APIs using JavaScript's `fetch()` API.

Based on [WD-LL9-Student-API-Playground](https://github.com/ZachH90/WD-LL9-Student-API-Playground).

## Getting Started

### Open in GitHub Codespaces (recommended)

Click the **Code** button on this repository and choose **Open with Codespaces**. The devcontainer will automatically install the Live Server extension so you can preview the page with a single click.

### Run locally

Just open `index.html` in your browser — no build step required.

## Student Instructions

Follow the numbered steps inside `script.js` to build your API integration:

1. **Choose an API** – browse [public-apis](https://github.com/public-apis/public-apis) for ideas.
2. **Test your API** – open the URL in your browser and verify the JSON response.
3. **Paste the URL** into the `API_URL` constant in `script.js`.
4. **Write your fetch code** – uncomment Step 4 and confirm data appears in the browser console.
5. **Display data on the page** – add `<div id="output"></div>` to `index.html` and uncomment Step 5.
6. **Add a button** – add `<button id="fetch-btn">Get New Data</button>` to `index.html` and uncomment Step 6.
7. **Bonus** – if your API returns images, uncomment Step 7 to display them.

## Project Structure

```
├── index.html          # Page structure (add your output div and button here)
├── script.js           # Step-by-step fetch code (uncomment each step as you go)
├── styles.css          # Pre-built styles — no changes needed
└── .devcontainer/
    └── devcontainer.json   # Codespaces configuration
```

