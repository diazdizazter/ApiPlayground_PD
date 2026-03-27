const output = document.getElementById("output");
const button = document.getElementById("fetch-btn");

function fetchCatFact() {
  button.disabled = true;
  output.classList.add("loading");
  output.classList.remove("error");

  fetch("https://catfact.ninja/fact")
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      console.log(data);
      output.innerText = data.fact;
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      output.innerText = "Oops! Could not fetch a fact. Please try again.";
      output.classList.add("error");
    })
    .finally(() => {
      button.disabled = false;
      output.classList.remove("loading");
    });
}

button.addEventListener("click", fetchCatFact);

// Fetch a fact on page load so the page isn't empty
fetchCatFact();
