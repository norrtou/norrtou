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
     Adds .loaded immediately — no setTimeout delay.
     hero-desc is the LCP element and must not be held back.
     CSS transitions still run, they just start right away.
  ───────────────────────────────────────────────────────── */
  function initHero() {
    var headline = document.getElementById('hero-headline');
    var sub      = document.getElementById('hero-sub');
    var desc     = document.getElementById('hero-desc');
    var actions  = document.getElementById('hero-actions');

    if (!headline) return;

    if (headline) headline.classList.add('loaded');
    if (sub)      sub.classList.add('loaded');
    if (desc)     desc.classList.add('loaded');
    if (actions)  actions.classList.add('loaded');
  }


  /* ─────────────────────────────────────────────────────────
     2. Navigation Scroll Behaviour
     Initial state check deferred to rAF to avoid forced
     reflow at page load.
  ───────────────────────────────────────────────────────── */
  function initNav() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;

    var threshold = 80;
    var ticking = false;

    function updateNav() {
      nav.classList.toggle('scrolled', window.pageYOffset > threshold);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    }

    requestAnimationFrame(updateNav);
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
     3. Mobile Menu Toggle
  ───────────────────────────────────────────────────────── */
  function initMobileMenu() {
    var hamburger  = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');

    if (!hamburger || !mobileMenu) return;

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
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

    var menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }


  /* ─────────────────────────────────────────────────────────
     4. Scroll-Reveal (IntersectionObserver)
  ───────────────────────────────────────────────────────── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      var els = document.querySelectorAll('.r');
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
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
     Batch reads before writes to avoid repeated reflows.
  ───────────────────────────────────────────────────────── */
  function initActiveNav() {
    var links = document.querySelectorAll('.nav-links a, .mobile-menu-links a');
    var path  = window.location.pathname;

    // Read all hrefs first
    var resolved = [];
    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var a = document.createElement('a');
      a.href = href;
      resolved.push(a.pathname);
    });

    // Then write in one pass
    links.forEach(function (link, i) {
      var r = resolved[i];
      if (
        r === path ||
        (r !== '/' && path.indexOf(r.replace(/index\.html$/, '')) === 0)
      ) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     6. Contact Form Feedback
  ───────────────────────────────────────────────────────── */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      var actionUrl = form.getAttribute('action');

      if (!actionUrl || actionUrl === '#') {
        e.preventDefault();
        var note = form.querySelector('.form-note');
        if (note) {
          note.textContent = 'Obs: Koppla formuläret till Formspree eller liknande tjänst.';
          note.style.color = 'var(--olive-l)';
        }
        return;
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     Init
  ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initNav();
    initMobileMenu();
    initReveal();
    initActiveNav();
    initForm();
  });

})();
