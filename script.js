const NASA_API_KEY = "DEMO_KEY";
const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const getImagesBtn = document.getElementById("getImagesBtn");
const statusMessage = document.getElementById("statusMessage");
const gallery = document.getElementById("gallery");
const bonusGrid = document.getElementById("bonusGrid");

const imageModal = document.getElementById("imageModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalExplanation = document.getElementById("modalExplanation");
const activeModalState = {
  item: null
};
const RUBRIC_WINDOW_DAYS = 9;

const { min, max } = window.apodDateRange;
function setInitialDateBounds() {
  startDateInput.min = min;
  startDateInput.max = max;
  endDateInput.min = min;
  endDateInput.max = max;
  startDateInput.value = max;
  endDateInput.value = max;
}

function setStatus(message) {
  statusMessage.textContent = message;
}

setInitialDateBounds();

function toISODate(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(isoDate, dayOffset) {
  const dateObj = new Date(`${isoDate}T00:00:00Z`);
  dateObj.setUTCDate(dateObj.getUTCDate() + dayOffset);
  return dateObj.toISOString().slice(0, 10);
}

function enforceRubricWindow(rawStart, rawEnd) {
  const { start: clampedStart, end: clampedEnd } = window.apodDateRange.clampPair(rawStart, rawEnd);
  const selectedStart = clampedStart <= clampedEnd ? clampedStart : clampedEnd;

  let start = selectedStart;
  let end = addDays(start, RUBRIC_WINDOW_DAYS - 1);

  if (end > max) {
    end = max;
    start = addDays(end, -(RUBRIC_WINDOW_DAYS - 1));
    if (start < min) {
      start = min;
    }
  }

  return { start, end };
}

function randomDateFromRange(minDate, maxDate) {
  const start = new Date(minDate + "T00:00:00");
  const end = new Date(maxDate + "T00:00:00");
  const randomMs = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return toISODate(new Date(randomMs));
}

async function fetchApod(params) {
  const query = new URLSearchParams({
    api_key: NASA_API_KEY,
    ...params
  });
  const response = await fetch(`${APOD_ENDPOINT}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`NASA API returned ${response.status}`);
  }

  return response.json();
}

function cardTemplate(item, isBonus = false, badgeText = "") {
  const containerClass = isBonus ? "bonus-item" : "gallery-item";
  const mediaHtml = item.media_type === "image"
    ? `<img src="${item.url}" alt="${item.title}" loading="lazy" />`
    : `<div class="item-body"><p>This APOD entry is a ${item.media_type}. Open the detail view for more info.</p></div>`;
  const badgeHtml = badgeText ? `<span class="item-badge">${badgeText}</span>` : "";

  return `
    <article class="${containerClass}" data-date="${item.date}">
      ${badgeHtml}
      ${mediaHtml}
      <div class="item-body">
        <h3 class="item-title">${item.title}</h3>
        <p class="item-date">${item.date}</p>
      </div>
    </article>
  `;
}

function openModal(item) {
  activeModalState.item = item;

  if (item.media_type === "image") {
    modalImage.src = item.hdurl || item.url;
    modalImage.style.display = "block";
  } else {
    modalImage.removeAttribute("src");
    modalImage.style.display = "none";
  }

  modalTitle.textContent = item.title;
  modalMeta.textContent = `${item.date} | ${item.media_type.toUpperCase()}`;
  modalExplanation.textContent = item.explanation || "No explanation provided.";

  imageModal.classList.add("open");
  imageModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  activeModalState.item = null;
  imageModal.classList.remove("open");
  imageModal.setAttribute("aria-hidden", "true");
}

function normalizeToArray(payload) {
  return Array.isArray(payload) ? payload : [payload];
}

async function loadBonusCards(todayDate) {
  const randomDate = randomDateFromRange(min, max);
  const safeRandomDate = randomDate === todayDate ? min : randomDate;

  const [todayData, randomData] = await Promise.all([
    fetchApod({ date: todayDate }),
    fetchApod({ date: safeRandomDate })
  ]);

  bonusGrid.innerHTML = cardTemplate(todayData, true, "Today") + cardTemplate(randomData, true, "Showcase Pick");

  return {
    [todayData.date]: todayData,
    [randomData.date]: randomData
  };
}

function bindCardClicks(container, lookup) {
  container.addEventListener("click", (event) => {
    const card = event.target.closest("[data-date]");
    if (!card || !container.contains(card)) {
      return;
    }

    const item = lookup[card.dataset.date];
    if (item) {
      openModal(item);
    }
  });
}

function renderFallback(messageTitle, messageBody) {
  gallery.innerHTML = `<article class="placeholder-card"><h3>${messageTitle}</h3><p>${messageBody}</p></article>`;
}

async function loadGallery() {
  const rawStart = startDateInput.value;
  const rawEnd = endDateInput.value;

  if (!rawStart || !rawEnd) {
    setStatus("Please pick both a start and end date.");
    return;
  }

  const { start, end } = enforceRubricWindow(rawStart, rawEnd);
  startDateInput.value = start;
  endDateInput.value = end;

  setStatus("Loading space photos...");
  gallery.innerHTML = "";
  bonusGrid.innerHTML = "";

  try {
    const rangePayload = await fetchApod({ start_date: start, end_date: end });
    const items = normalizeToArray(rangePayload).sort((a, b) => b.date.localeCompare(a.date));

    if (!items.length) {
      renderFallback("No Results", "Try another date range.");
      setStatus("No APOD results for that range.");
      return;
    }

    gallery.innerHTML = items.map((item) => cardTemplate(item)).join("");

    const itemsByDate = {};
    items.forEach((item) => {
      itemsByDate[item.date] = item;
    });

    bindCardClicks(gallery, itemsByDate);

    const bonusItemsByDate = await loadBonusCards(max);
    bindCardClicks(bonusGrid, bonusItemsByDate);
    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus("Could not load APOD data. Check your API key and try again.");
    renderFallback("Fetch Error", "NASA data could not be loaded.");
  }
}

getImagesBtn.addEventListener("click", loadGallery);
closeModalBtn.addEventListener("click", closeModal);
imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && imageModal.classList.contains("open")) {
    closeModal();
  }
});

loadGallery();
