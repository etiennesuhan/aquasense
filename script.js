// AquaSense interactions and accessibility
(function () {
  const root = document.body;
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-links');
  const langToggle = document.querySelector('.lang-toggle');
  const statusEl = document.querySelector('.status');
  const form = document.querySelector('.form');
  const yearEl = document.getElementById('year');
  const modals = document.querySelectorAll('.modal');
  const whitepaperBtn = document.getElementById('whitepaper-btn');
  const chartCanvas = document.getElementById('chart');
  const chartCtx = chartCanvas ? chartCanvas.getContext('2d') : null;
  const chartButtons = document.querySelectorAll('.chip');
  const revealEls = document.querySelectorAll('.reveal');
  const accordionItems = document.querySelectorAll('.accordion__item');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LANG_KEY = 'as-lang';

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

  const translations = {en:{skip:'Skip to content',menu:'Menu',docTitle:'AquaSense – Smart Water Quality Monitoring for Home',docDesc:'AquaSense tracks water quality (pH, conductivity, turbidity etc.) in real time, alerts on thresholds and helps you plan filter changes smarter. Join the waitlist now.',navFeatures:'Features',navSteps:'How it works',navUseCases:'Use cases',navApp:'App',navFaq:'FAQ',heroEyebrow:'Concept phase • Made in Germany',heroTitle:'Clean water. Always in sight.',heroLead:'AquaSense monitors water quality in real time at your tap. Get threshold alerts and smart filter-change recommendations.',heroPrimaryCta:'Join the waitlist',heroSecondaryCta:'Download product whitepaper',heroImgAlt:'AquaSense product image',badgeConcept:'Concept phase',badgeMade:'Made in Germany',badgeUsecases:'Home • Aquarium • Coffee',featuresTitle:'Features that truly help',featuresSub:'Everything you need to keep water quality under control effortlessly.',feat1Title:'Real-time monitoring',feat1Text:'pH, conductivity, temperature, turbidity (extensible).',feat2Title:'Threshold alerts',feat2Text:'Push & email when something is off.',feat3Title:'Filter intelligence',feat3Text:'Recommendations for changes and maintenance.',feat4Title:'Trend analysis',feat4Text:'Trends, weekly/monthly reports.',feat5Title:'Multi-device profiles',feat5Text:'Coffee, baby bottle, aquarium, more.',feat6Title:'Privacy by design',feat6Text:'Local first + opt-in cloud sync.',stepsTitle:'How it works',stepsSub:'Ready in three steps.',step1Title:'1. Connect',step1Text:'Install AquaSense between line and device/filter.',step2Title:'2. Pair',step2Text:'Pair with the app via Wi-Fi/Bluetooth.',step3Title:'3. Monitor',step3Text:'Check values live, get alerts, act on recommendations.',appTitle:'The app – clear, fast, helpful',appSub:'All relevant data, alerts and profiles in one modern interface.',screenLive:'Live values',metricPh:'pH 7.2',metricCond:'Conductivity 320 µS/cm',metricTemp:'Temperature 18.4 °C',screenDevices:'Device management',deviceAquarium:'Aquarium • ok',deviceCoffee:'Coffee • alert',deviceBaby:'Baby water • ok',chartTitle:'Live chart',chipPh:'pH',chipCond:'Conductivity',chartAria:'Time series of water values',pointLive:'Live values',pointAlert:'Threshold alert',pointHistory:'History & export',pointProfiles:'Profiles',pointDevices:'Device management',casesTitle:'Who is AquaSense for?',case1Title:'Baby & family',case1Text:'Safety for the little ones.',case2Title:'Coffee & tea',case2Text:'Consistent water for better taste.',case3Title:'Aquarium',case3Text:'Stability for sensitive ecosystems.',case4Title:'Tenants & owners',case4Text:'Transparency in multi-unit homes.',specsTitle:'Technical data (preliminary)',specsNote:'Prototype status: specifications may change.',specSensorsLabel:'Sensors',specSensors:'pH, conductivity, temperature, turbidity (extensible)',specConnLabel:'Connectivity',specConn:'Wi-Fi 2.4 GHz, Bluetooth LE',specPowerLabel:'Power',specPower:'5V USB-C',specOpLabel:'Operation',specOp:'0–50°C',specIpLabel:'Protection',specIp:'IPX4 (target)',specSizeLabel:'Dimensions',specSize:'90 × 45 mm (prototype)',faqTitle:'Frequently asked questions',faq1Q:'Are you selling yet?',faq1A:'No, we are in the concept and validation phase.',faq2Q:'What data is stored?',faq2A:'Local first; optional cloud sync only with opt-in.',faq3Q:'Is a filter required?',faq3A:'No, AquaSense works without the optional filter.',faq4Q:'How are thresholds defined?',faq4A:'Standard recommendations + personal adjustments in the app.',faq5Q:'Waitlist – what happens next?',faq5A:'We share prototype tests, early access and updates.',faq6Q:'How do I get alerts?',faq6A:'Push notifications and email when thresholds are hit.',waitlistTitle:'Join the waitlist',waitlistSub:'Sign up for updates, beta invites and the whitepaper.',labelEmail:'Email *',labelName:'Name (optional)',placeholderEmail:'you@example.com',placeholderName:'First Last',consentText:'I agree to the processing of my data according to the <button type=\"button\" class=\"link-button\" data-modal=\"privacy\">privacy notice</button>.',doubleOpt:'Double opt-in: you will receive a confirmation email.',submitBtn:'Submit',thanksTitle:'Thanks for signing up!',thanksText:'We will get back to you with AquaSense updates soon.',thanksBack:'Back to start',footerContact:'Contact: [PLACEHOLDER-EMAIL]',footerImprint:'Imprint',footerPrivacy:'Privacy',footerNote:'This site uses no cookies.',closeLabel:'Close'}};

  const statusTexts = {de:{statusInvalid:'Bitte E-Mail und Zustimmung prüfen.',statusSending:'Sende...',statusSuccess:'Danke! Du erhältst gleich eine Bestätigung.',statusError:'Fehler beim Senden. Bitte erneut versuchen.'},en:{statusInvalid:'Please check email and consent.',statusSending:'Sending...',statusSuccess:'Thanks! You will get a confirmation shortly.',statusError:'Send failed. Please try again.'}};

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
    document.title = dict.docTitle || baseDocTitle;
    metaDescEl?.setAttribute('content', dict.docDesc || baseDocDesc);
    ogTitleEl?.setAttribute('content', dict.docTitle || baseDocTitle);
    ogDescEl?.setAttribute('content', dict.docDesc || baseDocDesc);
    twitterTitleEl?.setAttribute('content', dict.docTitle || baseDocTitle);
    twitterDescEl?.setAttribute('content', dict.docDesc || baseDocDesc);

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
  document.documentElement.style.scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.getBoundingClientRect().height;
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

  // Mobile nav
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('open');
  });
  navList?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  langToggle?.addEventListener('click', () => {
    const next = currentLang === 'de' ? 'en' : 'de';
    applyLanguage(next);
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
  drawChart();

  // Form handling (uses formsubmit.co endpoint)
  if (form && window.fetch) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const honeypot = form.querySelector('input[name="_honey"]');
      if (honeypot?.value) return;

      const emailField = form.querySelector('input[name="email"]');
      const consent = form.querySelector('input[name="consent"]');
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!emailField.checkValidity() || !consent.checked) {
        statusEl.textContent = t('statusInvalid') || 'Bitte E-Mail und Zustimmung prüfen.';
        emailField.focus();
        return;
      }

      submitBtn.disabled = true;
      statusEl.textContent = t('statusSending') || 'Sende...';

      try {
        const formData = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Netzwerkproblem');
        statusEl.textContent = t('statusSuccess') || 'Danke! Du erhältst gleich eine Bestätigung.';
        form.reset();
        submitBtn.disabled = false;
        const thank = document.getElementById('thank-you');
        if (thank) thank.hidden = false;
      } catch (err) {
        statusEl.textContent = t('statusError') || 'Fehler beim Senden. Bitte erneut versuchen.';
        submitBtn.disabled = false;
        submitBtn.focus();
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

  // Whitepaper popup
  whitepaperBtn?.addEventListener('click', () => {
    const whitepaper = document.getElementById('whitepaper');
    if (!whitepaper) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const style = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; line-height: 1.6; color: #0b1220; background: #ffffff; }
        h1, h2 { color: #0b1220; }
        svg { max-width: 100%; height: auto; margin-top: 12px; }
      </style>
    `;
    win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>AquaSense Whitepaper</title>${style}</head><body>${whitepaper.innerHTML}</body></html>`);
    win.document.close();
  });
})();
