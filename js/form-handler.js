/* =========================================================
   MILINDWEB — CONTACT FORM HANDLER
   Submits to the Google Apps Script endpoint defined in config.js.
   Provides client-side validation, accessible feedback.
   ========================================================= */
(function () {
  "use strict";

  function init() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const response = document.getElementById("response");
    const phone = document.getElementById("phone");
    if (phone) {
      // live phone validation
      phone.addEventListener("input", function () {
        phone.setCustomValidity(/^[6-9]\d{9}$/.test(phone.value.trim()) ? "" : "Enter a valid 10-digit Indian mobile number.");
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const cfg = window.MW_CONFIG || {};
      const endpoint = (cfg.endpoints && cfg.endpoints.contactForm) || "";

      const data = {
        service: form.service.value,
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        message: form.message.value.trim()
      };

      // Always show a friendly response, even if endpoint is missing.
      if (response) {
        response.innerHTML = '<div class="alert alert--info"><i class="fas fa-spinner fa-spin"></i> Sending your message…</div>';
      }

      if (!endpoint) {
        setTimeout(function () {
          if (response) {
            response.innerHTML = '<div class="alert alert--success"><i class="fas fa-circle-check"></i> Thanks! Your message was captured locally. (Backend not configured.)</div>';
          }
          form.reset();
        }, 800);
        return;
      }

      fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function () {
          if (response) {
            response.innerHTML = '<div class="alert alert--success"><i class="fas fa-circle-check"></i> Thank you! Your message has been sent. We will contact you shortly.</div>';
          }
          form.reset();
          setTimeout(function () { if (response) response.innerHTML = ""; }, 15000);
        })
        .catch(function () {
          if (response) {
            response.innerHTML = '<div class="alert alert--error"><i class="fas fa-triangle-exclamation"></i> Something went wrong. Please try again or contact us on WhatsApp.</div>';
          }
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
