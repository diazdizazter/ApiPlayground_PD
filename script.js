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

function formatDotDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${Number(month)}.${Number(day)}.${year}`;
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
        <p class="item-date">${item.dateLabel}: ${formatDotDate(item.date)}</p>
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
        <p class="item-date">${item.dateLabel}: ${formatDotDate(item.date)}</p>
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
  modalMeta.textContent = `${formatDotDate(item.date)} . ${item.media_type.toUpperCase()}`;
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

function pickFromPool(randomPool, usedIndexes, excludeDate, mediaType) {
  let fallbackIndex = -1;

  for (let i = 0; i < randomPool.length; i += 1) {
    if (usedIndexes.has(i)) {
      continue;
    }

    const candidate = randomPool[i];
    const isSameDate = candidate.date === excludeDate;
    if (fallbackIndex === -1 && !isSameDate) {
      fallbackIndex = i;
    }

    if (!isSameDate && candidate.media_type === mediaType) {
      usedIndexes.add(i);
      return candidate;
    }
  }

  if (fallbackIndex >= 0) {
    usedIndexes.add(fallbackIndex);
    return randomPool[fallbackIndex];
  }

  return null;
}

async function buildGalleryPairs(items, randomPool) {
  const cardLookup = {};
  const usedRandomIndexes = new Set();

  const rowMarkup = items.map((item, index) => {
    const randomMatch = pickFromPool(randomPool, usedRandomIndexes, item.date, item.media_type);
    const officialId = `official-${index}-${item.date}`;
    const officialItem = {
      ...item,
      dateLabel: "NASA: Solar Revolution Imagery"
    };
    cardLookup[officialId] = officialItem;

    const randomId = randomMatch ? `random-${index}-${randomMatch.date}` : "";
    if (randomMatch) {
      cardLookup[randomId] = {
        ...randomMatch,
        dateLabel: "Kell's Gift Galleria"
      };
    }

    const officialCard = buildCard(officialItem, officialId, "Official Daily Gallery");
    const randomCard = randomMatch
      ? buildCard(cardLookup[randomId], randomId, "Kell's Gift Galleria")
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
  });

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
    const [rangePayload, randomPayload] = await Promise.all([
      fetchApod({ start_date: start, end_date: end }),
      fetchApod({ count: 30 })
    ]);
    const items = normalizeToArray(rangePayload).sort((a, b) => b.date.localeCompare(a.date));
    const randomPool = normalizeToArray(randomPayload);

    if (!items.length) {
      renderFallback("No Results", "Try another date range.");
      setStatus("Out of Solar Revolution Travel Range");
      return;
    }

    const itemsLookup = await buildGalleryPairs(items, randomPool);
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
