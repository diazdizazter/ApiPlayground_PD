(function () {
  const APOD_MIN = "1995-06-16";

  // Use UTC and step back one day to avoid requesting an APOD date not yet published.
  const safeUtcDate = new Date();
  safeUtcDate.setUTCDate(safeUtcDate.getUTCDate() - 1);
  const APOD_MAX = safeUtcDate.toISOString().slice(0, 10);

  window.apodDateRange = {
    min: APOD_MIN,
    max: APOD_MAX,
    clampPair(start, end) {
      const safeStart = start < APOD_MIN ? APOD_MIN : start;
      const safeEnd = end > APOD_MAX ? APOD_MAX : end;
      if (safeStart > safeEnd) {
        return { start: safeEnd, end: safeEnd };
      }
      return { start: safeStart, end: safeEnd };
    }
  };
})();
