/* =========================================================
   MILINDWEB — APP UTILITIES
   Applies central config to the DOM, adds scroll-reveal,
   helpers. Loaded once on every page.
   ========================================================= */
(function () {
  "use strict";

  const cfg = window.MW_CONFIG;
  if (!cfg) { console.warn("MW_CONFIG not loaded — include config.js before app.js"); return; }

  /* ---------- 1. APPLY THEME TOKENS AT RUNTIME ---------- */
  function applyThemeTokens() {
    const tokens = cfg.theme && cfg.theme.tokens;
    if (!tokens) return;
    const root = document.documentElement;
    Object.keys(tokens).forEach(function (prop) {
      root.style.setProperty(prop, tokens[prop]);
    });
  }

  /* ---------- 2. RESOLVE INITIAL THEME ------------------ */
  function resolveInitialTheme() {
    const saved = localStorage.getItem("mw-theme");
    if (saved === "dark" || saved === "light") return saved;
    if (cfg.theme.default === "dark" || cfg.theme.default === "light") return cfg.theme.default;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mw-theme", theme);
    const btn = document.getElementById("themeToggle");
    if (btn) {
      const icon = btn.querySelector("i");
      if (icon) icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  /* ---------- 3. APPLY SEO FROM CONFIG ------------------ */
  function applySeo(meta) {
    if (!meta) return;
    const domain = window.MW.getDomain();
    const set = function (sel, attr, val) {
      const el = document.head.querySelector(sel);
      if (el && val != null) el.setAttribute(attr, val);
    };
    set('meta[name="description"]', "content", meta.description || cfg.brand.description);
    set('meta[name="author"]',      "content", cfg.seo.author);
    set('meta[name="robots"]',      "content", cfg.seo.robots);
    set('meta[property="og:title"]',       "content", meta.title || cfg.brand.name);
    set('meta[property="og:description"]', "content", meta.description || cfg.brand.description);
    set('meta[property="og:url"]',         "content", window.location.href);
    set('meta[property="og:image"]',       "content", window.MW.absUrl(cfg.seo.ogImage));
    set('meta[property="og:type"]',        "content", meta.ogType || cfg.seo.ogType);
    set('meta[property="og:site_name"]',   "content", cfg.brand.name);
    set('meta[property="og:locale"]',      "content", cfg.brand.locale);
    set('meta[name="twitter:card"]',       "content", cfg.seo.twitterCard);
    set('meta[name="twitter:site"]',      "content", cfg.seo.twitterHandle);
    set('meta[name="twitter:title"]',      "content", meta.title || cfg.brand.name);
    set('meta[name="twitter:description"]', "content", meta.description || cfg.brand.description);
    set('meta[name="twitter:image"]',      "content", window.MW.absUrl(cfg.seo.ogImage));
    set('meta[name="theme-color"]',        "content", cfg.seo.themeColor);
    set('link[rel="canonical"]',           "href", window.location.href);
  }

  /* ---------- 4. SCROLL REVEAL (IntersectionObserver) -- */
  function initScrollReveal() {
    if (!cfg.features.scrollReveal) return;
    if (!("IntersectionObserver" in window)) return;
    const sel = ".reveal";
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("reveal--in");
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(sel).forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 5. RENDER HELPERS ------------------------- */
  // Populate any element with data-fill="services|nav|social|contact|team"
  function autoFill() {
    document.querySelectorAll("[data-fill]").forEach(function (el) {
      const key = el.dataset.fill;
      try {
        switch (key) {
          case "services": el.innerHTML = renderServices(el.dataset.filter || "all"); break;
          case "nav-services": el.innerHTML = renderNavServices(); break;
          case "social": el.innerHTML = renderSocial(el.dataset.size || ""); break;
          case "contact-info": el.innerHTML = renderContactInfo(); break;
          case "team": el.innerHTML = renderTeam(); break;
          case "footer-links-explore": el.innerHTML = renderFooterExplore(); break;
          case "footer-links-community": el.innerHTML = renderFooterCommunity(); break;
          case "service-areas": el.innerHTML = (cfg.contact.serviceAreas || []).map(function (a) { return '<span class="chip">' + a + '</span>'; }).join(""); break;
          case "testimonials": el.innerHTML = renderTestimonials(); break;
          case "faq": el.innerHTML = renderFaq(); break;
        }
      } catch (err) { console.error("autoFill error", key, err); }
    });
  }

  function renderServices(filter) {
    const items = cfg.services.filter(function (s) { return filter === "all" || s.id === filter; });
    return items.map(function (s, i) {
      return [
        '<a class="feature-card glass-card reveal" href="' + s.slug + '"',
        '   style="animation-delay:' + (i * 60) + 'ms"',
        '   aria-label="Learn more about ' + escapeHtml(s.title) + '">',
        '  <div class="feature-card__icon"><i class="fas ' + s.icon + '" aria-hidden="true"></i></div>',
        '  <span class="eyebrow">Service ' + String(i + 1).padStart(2, "0") + '</span>',
        '  <h3>' + escapeHtml(s.title) + '</h3>',
        '  <p>' + escapeHtml(s.summary) + '</p>',
        '  <span class="feature-card__link">Explore service</span>',
        '</a>'
      ].join("");
    }).join("");
  }

  function renderNavServices() {
    return cfg.services.map(function (s) {
      return '<a class="hf-dropdown-item" href="' + s.slug + '">' + escapeHtml(s.title) + '</a>';
    }).join("");
  }

  function renderSocial(size) {
    const map = [
      ["whatsapp",  cfg.social.whatsapp,  "fa-whatsapp",  "Chat on WhatsApp"],
      ["telegram",  cfg.social.telegram,  "fa-telegram-plane", "Telegram"],
      ["instagram", cfg.social.instagram, "fa-instagram", "Instagram"],
      ["facebook",  cfg.social.facebook,  "fa-facebook-f", "Facebook"],
      ["twitter",   cfg.social.twitter,   "fa-twitter",   "Twitter"],
      ["linkedin",  cfg.social.linkedin,  "fa-linkedin-in", "LinkedIn"],
      ["youtube",   cfg.social.youtube,   "fa-youtube",   "YouTube"],
      ["github",    cfg.social.github,    "fa-github",    "GitHub"]
    ];
    return map.filter(function (m) { return m[1]; }).map(function (m) {
      const sz = size === "sm" ? "hf-social-icon--sm" : "";
      return '<a href="' + m[1] + '" class="hf-social-icon ' + sz + '" target="_blank" rel="noopener noreferrer" aria-label="' + m[3] + '" title="' + m[3] + '"><i class="fab ' + m[2] + '" aria-hidden="true"></i></a>';
    }).join("");
  }

  function renderContactInfo() {
    const a = cfg.contact.address;
    return [
      li("fa-phone",        cfg.contact.phone,        'tel:' + cfg.contact.phoneRaw),
      li("fa-envelope",     cfg.contact.email,        'mailto:' + cfg.contact.email),
      li("fa-map-marker-alt", [a.street, a.city, a.state, a.country, a.postal].filter(Boolean).join(", ")),
      li("fa-clock",        cfg.contact.hours)
    ].join("");
    function li(icon, text, href) {
      const inner = href
        ? '<a href="' + href + '">' + escapeHtml(text) + '</a>'
        : escapeHtml(text);
      return '<li><i class="fas ' + icon + '" aria-hidden="true"></i><span>' + inner + '</span></li>';
    }
  }

  function renderTeam() {
    return cfg.team.map(function (m) {
      return [
        '<div class="team-card glass-card">',
        '  <div class="team-avatar" aria-hidden="true">' + escapeHtml(m.avatar) + '</div>',
        '  <div class="team-info">',
        '    <h3>' + escapeHtml(m.name) + '</h3>',
        '    <span class="badge">' + escapeHtml(m.role) + '</span>',
        '    <p>' + escapeHtml(m.bio) + '</p>',
        '  </div>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderFooterExplore() {
    return cfg.services.slice(0, 5).map(function (s) {
      return '<li><a href="' + s.slug + '">' + escapeHtml(s.title) + '</a></li>';
    }).join("");
  }

  function renderFooterCommunity() {
    return [
      '<li><a href="project.html">Projects</a></li>',
      '<li><a href="workshop.html">Workshops</a></li>',
      '<li><a href="blog.html">Tech Blog</a></li>',
      '<li><a href="links.html">Other Links</a></li>',
      '<li><a href="contact.html">Contact Us</a></li>'
    ].join("");
  }

  function renderTestimonials() {
    return (cfg.testimonials || []).map(function (t) {
      const stars = Array.from({length: 5}, function (_, i) {
        return '<i class="fa' + (i < t.rating ? 's' : 'r') + ' fa-star" aria-hidden="true"></i>';
      }).join("");
      return [
        '<article class="glass-card testimonial reveal">',
        '  <div class="testimonial__rating" aria-label="' + t.rating + ' out of 5 stars">' + stars + '</div>',
        '  <blockquote class="testimonial__quote">"' + escapeHtml(t.quote) + '"</blockquote>',
        '  <footer class="testimonial__person">',
        '    <span class="testimonial__avatar" aria-hidden="true">' + escapeHtml(t.initials) + '</span>',
        '    <div>',
        '      <strong>' + escapeHtml(t.name) + '</strong>',
        '      <span>' + escapeHtml(t.role) + '</span>',
        '    </div>',
        '  </footer>',
        '</article>'
      ].join("");
    }).join("");
  }

  function renderFaq() {
    return (cfg.faq || []).map(function (item, i) {
      return [
        '<details class="faq-item glass-card"' + (i === 0 ? ' open' : '') + '>',
        '  <summary><span>' + escapeHtml(item.q) + '</span><i class="fas fa-chevron-down faq-chev" aria-hidden="true"></i></summary>',
        '  <div class="faq-item__answer"><p>' + escapeHtml(item.a) + '</p></div>',
        '</details>'
      ].join("");
    }).join("");
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getDomain() {
    const d = (cfg.brand && cfg.brand.domain) || (cfg.contact && cfg.contact.domain);
    if (d) return String(d).replace(/\/+$/, "");
    // Fallback to current origin (works for local previews and prod).
    return window.location.origin.replace(/\/+$/, "");
  }

  function absUrl(path) {
    if (!path) return getDomain();
    if (/^https?:\/\//i.test(path)) return path;
    if (path.charAt(0) !== "/") path = "/" + path;
    return getDomain() + path;
  }

  function waHref(message) {
    const num = (cfg.contact && cfg.contact.whatsapp) || "";
    const text = encodeURIComponent(message || "");
    return num ? "https://wa.me/" + String(num).replace(/[^\d]/g, "") + (text ? "?text=" + text : "") : "#";
  }

  /* ---------- 6. JSON-LD SCHEMA INJECTION -------------- */
  function injectOrganizationSchema() {
    if (document.querySelector('script[type="application/ld+json"][data-source="org"]')) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": cfg.brand.name,
      "url": window.MW.getDomain(),
      "logo": window.MW.absUrl("img/logo.png"),
      "description": cfg.brand.description,
      "email": cfg.contact.email,
      "telephone": cfg.contact.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": cfg.contact.address.street,
        "addressLocality": cfg.contact.address.city,
        "addressRegion": cfg.contact.address.state,
        "addressCountry": cfg.contact.address.country,
        "postalCode": cfg.contact.address.postal
      },
      "sameAs": Object.values(cfg.social).filter(Boolean)
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.dataset.source = "org";
    s.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(s);
  }

  /* ---------- 7. INIT ----------------------------------- */
  function init() {
    applyThemeTokens();
    applyTheme(resolveInitialTheme());

    // Inject print stylesheet + lightbox once on first page load.
    // Avoids editing every HTML file to add a <link>.
    injectGlobalAssets();

    // Page-level meta override (call applySeo({title, description}) on page if needed)
    if (window.MW_PAGE_META) applySeo(window.MW_PAGE_META);

    injectOrganizationSchema();
    autoFill();
    initScrollReveal();

    if (cfg.features && cfg.features.cookieBanner !== false)    initCookieBanner();
    if (cfg.features && cfg.features.backToTop !== false)       initBackToTop();
    if (cfg.features && cfg.features.readingProgress !== false) initReadingProgress();

    injectFaqSchema();
  }

  function injectGlobalAssets() {
    if (!document.getElementById("mwPrintCss")) {
      const l = document.createElement("link");
      l.id = "mwPrintCss";
      l.rel = "stylesheet";
      l.href = "css/print.css";
      document.head.appendChild(l);
    }
    if (!document.getElementById("mwLightboxJs") && !window.MW_LIGHTBOX_INSTALLED) {
      const s = document.createElement("script");
      s.id = "mwLightboxJs";
      s.src = "js/lightbox.js";
      s.defer = true;
      document.body.appendChild(s);
    }
  }

  /* ---------- 8a. COOKIE BANNER -------------------------- */
  function initCookieBanner() {
    if (!cfg.cookie || cfg.cookie.enabled === false) return;
    const KEY = "mw_cookie_consent_v1";
    if (localStorage.getItem(KEY)) return;

    const c = cfg.cookie;
    const banner = document.createElement("div");
    banner.className = "cookie-banner glass-card";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML = [
      '<div class="cookie-banner__body">',
      '  <i class="fas fa-cookie-bite" aria-hidden="true"></i>',
      '  <p>' + escapeHtml(c.message) + ' ',
      '    <a href="' + escapeHtml(c.policyUrl) + '">' + escapeHtml(c.policyLabel) + '</a>',
      '  </p>',
      '</div>',
      '<div class="cookie-banner__actions">',
      '  <button type="button" class="btn btn--ghost btn--sm" data-cookie="decline">' + escapeHtml(c.declineLabel) + '</button>',
      '  <button type="button" class="btn btn--primary btn--sm" data-cookie="accept">' + escapeHtml(c.acceptLabel) + '</button>',
      '</div>'
    ].join("");

    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add("cookie-banner--in"); });

    banner.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-cookie]");
      if (!btn) return;
      const choice = btn.getAttribute("data-cookie");
      localStorage.setItem(KEY, choice);
      banner.classList.remove("cookie-banner--in");
      banner.classList.add("cookie-banner--out");
      setTimeout(function () { banner.remove(); }, 300);
    });
  }

  /* ---------- 8b. BACK-TO-TOP ---------------------------- */
  function initBackToTop() {
    if (document.getElementById("backToTop")) return;
    const btn = document.createElement("button");
    btn.id = "backToTop";
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);

    let ticking = false;
    function update() {
      const y = window.scrollY || document.documentElement.scrollTop;
      btn.classList.toggle("back-to-top--visible", y > 600);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 8c. READING PROGRESS BAR ------------------- */
  function initReadingProgress() {
    if (document.getElementById("readingProgress")) return;
    const bar = document.createElement("div");
    bar.id = "readingProgress";
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<div class="reading-progress__bar"></div>';
    document.body.appendChild(bar);

    let ticking = false;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0;
      bar.firstElementChild.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- 8d. FAQ SCHEMA ----------------------------- */
  function injectFaqSchema() {
    if (!cfg.faq || !cfg.faq.length) return;
    if (document.querySelector('script[type="application/ld+json"][data-source="faq"]')) return;
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": cfg.faq.map(function (f) {
        return {
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        };
      })
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.dataset.source = "faq";
    s.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---------- 8. EXPOSE HELPERS ------------------------- */
  window.MW.applyTheme = applyTheme;
  window.MW.toggleTheme = function () {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(cur === "dark" ? "light" : "dark");
  };
  window.MW.escapeHtml = escapeHtml;
  window.MW.getDomain = getDomain;
  window.MW.absUrl = absUrl;
  window.MW.waHref = waHref;
})();
