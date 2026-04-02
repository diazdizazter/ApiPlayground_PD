(function () {
  const APOD_MIN = "1995-06-16";

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const APOD_MAX = `${yyyy}-${mm}-${dd}`;

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
