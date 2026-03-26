// ========================================
// API PLAYGROUND - STUDENT PRACTICE
// ========================================

// STEP 1: Choose Your API
// Browse free APIs at: https://github.com/public-apis/public-apis
// Examples:
//   - Cat Facts: https://catfact.ninja/fact
//   - Dog Images: https://dog.ceo/api/breeds/image/random
//   - Advice Slip: https://api.adviceslip.com/advice
//   - Bored API: https://www.boredapi.com/api/activity

// STEP 2: Test Your API
// Open your chosen API URL in your browser to see the JSON response
// Make sure it works before continuing!

// STEP 3: Paste your API URL here
const API_URL = "PASTE_API_URL_HERE";

// ========================================
// STEP 4: Write Your Fetch Code
// ========================================
// TODO: Uncomment the code below and replace PASTE_API_URL_HERE with your API_URL variable

/*
fetch("PASTE_API_URL_HERE")
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
*/

// After uncommenting, save and refresh your page.
// Open the browser console (F12) to see your data!

// ========================================
// STEP 5: Display Data on Page
// ========================================
// TODO:
// 1. Go to index.html and add: <div id="output"></div>
// 2. Uncomment the code below
// 3. Update the data property to match your API (e.g., data.fact, data.message, etc.)

/*
const output = document.getElementById("output");

fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        output.innerText = data.fact; // TODO: Change 'fact' to match your API's data structure
    });
*/

// ========================================
// STEP 6: Add a Button to Fetch New Data
// ========================================
// TODO:
// 1. Go to index.html and add: <button id="fetch-btn">Get New Data</button>
// 2. Uncomment the code below

/*
const button = document.getElementById("fetch-btn");

button.addEventListener("click", function() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            output.innerText = data.fact; // TODO: Change 'fact' to match your API's data structure
        });
});
*/

// ========================================
// STEP 7: BONUS - Add Image Support (if your API includes images)
// ========================================
// TODO: If your API returns images, uncomment and modify:

/*
button.addEventListener("click", function() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            output.innerHTML = `
                <img src="${data.image}" width="300">
                <p>${data.fact}</p>
            `;
        });
});
*/
