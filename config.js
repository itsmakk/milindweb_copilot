/* =========================================================
   MILINDWEB — CENTRAL CONFIGURATION
   Single source of truth for branding, contact, services, SEO.
   Change values here; all pages reflect them automatically.
   ========================================================= */
(function (global) {
  "use strict";

  const CONFIG = {

    /* ---------- 1. BRAND IDENTITY ---------- */
    brand: {
      name: "MilindWeb",
      shortName: "MilindWeb",
      tagline: "Life should be great rather than long",
      description: "Freelance digital marketing, web development, business automation, engineering projects, photography, graphics, electrical and automotive services across Maharashtra, India.",
      logoMark: "M",
      foundedYear: 2022,
      language: "en",
      locale: "en_IN"
    },

    /* ---------- 2. DOMAIN & DEPLOYMENT ---------- */
    domain: {
      // Override per environment (e.g. production, staging).
      // Leave empty to use window.location.origin at runtime.
      production: "https://mk9.in",
      staging: "",
      development: ""
    },

    /* ---------- 2b. API BASE PATH ---------- */
    // The Cloudflare Worker on the same origin routes /api/* to Render.
    // Use this constant in any page that calls the API:
    //   fetch(CONFIG.api.basePath + '/portfolio/landing')
    api: {
      basePath: "/api/v1"
    },

    /* ---------- 3. CONTACT ---------- */
    contact: {
      email: "Aartitechservices@gmail.com",
      phone: "+91 9869787575",
      phoneRaw: "919869787575",      // E.164 (no +) for wa.me / tel
      whatsapp: "919869787575",
      address: {
        street: "Uran",
        city: "Navi Mumbai",
        state: "Maharashtra",
        country: "India",
        postal: "400702"
      },
      hours: "Mon to Fri 10:00 - 18:00 IST",
      serviceAreas: [
        "Navi Mumbai", "Pune", "Nagpur",
        "Sambhaji Nagar", "Nanded", "Latur",
        "Parbhani", "Hingoli"
      ]
    },

    /* ---------- 4. SOCIAL ---------- */
    social: {
      whatsapp:  "https://wa.me/919869787575",
      telegram:  "https://t.me/itsmakk",
      instagram: "https://instagram.com/aartitechservices",
      facebook:  "https://fb.me/AartiTechServices",
      twitter:   "https://twitter.com/milindweb",
      linkedin:  "https://linkedin.com/company/milindweb",
      youtube:   "",
      github:    "https://github.com/itsmakk"
    },

    /* ---------- 5. SERVICES (drives homepage + nav) ---------- */
    services: [
      {
        id: "digital-marketing",
        slug: "freelance_seo_consultant.html",
        title: "Digital Marketing & SEO",
        icon: "fa-chart-line",
        tagline: "Rank higher. Get found. Convert more.",
        summary: "Improve online visibility, attract qualified leads, and grow your business through SEO, Google Ads, social media marketing, content marketing, local SEO, and performance-driven digital strategies.",
        bullets: [
          "Search Engine Optimization (On-page, Off-page, Technical)",
          "Google Ads & PPC Campaigns",
          "Social Media Marketing & Management",
          "Content Marketing & Strategy",
          "Local SEO & Google Business Profile"
        ]
      },
      {
        id: "web-development",
        slug: "website-tech-solutions.html",
        title: "Website Development",
        icon: "fa-laptop-code",
        tagline: "Modern. Responsive. Built to perform.",
        summary: "Design and develop modern, responsive, SEO-friendly websites, landing pages, business portals, and custom web applications that prioritize performance, security, scalability, and user experience.",
        bullets: [
          "Responsive Business & Portfolio Websites",
          "Landing Pages & Sales Funnels",
          "Custom Web Applications & Portals",
          "SEO-friendly, fast, accessible code",
          "Maintenance, Hosting & Domain Support"
        ]
      },
      {
        id: "business-automation",
        slug: "automation.html",
        title: "Business Automation",
        icon: "fa-gears",
        tagline: "Digitize. Automate. Scale.",
        summary: "Streamline operations with custom software: Hospital & Clinic Management, Society Management, Seniority Platforms, Member Portals, workflow automation, reporting systems, and process digitization.",
        bullets: [
          "Hospital & Clinic Management Systems",
          "Society & Member Management Software",
          "Seniority & Promotion Platforms",
          "Workflow Automation & Reporting",
          "Google Sheets / API Integrations"
        ]
      },
      {
        id: "engineering-projects",
        slug: "project.html",
        title: "Engineering Projects & Training",
        icon: "fa-microchip",
        tagline: "Industry-ready. Hands-on. Career-focused.",
        summary: "Industry-oriented engineering solutions and training: IoT, embedded systems, robotics, industrial automation, PLC/SCADA, AI/ML, technical documentation, workshops, apprentice and skill development programs.",
        bullets: [
          "IoT, Embedded, Robotics & AI/ML Projects",
          "PLC / SCADA & Industrial Automation",
          "Apprentice & Industrial Training",
          "Workshops on Arduino, ESP32, Excel",
          "Reports, PPTs, Circuit Diagrams & Code"
        ]
      },
      {
        id: "photography",
        slug: "photography.html",
        title: "Photography, Videography & Drone",
        icon: "fa-camera-retro",
        tagline: "Capture. Elevate. Inspire.",
        summary: "Professional photography and videography for events, businesses, products, and promotions. Includes drone aerial shoots, cinematic coverage, equipment rental, and aerial inspections.",
        bullets: [
          "Event, Product & Corporate Photography",
          "Cinematic Videography & Editing",
          "Drone Photography & Aerial Filming",
          "Aerial Inspections & Surveys",
          "Camera & Drone Equipment Rental"
        ]
      },
      {
        id: "graphics-branding",
        slug: "graphics.html",
        title: "Graphics & Branding",
        icon: "fa-paint-brush",
        tagline: "Designs that speak. Brands that stick.",
        summary: "Build a strong visual identity with professional logo design, business branding, marketing materials, social media creatives, promotional graphics, presentations, and video editing.",
        bullets: [
          "Logo Design & Brand Identity Kits",
          "Marketing Collateral & Presentations",
          "Social Media Creatives & Ads",
          "Wedding & Event Invitations",
          "Professional Video Editing & Reels"
        ]
      },
      {
        id: "electrical",
        slug: "electrical.html",
        title: "Electrical Services",
        icon: "fa-bolt",
        tagline: "Safe. Reliable. Efficient.",
        summary: "Professional electrical installation, maintenance, troubleshooting, and repair for residential, commercial, and industrial applications — including energy-efficient and solar solutions.",
        bullets: [
          "Wiring, Panels & Switchgear Installation",
          "Industrial Electrical Maintenance",
          "Troubleshooting & Repair",
          "Energy-Efficient Upgrades",
          "Solar Power System Installation"
        ]
      },
      {
        id: "automotive",
        slug: "automotive.html",
        title: "Automotive Services",
        icon: "fa-motorcycle",
        tagline: "Keep moving. Stay safe.",
        summary: "Comprehensive two-wheeler maintenance and repair: routine servicing, diagnostics, engine and electrical work, preventive maintenance, and electric two-wheeler servicing.",
        bullets: [
          "Routine Servicing & Tune-ups",
          "Diagnostics & Engine Repairs",
          "Electrical Troubleshooting",
          "Preventive Maintenance Packages",
          "Electric Two-Wheeler Servicing"
        ]
      }
    ],

    /* ---------- 6. TEAM ---------- */
    team: [
      {
        name: "Er. Aarti",
        role: "CEO & Founder",
        bio: "DEE, B.E (Electrical). Digital Marketing Executive with 2+ years experience.",
        avatar: "A"
      },
      {
        name: "Er. M!l!nd",
        role: "Co-Founder",
        bio: "DEE, B.E (Instrumentation). 7+ years in Defence Industry.",
        avatar: "M"
      }
    ],

    /* ---------- 7. NAVIGATION ---------- */
    nav: {
      primary: [
        { label: "Home",      href: "index.html" },
        { label: "Services",  href: "#services",  children: "auto" /* populated from services */ },
        { label: "About",     href: "#about" },
        { label: "Blog",      href: "blog.html" },
        { label: "Contact",   href: "contact.html" }
      ]
    },

    /* ---------- 8. SEO DEFAULTS ---------- */
    seo: {
      author: "MilindWeb",
      robots: "index, follow",
      ogType: "website",
      ogImage: "img/og-cover.jpg",   /* absolute path resolved at runtime */
      twitterCard: "summary_large_image",
      twitterHandle: "@milindweb",
      themeColor: "#0a0a0f"
    },

    /* ---------- 9. ANALYTICS (opt-in IDs) ---------- */
    analytics: {
      googleAnalyticsId: "",   // e.g. "G-XXXXXXXXXX"
      facebookPixelId:   "",
      clarityId:         ""
    },

    /* ---------- 10. THEME (override CSS variables) ----- */
    theme: {
      default: "dark",         // "dark" | "light" | "auto"
      // Override any CSS custom property from css/theme.css
      tokens: {
        "--brand-1":  "#6366f1",
        "--brand-2":  "#8b5cf6",
        "--brand-3":  "#06b6d4"
      }
    },

    /* ---------- 11. FEATURE FLAGS ----------------------- */
    features: {
      themeToggle:     true,
      skipLink:        true,
      scrollReveal:    true,
      breadcrumbs:     false,
      cookieBanner:    true,
      backToTop:       true,
      readingProgress: true,
      search:          false
    },

    /* ---------- 11b. COOKIE BANNER --------------------- */
    cookie: {
      enabled:     true,
      message:     "We use cookies to enhance your experience and analyze traffic. By continuing, you agree to our privacy policy.",
      acceptLabel: "Accept",
      declineLabel: "Decline",
      policyUrl:   "contact.html#policies",
      policyLabel: "Read policy"
    },

    /* ---------- 11c. TESTIMONIALS (homepage + service pages) --- */
    testimonials: [
      {
        name:    "Priya S.",
        role:    "Founder, Blossom Boutique (Pune)",
        quote:   "Milind redesigned our catalogue site and ran our Google Ads for three months. Our online orders grew 3x and the site finally feels like our brand.",
        initials:"PS",
        rating:  5
      },
      {
        name:    "Rakesh P.",
        role:    "Workshop Attendee (Nanded)",
        quote:   "The Arduino workshop was exactly what I needed as a 2nd-year engineering student. Clear explanations, real projects, and great follow-up support.",
        initials:"RP",
        rating:  5
      },
      {
        name:    "Anita M.",
        role:    "Owner, Anita's Kitchen (Navi Mumbai)",
        quote:   "Quick, honest, and surprisingly affordable. The drone shoot of our kitchen opening looked cinematic and brought in walk-ins all week.",
        initials:"AM",
        rating:  5
      },
      {
        name:    "Vikram D.",
        role:    "Engineering Student (Sambhaji Nagar)",
        quote:   "MilindWeb built my final-year project from scratch and explained every line. The documentation and after-delivery support were top-notch.",
        initials:"VD",
        rating:  4
      },
      {
        name:    "Sneha K.",
        role:    "Marketing Lead, TechSeva (Nagpur)",
        quote:   "We hired MilindWeb for SEO and a new website. The leads started coming in within 6 weeks — and they keep coming. Highly recommended.",
        initials:"SK",
        rating:  5
      }
    ],

    /* ---------- 11d. FAQ (homepage + service pages) --- */
    faq: [
      {
        q: "What is your typical turnaround time?",
        a: "Most small projects (logos, one-page sites, social posts) take 3–7 days. Larger builds (multi-page sites, automation scripts, full SEO sprints) take 2–6 weeks. We always share a written timeline before starting."
      },
      {
        q: "How do you price projects?",
        a: "Fixed-scope quotes based on deliverables — not hourly. You'll get a written proposal with line items, timeline, and a clear total. We never send surprise invoices."
      },
      {
        q: "Do you work with clients outside Maharashtra?",
        a: "Yes. We serve clients across India and abroad. On-site visits are limited to Navi Mumbai / Pune / Sambhaji Nagar / Nanded; everything else is delivered remotely with scheduled video calls."
      },
      {
        q: "Can I see samples before I commit?",
        a: "Absolutely. We have a portfolio in each service section, and we'll gladly share private samples on request. Just mention what you're looking for in your first message."
      },
      {
        q: "Do you sign NDAs?",
        a: "Yes. Mutual NDAs are standard for any project involving confidential data, unreleased products, or proprietary business processes. We sign first, then start work."
      },
      {
        q: "What if I am not happy with the work?",
        a: "We work in tight iterations with feedback at every milestone, so surprises are rare. If the final deliverable doesn't match the agreed scope, we'll revise it at no extra cost until it does."
      },
      {
        q: "Which payment methods do you accept?",
        a: "UPI, bank transfer (NEFT/IMPS), and Razorpay. For projects over ₹25,000 we typically split 50% upfront and 50% on delivery. International clients can pay via Wise or PayPal."
      },
      {
        q: "Do you offer ongoing support after launch?",
        a: "Yes. Every project includes 30 days of free post-delivery support. After that, you can opt for a monthly retainer for hosting, updates, content, or analytics."
      }
    ],

    /* ---------- 12. EXTERNAL ENDPOINTS ----------------- */
    endpoints: {
      contactForm:  "https://script.google.com/macros/s/AKfycbwVzlM-VKAMYQnPKlRq4gVvQbJ-0SireCfppxiYXKqeKnVsI_SBU0DRMi9miw_3LV-Bjw/exec",
      opdForm:      "https://script.google.com/macros/s/AKfycbzlI-y3orZji_GQALezywPOQaZ3RNQR79jxJYQ9T4Gpk1U5ot7rUcOgrtQRKFOTBuGwxw/exec",
      seniorityCsv: "https://docs.google.com/spreadsheets/d/1_qwciFgPC98jL9-4j4p7qLTK639xF0Gkrddp9E4bGQo/export?format=csv"
    }
  };

  /* ---------- EXPOSE ---------- */
  global.MW_CONFIG = CONFIG;
  global.MW = global.MW || {};
  global.MW.config = CONFIG;

  /* ---------- HELPERS ---------- */
  global.MW.getDomain = function () {
    if (CONFIG.domain.production && location.hostname.includes("github.io")) return CONFIG.domain.production;
    if (CONFIG.domain.staging     && location.hostname.includes("staging"))   return CONFIG.domain.staging;
    return location.origin;
  };

  global.MW.absUrl = function (path) {
    if (!path) return MW.getDomain() + "/";
    if (/^https?:\/\//.test(path)) return path;
    const base = MW.getDomain().replace(/\/$/, "");
    const p = path.startsWith("/") ? path : "/" + path;
    return base + p;
  };

  global.MW.telHref = function () { return "tel:" + CONFIG.contact.phoneRaw; };
  global.MW.waHref  = function (msg) {
    return "https://wa.me/" + CONFIG.contact.whatsapp + (msg ? "?text=" + encodeURIComponent(msg) : "");
  };

})(window);
