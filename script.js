const NASA_API_KEY = window.NASA_API_KEY || "DEMO_KEY";
const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const getImagesBtn = document.getElementById("getImagesBtn");
const statusMessage = document.getElementById("statusMessage");
const gallery = document.getElementById("gallery");

const imageModal = document.getElementById("imageModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalMediaLink = document.getElementById("modalMediaLink");
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
    thumbs: "true",
    ...params
  });
  const response = await fetch(`${APOD_ENDPOINT}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`NASA API returned ${response.status}`);
  }

  return response.json();
}

function cardTemplate(item, cardId, badgeText = "") {
  const containerClass = "gallery-item";
  const mediaHtml = item.media_type === "image"
    ? `<img src="${item.url}" alt="${item.title}" loading="lazy" />`
    : `<img src="${item.thumbnail_url || item.url}" alt="${item.title} video thumbnail" loading="lazy" />`;
  const badgeHtml = badgeText ? `<span class="item-badge">${badgeText}</span>` : "";

  return `
    <article class="${containerClass}" data-id="${cardId}">
      ${badgeHtml}
      ${mediaHtml}
      <div class="item-body">
        <h3 class="item-title">${item.title}</h3>
        <p class="item-date">${item.date}</p>
      </div>
    </article>
  `;
}

function nonImageTemplate(item, cardId, badgeText = "") {
  const containerClass = "gallery-item";
  const badgeHtml = badgeText ? `<span class="item-badge">${badgeText}</span>` : "";
  return `
    <article class="${containerClass}" data-id="${cardId}">
      ${badgeHtml}
      <div class="item-body">
        <h3 class="item-title">${item.title}</h3>
        <p class="item-date">${item.date}</p>
        <p>This APOD entry is a ${item.media_type}. Open the detail view for more info.</p>
      </div>
    </article>
  `;
}

function buildCard(item, cardId, badgeText = "") {
  if (item.media_type === "image") {
    return cardTemplate(item, cardId, badgeText);
  }
  return nonImageTemplate(item, cardId, badgeText);
}

function openModal(item) {
  activeModalState.item = item;

  if (item.media_type === "image") {
    modalImage.src = item.hdurl || item.url;
    modalImage.style.display = "block";
    modalMediaLink.innerHTML = "";
  } else {
    modalImage.removeAttribute("src");
    modalImage.style.display = "none";
    modalMediaLink.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener noreferrer">Open NASA video in a new tab</a>`;
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

async function pickRandomByType(excludeDate, mediaType, maxAttempts = 8) {
  let fallback = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const randomDate = randomDateFromRange(min, max);
    if (randomDate === excludeDate) {
      continue;
    }

    const candidate = await fetchApod({ date: randomDate });
    if (!fallback) {
      fallback = candidate;
    }

    if (candidate.media_type === mediaType) {
      return candidate;
    }
  }

  return fallback;
}

async function buildGalleryPairs(items) {
  const cardLookup = {};

  const rowMarkup = await Promise.all(items.map(async (item, index) => {
    const randomMatch = await pickRandomByType(item.date, item.media_type);
    const officialId = `official-${index}-${item.date}`;
    cardLookup[officialId] = item;

    const randomId = randomMatch ? `random-${index}-${randomMatch.date}` : "";
    if (randomMatch) {
      cardLookup[randomId] = randomMatch;
    }

    const officialCard = buildCard(item, officialId, "Official Daily Gallery");
    const randomCard = randomMatch
      ? buildCard(randomMatch, randomId, "Kell's Gift Galleria")
      : `<article class="placeholder-card"><h3>Kell's Gift Galleria</h3><p>No random APOD was available for this frame.</p></article>`;

    return `
      <section class="gallery-row" aria-label="APOD paired frame for ${item.date}">
        <div>
          ${officialCard}
        </div>
        <div>
          ${randomCard}
        </div>
      </section>
    `;
  }));

  gallery.innerHTML = rowMarkup.join("");
  return cardLookup;
}

function bindCardClicks(container, lookup) {
  container.onclick = (event) => {
    const card = event.target.closest("[data-id]");
    if (!card || !container.contains(card)) {
      return;
    }

    const item = lookup[card.dataset.id];
    if (item) {
      openModal(item);
    }
  };
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

  try {
    const rangePayload = await fetchApod({ start_date: start, end_date: end });
    const items = normalizeToArray(rangePayload).sort((a, b) => b.date.localeCompare(a.date));

    if (!items.length) {
      renderFallback("No Results", "Try another date range.");
      setStatus("No APOD results for that range.");
      return;
    }

    const itemsLookup = await buildGalleryPairs(items);
    bindCardClicks(gallery, itemsLookup);
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
