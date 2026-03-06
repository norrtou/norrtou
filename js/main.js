/**
 * norrtou CREATIONS — main.js
 * Creative Studio & Narrative Engineering
 * https://norrtou.se
 *
 * Modules (no build tools required — vanilla ES5-compatible):
 *   1. Hero entrance animation
 *   2. Navigation scroll behaviour
 *   3. Mobile menu toggle
 *   4. Scroll-reveal (IntersectionObserver)
 *   5. Active nav-link highlighting
 *   6. Contact form feedback (static sites)
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     1. Hero Entrance Animation
     Triggers CSS transitions by adding .loaded classes after
     fonts have had a frame to render.
  ───────────────────────────────────────────────────────── */
  function initHero() {
    var headline = document.getElementById('hero-headline');
    var sub      = document.getElementById('hero-sub');
    var desc     = document.getElementById('hero-desc');
    var actions  = document.getElementById('hero-actions');

    if (!headline) return; // not on a hero page

    // rAF gives fonts a moment to swap in before transition runs
    requestAnimationFrame(function () {
      setTimeout(function () {
        if (headline) headline.classList.add('loaded');
        if (sub)      sub.classList.add('loaded');
        if (desc)     desc.classList.add('loaded');
        if (actions)  actions.classList.add('loaded');
      }, 60);
    });
  }


  /* ─────────────────────────────────────────────────────────
     2. Navigation Scroll Behaviour
     Adds .scrolled to <nav> when page is scrolled past
     threshold, enabling the frosted-glass background.
  ───────────────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;

    var threshold = 80;

    function onScroll() {
      nav.classList.toggle('scrolled', window.pageYOffset > threshold);
    }

    // Set initial state (e.g. page loaded mid-scroll)
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
     3. Mobile Menu Toggle
     Toggles the full-screen overlay menu and manages
     aria-expanded + body scroll lock.
  ───────────────────────────────────────────────────────── */
  function initMobileMenu() {
    var hamburger  = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');

    if (!hamburger || !mobileMenu) return;

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden'; // prevent background scroll
    }

    function closeMenu() {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close when a nav link is clicked
    var menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }


  /* ─────────────────────────────────────────────────────────
     4. Scroll-Reveal (IntersectionObserver)
     Observes all elements with class .r and adds .in when
     they enter the viewport. Delays are set via CSS classes
     .d1 – .d5 so no JS timing logic needed here.
  ───────────────────────────────────────────────────────── */
  function initReveal() {
    // Guard for older browsers (though GitHub Pages users are
    // unlikely to be on very old environments)
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show everything immediately
      var els = document.querySelectorAll('.r');
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          // Unobserve after reveal — no need to keep watching
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    var revealEls = document.querySelectorAll('.r');
    revealEls.forEach(function (el) { observer.observe(el); });
  }


  /* ─────────────────────────────────────────────────────────
     5. Active Nav-Link Highlighting
     Marks the current page link with aria-current="page"
     by comparing href to the current URL path.
  ───────────────────────────────────────────────────────── */
  function initActiveNav() {
    var links = document.querySelectorAll('.nav-links a, .mobile-menu-links a');
    var path  = window.location.pathname;

    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      // Resolve relative hrefs to compare properly
      var resolved = new URL(href, window.location.href).pathname;

      // Exact match, or /services/ prefix match
      if (
        resolved === path ||
        (resolved !== '/' && path.indexOf(resolved.replace(/index\.html$/, '')) === 0)
      ) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     6. Contact Form Feedback
     For static GitHub Pages deployments, the form action
     should point to a service like Formspree. This provides
     graceful visual feedback for valid/invalid submissions.
  ───────────────────────────────────────────────────────── */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      var actionUrl = form.getAttribute('action');

      // If action is still placeholder ('#'), show a clear note
      if (!actionUrl || actionUrl === '#') {
        e.preventDefault();
        var note = form.querySelector('.form-note');
        if (note) {
          note.textContent = 'Obs: Koppla formuläret till Formspree eller liknande tjänst.';
          note.style.color = 'var(--olive-l)';
        }
        return;
      }

      // For real Formspree / Netlify Forms submissions via fetch
      // Uncomment and adapt if you want AJAX submission:
      /*
      e.preventDefault();
      var data = new FormData(form);
      fetch(actionUrl, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          form.innerHTML = '<p class="body-copy" style="color:var(--sage);">Tack! Jag återkommer så snart som möjligt.</p>';
        } else {
          throw new Error('Server error');
        }
      })
      .catch(function () {
        var note = form.querySelector('.form-note');
        if (note) note.textContent = 'Något gick fel. Försök igen eller kontakta direkt.';
      });
      */
    });
  }


  /* ─────────────────────────────────────────────────────────
     Init — run all modules on DOMContentLoaded
  ───────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initNav();
    initMobileMenu();
    initReveal();
    initActiveNav();
    initForm();
  });

})();
