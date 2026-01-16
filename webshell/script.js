(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("shell")) {
    // Force the webshell even on mobile.
    return;
  }
  if (params.has("app")) {
    window.location.replace("../app/");
    return;
  }

  const isCompactScreen = window.matchMedia
    ? window.matchMedia("(max-width: 900px)").matches
    : window.innerWidth <= 900;

  if (isCompactScreen) {
    // Load the fullscreen Flutter app on phones instead of the webshell.
    window.location.replace("../app/");
  }
})();
