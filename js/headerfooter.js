/* =========================================================
   MILINDWEB — HEADER & FOOTER LOADER
   Loads header.html + footer.html into placeholders,
   binds mobile menu, theme toggle, smooth scroll, current year.
   ========================================================= */
(function () {
  "use strict";

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load " + url);
    return res.text();
  }

  function initHeader(root) {
    const cfg = window.MW_CONFIG;
    const brand = cfg && cfg.brand;

    // Fill brand fields
    root.querySelectorAll("[data-fill='brand-name']").forEach(function (el) { el.textContent = brand.name; });
    root.querySelectorAll("[data-fill='brand-tagline']").forEach(function (el) { el.textContent = brand.tagline; });

    // Populate services dropdowns (desktop + mobile)
    if (cfg) {
      const services = cfg.services.map(function (s) {
        return '<a class="hf-dropdown-item" role="menuitem" href="' + s.slug + '">' +
               '<i class="fas ' + s.icon + '" aria-hidden="true"></i> ' +
               window.MW.escapeHtml(s.title) + '</a>';
      }).join("");

      const desktop = root.querySelector("[data-fill='nav-services']");
      if (desktop) desktop.innerHTML = services;

      const mobile = root.querySelector("[data-fill='nav-services-mobile']");
      if (mobile) mobile.innerHTML = services;
    }

    // WA CTA links
    root.querySelectorAll("[data-fill='wa-cta']").forEach(function (a) {
      const msg = a.dataset.waMsg || "Hi! I'd like more information.";
      a.setAttribute("href", window.MW.waHref(msg));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    /* Mobile menu */
    const toggle = root.querySelector(".hf-mobile-toggle");
    const menu   = root.querySelector(".hf-mobile-menu");
    const overlay = root.querySelector(".hf-mobile-overlay");

    function openMenu() {
      toggle.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("active");
      menu.setAttribute("aria-hidden", "false");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("active");
      menu.setAttribute("aria-hidden", "true");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
    function isOpen() { return menu.classList.contains("active"); }

    if (toggle && menu && overlay) {
      toggle.addEventListener("click", function () { isOpen() ? closeMenu() : openMenu(); });
      overlay.addEventListener("click", closeMenu);
      menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && isOpen()) closeMenu();
      });
    }

    /* Header scrolled state */
    const header = root.querySelector(".hf-header");
    if (header) {
      const onScroll = function () {
        header.classList.toggle("scrolled", window.scrollY > 30);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  function initFooter(root) {
    const cfg = window.MW_CONFIG;
    if (!cfg) return;

    // Brand
    root.querySelectorAll("[data-fill='brand-name']").forEach(function (el) { el.textContent = cfg.brand.name; });
    root.querySelectorAll("[data-fill='brand-description']").forEach(function (el) { el.textContent = cfg.brand.description; });

    // Social icons
    const social = root.querySelector("[data-fill='social']");
    if (social) {
      const map = [
        ["whatsapp",  cfg.social.whatsapp,  "fa-whatsapp",     "Chat on WhatsApp"],
        ["telegram",  cfg.social.telegram,  "fa-telegram-plane","Telegram"],
        ["instagram", cfg.social.instagram, "fa-instagram",    "Instagram"],
        ["facebook",  cfg.social.facebook,  "fa-facebook-f",   "Facebook"],
        ["twitter",   cfg.social.twitter,   "fa-twitter",      "Twitter"],
        ["linkedin",  cfg.social.linkedin,  "fa-linkedin-in",  "LinkedIn"],
        ["youtube",   cfg.social.youtube,   "fa-youtube",      "YouTube"],
        ["github",    cfg.social.github,    "fa-github",       "GitHub"]
      ];
      social.innerHTML = map.filter(function (m) { return m[1]; }).map(function (m) {
        return '<a href="' + m[1] + '" class="hf-social-icon" target="_blank" rel="noopener noreferrer" aria-label="' + m[3] + '" title="' + m[3] + '"><i class="fab ' + m[2] + '" aria-hidden="true"></i></a>';
      }).join("");
    }

    // Contact info
    const contact = root.querySelector("[data-fill='contact-info']");
    if (contact) {
      const a = cfg.contact.address;
      contact.innerHTML = [
        li("fa-phone",         cfg.contact.phone,         "tel:" + cfg.contact.phoneRaw),
        li("fa-envelope",      cfg.contact.email,         "mailto:" + cfg.contact.email),
        li("fa-map-marker-alt", [a.street, a.city, a.state, a.postal].filter(Boolean).join(", ")),
        li("fa-clock",         cfg.contact.hours)
      ].join("");
    }

    // Footer Explore links (first 5 services)
    const explore = root.querySelector("[data-fill='footer-links-explore']");
    if (explore) {
      explore.innerHTML = cfg.services.slice(0, 5).map(function (s) {
        return '<li><a href="' + s.slug + '">' + window.MW.escapeHtml(s.title) + '</a></li>';
      }).join("");
    }

    // Footer community links
    const community = root.querySelector("[data-fill='footer-links-community']");
    if (community) {
      community.innerHTML = [
        '<li><a href="project.html">Projects</a></li>',
        '<li><a href="workshop.html">Workshops</a></li>',
        '<li><a href="blog.html">Tech Blog</a></li>',
        '<li><a href="links.html">Other Links</a></li>',
        '<li><a href="contact.html">Contact Us</a></li>'
      ].join("");
    }

    // Current year
    root.querySelectorAll("[data-fill='current-year']").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function li(icon, text, href) {
    const inner = href
      ? '<a href="' + href + '">' + window.MW.escapeHtml(text) + '</a>'
      : window.MW.escapeHtml(text);
    return '<li><i class="fas ' + icon + '" aria-hidden="true"></i><span>' + inner + '</span></li>';
  }

  /* Theme toggle button (inserted by page) */
  document.addEventListener("click", function (e) {
    if (e.target.closest("#themeToggle")) {
      window.MW.toggleTheme();
    }
  });

  /* Init */
  async function init() {
    // Ensure the OIDC client + auth-menu are loaded on every page (they're
    // small, deferred, and no-op until MW_AUTH.ready() is called).
    injectOnce("auth/oidc-client.js", "mwOidcClient");
    injectOnce("js/auth-menu.js", "mwAuthMenu");

    const headerEl = document.getElementById("header");
    const footerEl = document.getElementById("footer");

    try {
      if (headerEl) {
        headerEl.innerHTML = await fetchText("header.html");
        initHeader(headerEl);
      }
    } catch (err) { console.error("Header load error:", err); }

    try {
      if (footerEl) {
        footerEl.innerHTML = await fetchText("footer.html");
        initFooter(footerEl);
      }
    } catch (err) { console.error("Footer load error:", err); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function injectOnce(src, id) {
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }
})();
