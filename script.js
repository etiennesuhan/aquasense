// AquaSense interactions and accessibility
(function () {
  const root = document.body;
  const page = document.body.dataset.page || 'home';
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-links');
  const langToggle = document.querySelector('.lang-toggle');
  const waitlistForm = document.querySelector('[data-form="waitlist"]');
  const statusEl = waitlistForm?.querySelector('.status');
  const pricingForm = document.querySelector('.pricing-form');
  const pricingStatusEl = pricingForm?.querySelector('.status');
  const yearEl = document.getElementById('year');
  const modals = document.querySelectorAll('.modal');
  const whitepaperBtn = document.getElementById('whitepaper-btn');
  const heroWaitlistLink = document.querySelector('.hero__actions a[href="#waitlist"]');
  const chartCanvas = document.getElementById('chart');
  const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;
  const chartButtons = document.querySelectorAll('.chip');
  const cartToggle = document.getElementById('cart-toggle');
  const cartPanel = document.getElementById('cart-panel');
  const cartItemsEl = document.getElementById('cart-items');
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');
  const productLinks = document.querySelectorAll('a[href*="product.html"][href*="variant="]');
  const navTargets = document.querySelectorAll('[data-nav]');
  const revealEls = document.querySelectorAll('.reveal');
  const accordionItems = document.querySelectorAll('.accordion__item');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LANG_KEY = 'as-lang';
  const GA_ID = 'G-EJ352WJJ05';
  const CONSENT_KEY = 'as-cookie-consent';
  const cookieBanner = document.querySelector('.cookie-banner');
  const cookieAcceptBtn = document.getElementById('cookie-accept');
  const cookieDeclineBtn = document.getElementById('cookie-decline');
  const featureModal = document.getElementById('feature-modal');
  const featureModalTitle = featureModal?.querySelector('[data-feature-title]');
  const featureModalContent = featureModal?.querySelector('.feature-modal__content');
  const featureContentEls = document.querySelectorAll('[data-feature-content]');
  let analyticsLoaded = false;

  // Mobile nav: hide only after JS bound, keep fallback visible otherwise
  initNav();
  function initNav() {
    if (!navToggle || !navList) return;
    let navOverlay = document.querySelector('.nav-overlay');
    if (!navOverlay) {
      navOverlay = document.createElement('div');
      navOverlay.className = 'nav-overlay';
      document.body.appendChild(navOverlay);
    }
    const closeNav = () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;
      navToggle.setAttribute('aria-expanded', String(nextState));
      navList.classList.toggle('open', nextState);
      document.body.classList.toggle('nav-open', nextState);
    });
    navList.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
    navOverlay?.addEventListener('click', closeNav);
    window.addEventListener('resize', () => { if (window.innerWidth > 960) closeNav(); });
    document.body.classList.add('nav-ready');
  }

  const smoothScrollTo = (targetY, duration = 900) => {
    const startY = window.scrollY;
    const delta = targetY - startY;
    let start = null;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const step = (ts) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      window.scrollTo(0, startY + delta * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const baseTexts = { text: {}, html: {}, placeholder: {}, alt: {}, aria: {} };
  document.querySelectorAll('[data-i18n]').forEach((el) => { baseTexts.text[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { baseTexts.html[el.dataset.i18nHtml] = el.innerHTML; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { baseTexts.placeholder[el.dataset.i18nPlaceholder] = el.getAttribute('placeholder') || ''; });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => { baseTexts.alt[el.dataset.i18nAlt] = el.getAttribute('alt') || ''; });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { baseTexts.aria[el.dataset.i18nAria] = el.getAttribute('aria-label') || ''; });

  const metaDescEl = document.querySelector('meta[name="description"]');
  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  const ogDescEl = document.querySelector('meta[property="og:description"]');
  const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
  const twitterDescEl = document.querySelector('meta[name="twitter:description"]');
  const baseDocTitle = document.title;
  const baseDocDesc = metaDescEl?.getAttribute('content') || '';

  const loadAnalytics = () => {
    if (analyticsLoaded) return;
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    gtag('js', new Date());
    gtag('config', GA_ID);
    analyticsLoaded = true;
  };

  const handleConsent = (state) => {
    const accepted = state === 'accepted';
    window[`ga-disable-${GA_ID}`] = !accepted;
    if (accepted) loadAnalytics();
    cookieBanner?.classList.remove('visible');
  };

  const consentState = localStorage.getItem(CONSENT_KEY);
  if (consentState) {
    handleConsent(consentState);
  } else {
    window[`ga-disable-${GA_ID}`] = true;
    cookieBanner?.classList.add('visible');
  }

  cookieAcceptBtn?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    handleConsent('accepted');
  });
  cookieDeclineBtn?.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    handleConsent('declined');
  });

  productLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetUrl = new URL(link.href, window.location.href);
      const variant = targetUrl.searchParams.get('variant');
      if (variant) localStorage.setItem('as-last-variant', variant.toLowerCase());
    });
  });

  document.querySelectorAll('[data-feature-target]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.featureTarget;
      const source = targetId ? document.getElementById(targetId) : null;
      if (featureModalContent) featureModalContent.innerHTML = source?.innerHTML || '';
      if (featureModalTitle) featureModalTitle.textContent = btn.dataset.featureTitle || btn.textContent || '';
    });
  });

  const translations = {
    en: {
      skip: 'Skip to content',
      menu: 'Menu',
      docTitle: 'AquaSense – Clean water. Clearly in sight.',
      docDesc: 'AquaSense measures your water quality (pH, conductivity, temperature, turbidity) in real time and sends smart alerts. Concept phase, Made in Germany.',
      docTitleApp: 'AquaSense App – your water in view',
      docDescApp: 'Experience the AquaSense app: live values, alerts, history and profiles in a modern interface.',
      docTitleShop: 'AquaSense Shop – choose your design',
      docDescShop: 'Explore AquaSense in three color variants and add your favourite design to the cart.',
      docTitleRequest: 'AquaSense – Custom request',
      docDescRequest: 'Send us your custom AquaSense request for projects or collaborations.',
      docTitleFaq: 'AquaSense – Frequently asked questions',
      docDescFaq: 'Answers to the most common questions about AquaSense, availability, privacy and features.',
      navStart: 'Start',
      navFeatures: 'Features',
      navSteps: 'How it works',
      navUseCases: 'Use cases',
      navApp: 'App',
      navFaq: 'FAQ',
      navShop: 'Shop',
      navCart: 'Cart',
      navCta: 'Join the waitlist',
      heroEyebrow: 'Concept phase • Made in Germany',
      heroTitle: 'Clean water. Clearly in sight.',
      heroLead: 'AquaSense measures your water quality at the line in real time – with smart alerts when values shift.',
      heroPrimaryCta: 'Join the waitlist',
      heroRequestCta: 'Send custom request',
      heroSecondaryCta: 'Download product whitepaper',
      heroImgAlt: 'AquaSense product image',
      badgeConcept: 'Concept phase',
      badgeMade: 'Made in Germany',
      badgeUsecases: 'Home • Aquatics • Coffee & Tea',
      featuresTitle: 'Features for clarity and peace of mind',
      featuresSub: 'Real-time data, alerts, dashboard, history & trends.',
      featMore: 'Learn more',
      feat1Title: 'Real-time monitoring',
      feat1Text: 'pH, conductivity (µS/cm), temperature, turbidity, dissolved oxygen, ORP; expandable platform.',
      feat2Title: 'Intelligent alerts',
      feat2Text: 'Push/email the moment a value crosses your thresholds.',
      feat3Title: 'Live dashboard',
      feat3Text: 'All values and trends in one place, including export.',
      feat4Title: 'History & trends',
      feat4Text: 'Weekly and monthly insights to spot changes early.',
      feat5Title: 'Profiles for every use',
      feat5Text: 'Profiles for coffee & tea, baby bottle, aquarium, household.',
      feat6Title: 'Privacy by design',
      feat6Text: 'Local first; optional encrypted cloud sync with opt-in.',
      stepsTitle: 'Ready in three simple steps',
      stepsSub: 'Connect. Pair. Monitor.',
      step1Title: '1. Connect',
      step1Text: 'Mount AquaSense between water line and device.',
      step2Title: '2. Pair',
      step2Text: 'Pair with the app via Wi-Fi or Bluetooth in seconds.',
      step3Title: '3. Monitor',
      step3Text: 'See live values, get alerts, act on recommendations.',
      appTitle: 'The app – clear, fast, helpful',
      appSub: 'All relevant data, alerts and profiles in one modern interface.',
      screenLive: 'Live values',
      metricPh: 'pH 7.2',
      metricCond: 'Conductivity 320 µS/cm',
      metricTemp: 'Temperature 18.4 °C',
      screenDevices: 'Device management',
      deviceAquarium: 'Aquarium – ok',
      deviceCoffee: 'Coffee – alert',
      deviceBaby: 'Baby water – ok',
      chartTitle: 'Live chart',
      chipPh: 'pH',
      chipCond: 'Conductivity',
      chartAria: 'Time series of water values',
      pointLive: 'Live values',
      pointAlert: 'Threshold alert',
      pointHistory: 'History & export',
      pointProfiles: 'Profiles',
      pointDevices: 'Device management',
      casesTitle: 'Who is AquaSense for?',
      case1Title: 'Baby & family',
      case1Text: 'Safety for the little ones.',
      case2Title: 'Coffee & tea',
      case2Text: 'Consistent water for better taste.',
      case3Title: 'Aquarium',
      case3Text: 'Stability for sensitive ecosystems.',
      case4Title: 'Tenants & owners',
      case4Text: 'Transparency in multi-unit homes.',
      specsTitle: 'Technical data (preliminary)',
      specsNote: 'Prototype status: specifications may change.',
      specSensorsLabel: 'Sensors',
      specSensors: 'pH, electrical conductivity, temperature, turbidity (extensible)',
      specConnLabel: 'Connectivity',
      specConn: 'Wi-Fi 2.4 GHz, Bluetooth LE',
      specPowerLabel: 'Power',
      specPower: '5V USB-C',
      specOpLabel: 'Operation',
      specOp: '0–50°C',
      specIpLabel: 'Protection',
      specIp: 'IPX4 (target)',
      specSizeLabel: 'Dimensions',
      specSize: '90 × 45 mm (prototype)',
      wpTitle: 'AquaSense – Product overview (snapshot)',
      wpProblemTitle: 'Problem & motivation',
      wpProblemText: 'Home water quality shifts due to treatment, pipes or filter age. Invisible changes in pH, minerals and clarity affect taste, safety, appliances and aquariums.',
      wpArchTitle: 'Architecture overview',
      wpArch1: 'Sensors: pH, electrical conductivity, temperature, turbidity; modular slots for extensions.',
      wpArch2: 'Firmware: edge analytics, threshold logic, secure updates.',
      wpArch3: 'App: live values, alerts, profiles, history & export.',
      wpArch4: 'Optional cloud: opt-in sync, remote access and backups.',
      wpPrivacyTitle: 'Privacy principles',
      wpPrivacyText: 'Local first: data stays on the device. Cloud sync is optional, encrypted and consent-based.',
      wpSpecsTitle: 'Preliminary specifications',
      wpSpecsText: 'Wi-Fi 2.4 GHz, Bluetooth LE, 5V USB-C, 0–50°C, IPX4 target, 90 × 45 mm (current prototype).',
      wpRoadmapTitle: 'Roadmap & validation',
      wpRoadmap1: 'Phase 1: Lab validation of sensors',
      wpRoadmap2: 'Phase 2: Private beta with households and enthusiasts',
      wpRoadmap3: 'Phase 3: App & feature iteration from feedback',
      wpRoadmap4: 'Phase 4: Early access & pre-orders for the waitlist',
      faqTitle: 'Frequently asked questions',
      faq1Q: 'Are you selling yet?',
      faq1A: 'No, we are in the concept and validation phase.',
      faq2Q: 'What data is stored?',
      faq2A: 'Local first; optional cloud sync only with opt-in.',
      faq3Q: 'Is a filter required?',
      faq3A: 'No, AquaSense works without the optional filter.',
      faq4Q: 'How are thresholds defined?',
      faq4A: 'Standard recommendations + personal adjustments in the app.',
      faq5Q: 'Waitlist – what happens next?',
      faq5A: 'We share prototype tests, early access and updates.',
      faq6Q: 'How do I get alerts?',
      faq6A: 'Push notifications and email when thresholds are hit.',
      waitlistTitle: 'Waitlist & updates',
      waitlistSub: 'Get updates, beta invites and the product PDF download.',
      labelEmail: 'Email *',
      labelName: 'Name (optional)',
      placeholderEmail: 'you@example.com',
      placeholderName: 'First Last',
      consentText: 'I agree to the processing of my data according to the <button type="button" class="link-button" data-modal="privacy">privacy notice</button>.',
      doubleOpt: 'Double opt-in: you will receive a confirmation email.',
      submitBtn: 'Submit',
      thanksTitle: 'Thanks for signing up!',
      thanksText: 'We will get back to you with AquaSense updates soon.',
      thanksBack: 'Back to start',
      newsletterTitle: 'Subscribe to the newsletter',
      newsletterSub: 'Get product updates, early access options and tips in your inbox.',
      newsletterLabel: 'Email address',
      newsletterCta: 'Subscribe',
      appHeroEyebrow: 'App & dashboard',
      appHeroTitle: 'AquaSense app – your water, always in view',
      appHeroLead: 'Monitor pH, conductivity, temperature and more in real time, get alerts and share profiles.',
      appHeroCta: 'Test the app',
      appHeroSecondary: 'View shop',
      appCtaTitle: 'Ready to go?',
      appCtaSub: 'Get early access to the app and the next prototypes.',
      appRequestCta: 'Custom request',
      shopEyebrow: 'Variants',
      shopTitle: 'AquaSense variants – choose your design',
      shopLead: 'Three colorways, the same sensing. Pick your favourite.',
      shopWaitlist: 'Join the waitlist',
      shopRequest: 'Custom request',
      shopGridTitle: 'All colors at a glance',
      shopGridSub: 'Click “Select” to save your preferred design.',
      productColor1: 'Silver',
      productColor2: 'Obsidian',
      productColor3: 'Graphite',
      product1Title: 'AquaSense – Silver',
      product1Desc: 'Bright, minimal look for modern kitchens and labs.',
      product1Price: 'Pricing to be announced',
      product2Title: 'AquaSense – Obsidian',
      product2Desc: 'Obsidian look with bold accents, ideal for coffee bars.',
      product2Price: 'Pricing to be announced',
      product3Title: 'AquaSense – Graphite',
      product3Desc: 'Graphite grey, robust and timeless for workshop or utility rooms.',
      product3Price: 'Pricing to be announced',
      productCta: 'Select',
      priceTbd: 'Pricing to be announced',
      deliveryTbd: 'Delivery timing will be announced.',
      stockNote: 'Pre-orders are being prepared.',
      cartTitle: 'Cart',
      cartSumLabel: 'Total',
      cartContinue: 'Continue shopping',
      cartCheckout: 'Checkout',
      cartEmpty: 'Your cart is still empty.',
      requestTitle: 'Custom request to AquaSense',
      requestLead: 'Tell us about your project or use case. We will get back quickly.',
      requestName: 'Name',
      requestEmail: 'Email *',
      requestMessage: 'Your request',
      requestSubmit: 'Send request',
      footerTagline: 'AquaSense · Clean water. Clearly in sight.',
      footerSummary: 'Real-time monitoring with alerts, trends and profiles for home, coffee & tea and aquatics. Privacy by design.',
      footerContactTitle: 'Contact',
      footerContactMail: 'service.aquasense@gmail.com',
      footerContactHours: 'Mon–Fri, 9am–5pm CET',
      footerLinksTitle: 'Shortcuts',
      footerLinkHome: 'Start',
      footerLinkApp: 'App',
      footerLinkShop: 'Shop',
      footerLinkFaq: 'FAQ',
      footerAnalyticsTitle: 'Transparency',
      footerAnalyticsText: 'We use Google Analytics to measure usage anonymously and improve the site.',
      footerRights: 'All rights reserved.',
      cookieTitle: 'Cookies & analytics',
      cookieText: 'We use Google Analytics (cookies) to evaluate usage anonymously. Please consent if that is okay for you.',
      cookieAccept: 'Accept',
      cookieDecline: 'Decline',
      closeLabel: 'Close'
    }
  };

const statusTexts = {
    de: {
      statusInvalid: 'Bitte E-Mail und Zustimmung prüfen.',
      statusSending: 'Sende...',
      statusSuccess: 'Danke! Du erhältst gleich eine Bestätigung.',
      statusError: 'Fehler beim Senden. Bitte erneut versuchen.'
    },
    en: {
      statusInvalid: 'Please check email and consent.',
      statusSending: 'Sending...',
      statusSuccess: 'Thanks! You will get a confirmation shortly.',
      statusError: 'Send failed. Please try again.'
    }
  };

let currentLang = localStorage.getItem(LANG_KEY) || 'de';
  applyLanguage(currentLang);

  function t(key) {
    return statusTexts[currentLang]?.[key] || statusTexts.de[key] || '';
  }

  function applyLanguage(lang) {
    const dict = translations[lang] || {};
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    langToggle && (langToggle.textContent = lang === 'de' ? 'DE / EN' : 'EN / DE');
    const titleKey = page === 'app'
      ? 'docTitleApp'
      : page === 'shop'
        ? 'docTitleShop'
        : page === 'request'
          ? 'docTitleRequest'
          : page === 'faq'
            ? 'docTitleFaq'
            : 'docTitle';
    const descKey = page === 'app'
      ? 'docDescApp'
      : page === 'shop'
        ? 'docDescShop'
        : page === 'request'
          ? 'docDescRequest'
          : page === 'faq'
            ? 'docDescFaq'
            : 'docDesc';
    const translatedTitle = dict[titleKey] || baseDocTitle;
    const translatedDesc = dict[descKey] || baseDocDesc;
    document.title = translatedTitle;
    metaDescEl?.setAttribute('content', translatedDesc);
    ogTitleEl?.setAttribute('content', translatedTitle);
    ogDescEl?.setAttribute('content', translatedDesc);
    twitterTitleEl?.setAttribute('content', translatedTitle);
    twitterDescEl?.setAttribute('content', translatedDesc);

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (lang === 'de' && baseTexts.text[key]) el.textContent = baseTexts.text[key];
      else if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (lang === 'de' && baseTexts.html[key] !== undefined) el.innerHTML = baseTexts.html[key];
      else if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (lang === 'de' && baseTexts.placeholder[key] !== undefined) el.setAttribute('placeholder', baseTexts.placeholder[key]);
      else if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const key = el.getAttribute('data-i18n-alt');
      if (lang === 'de' && baseTexts.alt[key] !== undefined) el.setAttribute('alt', baseTexts.alt[key]);
      else if (dict[key]) el.setAttribute('alt', dict[key]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (lang === 'de' && baseTexts.aria[key] !== undefined) el.setAttribute('aria-label', baseTexts.aria[key]);
      else if (dict[key]) el.setAttribute('aria-label', dict[key]);
    });
    bindModalTriggers();
  }

  // Smooth scrolling with offset for sticky header
  if (heroWaitlistLink) {
    heroWaitlistLink.addEventListener('click', (e) => {
      const target = document.getElementById('waitlist');
      if (!target) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const headerHeight = header?.getBoundingClientRect().height || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      smoothScrollTo(top, 1100);
    }, { passive: false });
  }

  document.documentElement.style.scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetSelector = link.getAttribute('href');
      const target = document.querySelector(targetSelector);
      const goHome = link.dataset.home && page !== 'home';
      if (goHome) {
        e.preventDefault();
        window.location.href = link.dataset.home;
        return;
      }
      if (!target) {
        if (link.dataset.home) {
          e.preventDefault();
          window.location.href = link.dataset.home;
        }
        return;
      }
      e.preventDefault();
      const headerHeight = header?.getBoundingClientRect().height || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  });

  // Sticky header shrink
  const resizeHeader = () => {
    if (window.scrollY > 12) header.classList.add('shrink');
    else header.classList.remove('shrink');
  };
  resizeHeader();
  window.addEventListener('scroll', resizeHeader);

  navTargets.forEach((link) => {
    if (link.dataset.nav === page) link.classList.add('active');
    if (link.dataset.nav === page && page !== 'home') {
      link.addEventListener('click', (e) => e.preventDefault());
    }
  });

  langToggle?.addEventListener('click', () => {
    const next = currentLang === 'de' ? 'en' : 'de';
    applyLanguage(next);
    populateProductDetail(next);
  });

  // Intersection reveal
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // Accordion: keep one open
  accordionItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        accordionItems.forEach((other) => {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });

  // Canvas chart (simple render)
  const datasets = {
    ph: { label: 'pH', color: '#1E90FF', data: mockSeries(7.1, 0.25) },
    conductivity: { label: 'Leitfähigkeit', color: '#00C2FF', data: mockSeries(320, 40) }
  };
  let currentMetric = 'ph';

  chartButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      chartButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      currentMetric = btn.dataset.metric;
      drawChart();
    });
  });

  function mockSeries(base, variance) {
    return Array.from({ length: 24 }, (_, i) => {
      const factor = Math.sin(i / 3) * variance * 0.2;
      const noise = (Math.random() - 0.5) * variance * 0.1;
      return base + factor + noise;
    });
  }

  let chartFrame = null;
  function drawChart() {
    if (!chartCanvas || !chartCtx) return;
    if (chartFrame) cancelAnimationFrame(chartFrame);
    const start = performance.now();
    const duration = prefersReducedMotion ? 0 : 700;
    const metric = datasets[currentMetric];
    const values = metric.data;
    const min = Math.min(...values) * 0.98;
    const max = Math.max(...values) * 1.02;
    const { width, height } = chartCanvas;
    const bg = getComputedStyle(root).getPropertyValue('--surface');

    const render = (now) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      chartCtx.clearRect(0, 0, width, height);
      chartCtx.fillStyle = bg;
      chartCtx.fillRect(0, 0, width, height);

      chartCtx.strokeStyle = 'rgba(91,112,131,0.25)';
      chartCtx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        chartCtx.beginPath();
        chartCtx.moveTo(0, y);
        chartCtx.lineTo(width, y);
        chartCtx.stroke();
      }

      chartCtx.beginPath();
      chartCtx.lineWidth = 3;
      chartCtx.strokeStyle = metric.color;
      const stepX = width / (values.length - 1);
      values.forEach((val, i) => {
        const eased = min + (val - min) * progress;
        const x = stepX * i;
        const y = height - ((eased - min) / (max - min)) * height;
        i === 0 ? chartCtx.moveTo(x, y) : chartCtx.lineTo(x, y);
      });
      chartCtx.stroke();

      chartCtx.fillStyle = metric.color;
      values.forEach((val, i) => {
        const eased = min + (val - min) * progress;
        const x = stepX * i;
        const y = height - ((eased - min) / (max - min)) * height;
        chartCtx.beginPath();
        chartCtx.arc(x, y, 4, 0, Math.PI * 2);
        chartCtx.fill();
      });

      if (progress < 1) {
        chartFrame = requestAnimationFrame(render);
      }
    };
    chartFrame = requestAnimationFrame(render);
  }
  if (chartCanvas && chartCtx) {
    drawChart();
  }

  // Produktdetail: Varianten-Daten und Befüllung
  const productVariants = {
    color1: {
      title: { de: 'AquaSense – Weiß', en: 'AquaSense – Silver' },
      color: { de: 'Weiß', en: 'Silver' },
      image: 'assets/color3/white.png',
      price: null,
      uvp: null,
      sku: 'AS-C1',
      desc: {
        de: 'Helle, puristische Variante für moderne Küchen und Labor-Setups.',
        en: 'Bright, minimal look for modern kitchens and labs.'
      },
      highlights: {
        de: [
          'Live-Messungen (pH, Leitfähigkeit, Temperatur, Trübung)',
          'Schwellenalarme und Trend-Insights in der App',
          'USB-C Stromversorgung, WLAN 2.4 GHz/BLE'
        ],
        en: [
          'Live readings (pH, conductivity, temperature, turbidity)',
          'Threshold alerts and trend insights in the app',
          'USB-C power, Wi-Fi 2.4 GHz/BLE'
        ]
      },
      delivery: { de: 'Lieferzeit wird noch bekanntgegeben.', en: 'Delivery timing will be announced.' },
      stock: { de: 'Auf Lager', en: 'In stock' },
      rating: 4.8,
      reviews: 128
    },
    color2: {
      title: { de: 'AquaSense – Obsidian', en: 'AquaSense – Obsidian' },
      color: { de: 'Obsidian', en: 'Obsidian' },
      image: 'assets/color2/obsidian.png',
      price: null,
      uvp: null,
      sku: 'AS-C2',
      desc: {
        de: 'Obsidian-Look mit markanten Akzenten, ideal für Coffee- und Bar-Umgebungen.',
        en: 'Obsidian look with bold accents, ideal for coffee and bar setups.'
      },
      highlights: {
        de: [
          'Robustes Gehäuse, leicht zu reinigen',
          'App-Profile für Espresso, Pour-Over und Tee',
          'Grenzwerte anpassbar für Specialty Coffee'
        ],
        en: [
          'Durable housing, easy to wipe clean',
          'App profiles for espresso, pour-over and tea',
          'Adjustable thresholds for specialty coffee'
        ]
      },
      delivery: { de: 'Lieferzeit wird noch bekanntgegeben.', en: 'Delivery timing will be announced.' },
      stock: { de: 'Begrenzt auf Lager', en: 'Limited stock' },
      rating: 4.7,
      reviews: 96
    },
    color3: {
      title: { de: 'AquaSense – Graphit', en: 'AquaSense – Graphite' },
      color: { de: 'Graphit', en: 'Graphite' },
      image: 'assets/color1/graphit.png',
      price: null,
      uvp: null,
      sku: 'AS-C3',
      desc: {
        de: 'Graphitgrau, robust und zeitlos – perfekt für Werkstatt, Labor oder Utility-Raum.',
        en: 'Graphite gray, robust and timeless – perfect for workshop, lab or utility room.'
      },
      highlights: {
        de: [
          'IPX4-Ziel, spritzwassergeschützt für raue Umgebungen',
          'Kalibrierhinweise in der App',
          'Optionale Cloud-Sync (Opt-in) für Teams'
        ],
        en: [
          'Targeting IPX4 splash resistance for tougher spaces',
          'Calibration guidance inside the app',
          'Optional cloud sync (opt-in) for teams'
        ]
      },
      delivery: { de: 'Lieferzeit wird noch bekanntgegeben.', en: 'Delivery timing will be announced.' },
      stock: { de: 'Auf Lager', en: 'In stock' },
      rating: 4.9,
      reviews: 142
    }
  };

  const variantOverrides = {
    color1: {
      title: { de: 'AquaSense - Silber', en: 'AquaSense - Silver' },
      color: { de: 'Silber', en: 'Silver' },
      desc: {
        de: 'Intelligent gesteuertes Wasseraufbereitungs- und Analysegerät für Hygiene, Geschmack und Sicherheit im Haushalt.',
        en: 'Intelligent water treatment and analysis device for hygiene, taste and safety at home.'
      },
      highlights: {
        de: [
          'Echtzeit-Wasseranalyse (Trübung, Leitfähigkeit, Temperatur, Verunreinigungen)',
          'Modulare Filtration gegen Mikroplastik, Chlor, Sedimente u. a.',
          'Smarte App mit Live-Daten, Warnungen und Empfehlungen',
          'Energieeffizientes Design mit langlebigen Materialien',
          'Zwei Eingänge und zwei Ausgänge für flexible Installation'
        ],
        en: [
          'Real-time water analysis (turbidity, conductivity, temperature, impurities)',
          'Modular filtration for microplastics, chlorine, sediment and more',
          'Smart app with live data, alerts and recommendations',
          'Energy-efficient design with durable materials',
          'Two inputs and two outputs for flexible installs'
        ]
      }
    },
    color2: {
      title: { de: 'AquaSense - Obsidian', en: 'AquaSense - Obsidian' },
      desc: {
        de: 'Premium-Variante mit dunkler Optik, identischer Sensorik und modularer Filtration für maximale Wasserqualität.',
        en: 'Premium dark look with the same sensing and modular filtration for top water quality.'
      },
      highlights: {
        de: [
          'Echtzeit-Wasseranalyse (Trübung, Leitfähigkeit, Temperatur, Verunreinigungen)',
          'Modulare Filtration gegen Mikroplastik, Chlor, Sedimente u. a.',
          'Smarte App mit Live-Daten, Warnungen und Empfehlungen',
          'Energieeffizientes Design mit LED-Statusring',
          'Zwei Eingänge und zwei Ausgänge für flexible Installation'
        ],
        en: [
          'Real-time water analysis (turbidity, conductivity, temperature, impurities)',
          'Modular filtration for microplastics, chlorine, sediment and more',
          'Smart app with live data, alerts and recommendations',
          'Energy-efficient build with LED status ring',
          'Two inputs and two outputs for flexible installs'
        ]
      },
      delivery: { de: 'Lieferzeit wird noch bekanntgegeben.', en: 'Delivery timing will be announced.' }
    },
    color3: {
      title: { de: 'AquaSense - Graphit', en: 'AquaSense - Graphite' },
      desc: {
        de: 'Robuste Graphit-Optik mit vollständiger Sensorik und smarter Filtration für anspruchsvolle Umgebungen.',
        en: 'Robust graphite look with full sensing and smart filtration for demanding environments.'
      },
      highlights: {
        de: [
          'Echtzeit-Wasseranalyse (Trübung, Leitfähigkeit, Temperatur, Verunreinigungen)',
          'Modulare Filtration gegen Mikroplastik, Chlor, Sedimente u. a.',
          'Smarte App mit Live-Daten, Warnungen und Empfehlungen',
          'Energieeffizientes, robustes Gehäuse',
          'Zwei Eingänge und zwei Ausgänge für flexible Installation'
        ],
        en: [
          'Real-time water analysis (turbidity, conductivity, temperature, impurities)',
          'Modular filtration for microplastics, chlorine, sediment and more',
          'Smart app with live data, alerts and recommendations',
          'Energy-efficient, robust housing',
          'Two inputs and two outputs for flexible installs'
        ]
      }
    }
  };

  
  function populateProductDetail(langOverride) {
    if (page !== 'product') return;
    const lang = langOverride || currentLang || 'de';
    const params = new URLSearchParams(window.location.search);
    const storedVariant = localStorage.getItem('as-last-variant');
    const variantKey = (params.get('variant') || storedVariant || 'color1').toLowerCase();
    const baseVariant = productVariants[variantKey] || productVariants.color1;
    const override = variantOverrides[variantKey];
    const variant = override ? {
      ...baseVariant,
      ...override,
      title: { ...baseVariant.title, ...(override.title || {}) },
      color: { ...baseVariant.color, ...(override.color || {}) },
      desc: { ...baseVariant.desc, ...(override.desc || {}) },
      highlights: { ...baseVariant.highlights, ...(override.highlights || {}) },
      delivery: { ...baseVariant.delivery, ...(override.delivery || {}) },
      stock: { ...baseVariant.stock, ...(override.stock || {}) }
    } : baseVariant;
    localStorage.setItem('as-last-variant', variantKey);

    const pick = (obj) => (typeof obj === 'string' ? obj : obj?.[lang] || obj?.de || '');
    const priceFmt = (value) => {
      const amount = Number(value);
      const numeric = Number.isFinite(amount) ? amount : 0;
      try {
        return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'de-DE', { style: 'currency', currency: 'EUR' }).format(numeric);
      } catch (err) {
        return `${numeric.toFixed(2)} €`;
      }
    };
    const priceText = (value) => {
      if (typeof value === 'number' && value > 0) return priceFmt(value);
      return translations[currentLang]?.priceTbd || 'Preis wird noch festgelegt';
    };

    document.title = `${pick(variant.title)} | AquaSense`;
    if (metaDescEl) metaDescEl.setAttribute('content', pick(variant.desc));

    const breadcrumb = document.getElementById('breadcrumb-product');
    const badge = document.getElementById('detail-color');
    const titleEl = document.getElementById('detail-title');
    const descEl = document.getElementById('detail-desc');
    const priceEl = document.getElementById('detail-price');
    const uvpEl = document.getElementById('detail-uvp');
    const stockEl = document.getElementById('detail-stock');
    const deliveryEl = document.getElementById('detail-delivery');
    const highlightsEl = document.getElementById('detail-highlights');
    const skuEl = document.getElementById('detail-sku');
    const imageEl = document.getElementById('detail-image');
    const ratingEl = document.querySelector('.rating');
    const ratingStarsEl = document.querySelector('.rating__stars');
    const ratingCountEl = document.querySelector('.rating__count');

    const boxPriceEl = document.getElementById('detail-box-price');
    const boxUvpEl = document.getElementById('detail-box-uvp');
    const boxStockEl = document.getElementById('detail-box-stock');
    const boxDeliveryEl = document.getElementById('detail-box-delivery');
    const boxSavingEl = document.getElementById('detail-saving');
    const addBtn = document.getElementById('add-to-cart-detail');

    const saving = variant.uvp && variant.price ? Math.max(0, variant.uvp - variant.price) : 0;
    const savingPct = saving && variant.uvp ? Math.round((saving / variant.uvp) * 100) : 0;

    if (breadcrumb) breadcrumb.textContent = pick(variant.title);
    if (badge) badge.textContent = pick(variant.color);
    if (titleEl) titleEl.textContent = pick(variant.title);
    if (descEl) descEl.textContent = pick(variant.desc);
    if (priceEl) priceEl.textContent = priceText(variant.price);
    if (uvpEl) uvpEl.hidden = true;
    if (stockEl) stockEl.textContent = pick(variant.stock);
    if (deliveryEl) deliveryEl.textContent = pick(variant.delivery) || (translations[currentLang]?.deliveryTbd || 'Lieferzeit wird noch bekanntgegeben.');
    if (skuEl) skuEl.textContent = variant.sku;
    if (imageEl) {
      imageEl.src = variant.image;
      imageEl.alt = pick(variant.title);
    }
    if (highlightsEl) {
      highlightsEl.innerHTML = '';
      (variant.highlights?.[lang] || []).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        highlightsEl.appendChild(li);
      });
    }
    if (ratingEl) ratingEl.setAttribute('aria-label', `${lang === 'en' ? 'Rating' : 'Bewertung'} ${variant.rating} / 5`);
    if (ratingStarsEl) {
      const filled = Math.min(5, Math.max(0, Math.round(variant.rating || 0)));
      ratingStarsEl.textContent = '★'.repeat(filled).padEnd(5, '☆');
    }
    if (ratingCountEl) ratingCountEl.textContent = `(${variant.reviews})`;

    if (boxPriceEl) boxPriceEl.textContent = priceText(variant.price);
    if (boxUvpEl) boxUvpEl.hidden = true;
    if (boxStockEl) boxStockEl.textContent = pick(variant.stock);
    if (boxDeliveryEl) boxDeliveryEl.textContent = pick(variant.delivery) || (translations[currentLang]?.deliveryTbd || 'Lieferzeit wird noch bekanntgegeben.');
    if (boxSavingEl) {
      if (saving > 0 && savingPct > 0) {
        boxSavingEl.hidden = false;
        boxSavingEl.textContent = `${priceFmt(saving)} (${savingPct}%)`;
      } else {
        boxSavingEl.hidden = true;
      }
    }
    if (addBtn) addBtn.hidden = true;
  }

  // Cart (shop)
// Cart (shop)
  const cart = [];
  const cartUIAvailable = Boolean(cartPanel || addToCartButtons.length);
  const currencyLocale = currentLang === 'en' ? 'en-US' : 'de-DE';

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: 'EUR' }).format(value);
    } catch (err) {
      return `${value.toFixed(2)} €`;
    }
  };

  function updateCartCount() {
    if (!cartCountEl) return;
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = String(count);
  }

  function renderCart() {
    if (!cartUIAvailable) return;
    updateCartCount();
    if (!cartItemsEl || !cartTotalEl) return;
    cartItemsEl.innerHTML = '';
    if (!cart.length) {
      const empty = document.createElement('li');
      empty.className = 'cart-empty';
      empty.textContent = translations[currentLang]?.cartEmpty || 'Dein Warenkorb ist noch leer.';
      cartItemsEl.appendChild(empty);
      cartTotalEl.textContent = formatCurrency(0);
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div class="cart-item__info">
          <p class="cart-item__title">${item.name}</p>
          <p class="cart-item__meta">${item.color || ''}</p>
        </div>
        <div class="cart-item__controls">
          <div class="cart-qty">
            <button type="button" class="icon-button" data-action="dec" data-index="${index}" aria-label="${currentLang === 'en' ? 'Decrease quantity' : 'Menge verringern'}">-</button>
            <span>${item.quantity}</span>
            <button type="button" class="icon-button" data-action="inc" data-index="${index}" aria-label="${currentLang === 'en' ? 'Increase quantity' : 'Menge erhöhen'}">+</button>
          </div>
          <p class="cart-item__price">${formatCurrency(item.price * item.quantity)}</p>
          <button type="button" class="link-button cart-remove" data-action="remove" data-index="${index}">${currentLang === 'en' ? 'Remove' : 'Entfernen'}</button>
        </div>
      `;
      cartItemsEl.appendChild(li);
    });
    cartItemsEl.querySelectorAll('button[data-index]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const action = btn.dataset.action;
        if (action === 'inc') changeQuantity(idx, 1);
        else if (action === 'dec') changeQuantity(idx, -1);
        else if (action === 'remove') removeItem(idx);
      });
    });
    cartTotalEl.textContent = formatCurrency(total);
  }

  function addToCart(item) {
    const existing = cart.find((entry) => entry.name === item.name && entry.color === item.color);
    if (existing) existing.quantity += 1;
    else cart.push({ ...item, quantity: 1 });
    renderCart();
  }

  function changeQuantity(index, delta) {
    const entry = cart[index];
    if (!entry) return;
    entry.quantity += delta;
    if (entry.quantity <= 0) cart.splice(index, 1);
    renderCart();
  }

  function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
  }

  function openCart() {
    if (!cartPanel) {
      window.location.href = 'shop.html';
      return;
    }
    renderCart();
    cartPanel.hidden = false;
    document.body.classList.add('cart-open');
  }

  function closeCart() {
    if (!cartPanel) return;
    cartPanel.hidden = true;
    document.body.classList.remove('cart-open');
  }

  if (cartUIAvailable) {
    renderCart();
    addToCartButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.productName || 'AquaSense';
        const price = Number(btn.dataset.price) || 0;
        const color = btn.dataset.color || '';
        addToCart({ name, price, color });
        openCart();
      });
    });
    cartToggle?.addEventListener('click', () => openCart());
    checkoutBtn?.addEventListener('click', () => {
      const emptyMsg = currentLang === 'en' ? 'Cart is empty. Please add a product.' : 'Warenkorb ist leer. Bitte ein Produkt hinzufügen.';
      const placeholderMsg = currentLang === 'en' ? 'Checkout coming soon – placeholder for now.' : 'Checkout folgt in Kürze – aktuell Platzhalter.';
      if (!cart.length) {
        alert(emptyMsg);
        return;
      }
      alert(placeholderMsg);
    });
    document.querySelectorAll('[data-close-cart]').forEach((btn) => btn.addEventListener('click', closeCart));
    cartPanel?.addEventListener('click', (e) => {
      if (e.target.classList?.contains('cart-panel__backdrop') || e.target.dataset.closeCart) closeCart();
    });
  } else {
    cartToggle?.addEventListener('click', () => { window.location.href = 'shop.html'; });
  }

// Form handling (uses formsubmit.co endpoint)
  if (waitlistForm && window.fetch) {
    window.asWaitlistFormBound = true;
    const emailField = waitlistForm.querySelector('input[name="email"]');
    const consent = waitlistForm.querySelector('input[name="consent"]');
    const submitBtn = waitlistForm.querySelector('button[type="submit"]');
    const defaultSubmitLabel = submitBtn?.textContent || '';

    const submitLabel = (lang) => {
      if (lang === 'en') return translations.en?.submitBtn || defaultSubmitLabel;
      return baseTexts.text?.submitBtn || defaultSubmitLabel;
    };

    const setSubmitState = (sending) => {
      if (!submitBtn) return;
      submitBtn.disabled = sending;
      submitBtn.textContent = sending ? (t('statusSending') || defaultSubmitLabel) : submitLabel(currentLang);
    };

    const setStatus = (key, fallback) => {
      if (!statusEl) return;
      statusEl.dataset.state = key;
      statusEl.textContent = t(key) || fallback;
    };

    waitlistForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const honeypot = waitlistForm.querySelector('input[name="_honey"]');
      if (honeypot?.value) return;

      if (!emailField?.checkValidity() || !consent?.checked) {
        setStatus('statusInvalid', 'Bitte E-Mail und Zustimmung pruefen.');
        emailField?.focus();
        return;
      }

      setSubmitState(true);
      setStatus('statusSending', 'Sende...');

      try {
        const res = await fetch(waitlistForm.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(waitlistForm)
        });
        if (!res.ok) throw new Error('Request failed');
        setStatus('statusSuccess', 'Danke! Du erhältst gleich eine Bestätigung.');
        waitlistForm.reset();
      } catch (err) {
        setStatus('statusError', 'Fehler beim Senden. Bitte erneut versuchen.');
      } finally {
        setSubmitState(false);
      }
    });
  }

  // Pricing form (Van-Westendorp) handling
  if (pricingForm && window.fetch) {
    window.asPricingFormBound = true;
    const pricingSubmitBtn = pricingForm.querySelector('button[type="submit"]');
    const defaultPricingLabel = pricingSubmitBtn?.textContent || '';
    const pricingNumberFields = pricingForm.querySelectorAll('input[type="number"]');

    // Allow only digits (mobile keyboards show numeric layout via attributes in HTML)
    pricingNumberFields.forEach((input) => {
      input.setAttribute('inputmode', 'decimal');
      input.setAttribute('pattern', '[0-9]*');
      input.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        const isShortcut = e.ctrlKey || e.metaKey;
        if (allowedKeys.includes(e.key) || isShortcut) return;
        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      });
      input.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
      input.addEventListener('input', () => {
        const digits = input.value.replace(/[^0-9]/g, '');
        if (digits !== input.value) input.value = digits;
      });
    });

    const setPricingStatus = (text) => {
      if (!pricingStatusEl) return;
      pricingStatusEl.textContent = text;
    };

    pricingForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (pricingSubmitBtn) {
        pricingSubmitBtn.disabled = true;
        pricingSubmitBtn.textContent = 'Sende...';
      }
      setPricingStatus('Sende...');

      try {
        const res = await fetch(pricingForm.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(pricingForm)
        });
        if (!res.ok) throw new Error('Request failed');
        setPricingStatus('Danke! Deine Preisangaben wurden gesendet.');
        pricingForm.reset();
      } catch (err) {
        setPricingStatus('Fehler beim Senden. Bitte versuche es erneut.');
      } finally {
        if (pricingSubmitBtn) {
          pricingSubmitBtn.disabled = false;
          pricingSubmitBtn.textContent = defaultPricingLabel || 'Preisfeedback senden';
        }
      }
    });
  }

// Show thank you when returning via _next
  if (location.hash === '#thank-you') {
    const thank = document.getElementById('thank-you');
    if (thank) thank.hidden = false;
  }

  // Footer year
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Modals with focus trap
  let lastFocus = null;
  function bindModalTriggers() {
    document.querySelectorAll('[data-modal]').forEach((btn) => {
      if (btn.dataset.modalBound) return;
      btn.dataset.modalBound = 'true';
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-modal');
        const modal = document.getElementById(id);
        if (!modal) return;
        lastFocus = document.activeElement;
        modal.hidden = false;
        trapFocus(modal);
        modal.querySelector('.modal__dialog')?.focus();
      });
    });
  }
  bindModalTriggers();

  modals.forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target.dataset.close || e.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cartPanel && !cartPanel.hidden) {
        closeCart();
      }
      if (navList?.classList.contains('open')) {
        navList.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
      modals.forEach((modal) => {
        if (!modal.hidden) closeModal(modal.id);
      });
    }
  });

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    releaseFocus();
  }

  function trapFocus(container) {
    if (container.dataset.trapBound) return;
    const focusable = container.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    container.dataset.trapBound = 'true';
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function releaseFocus() {
    lastFocus?.focus();
  }

  // Initial befüllen der Detailseite (falls aktiv)
  populateProductDetail();

  // Whitepaper download
  whitepaperBtn?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = 'assets/Whitepaper.pdf';
    link.download = 'AquaSense-Whitepaper.pdf';
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
})();
