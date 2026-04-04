(function () {
  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatStardate(dateObj) {
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const hour = pad(dateObj.getHours());
    const minute = pad(dateObj.getMinutes());
    const second = pad(dateObj.getSeconds());
    return `${month}.${day}.${year}.${hour}.${minute}.${second}`;
  }

  function renderStardates() {
    const now = new Date();
    const formatted = formatStardate(now);
    const targets = document.querySelectorAll("[data-stardate-target]");
    targets.forEach((node) => {
      node.textContent = formatted;
    });
  }

  renderStardates();
  setInterval(renderStardates, 1000);
})();
