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

  const isMobileUA =
    (navigator.userAgentData && navigator.userAgentData.mobile) ||
    /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|BlackBerry/i.test(navigator.userAgent);
  const isIpadOS = !isMobileUA && /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

  if (isMobileUA || isIpadOS) {
    // Load the fullscreen Flutter app on phones instead of the webshell.
    window.location.replace("../app/");
  }
})();
