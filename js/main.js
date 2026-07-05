/**
 * NORRTOU CREATIONS — main.js
 * Interaktioner för norrtou.se. Vanilla JS, inget byggsteg.
 *
 *   1. Nav-entré (naven glider ner; CSS pausar animationen tills .nav--ready)
 *   2. Helskärmsmeny (naven byter från mix-blend-mode:difference till normal
 *      medan menyn är öppen — annars blendas den mörka overlayen sönder)
 *   3. Scrollstyrda reveals via IntersectionObserver
 *      (window.norrtouObserve exponeras åt github.js och blog.js)
 *   4. Hero-parallax
 *   5. Kontaktformulär (Formspree via fetch, feedback i .form-note)
 */

(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Nav-entré ─────────────────────────────────────── */
  var nav = document.getElementById('site-nav');
  if (nav) {
    requestAnimationFrame(function () { nav.classList.add('nav--ready'); });
  }

  /* ── 2. Helskärmsmeny ─────────────────────────────────── */
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  if (nav && menuBtn && mobileMenu) {
    var menuLabel = menuBtn.querySelector('.nav-menu-label');

    var setMenu = function (open) {
      nav.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
      if (menuLabel) menuLabel.textContent = open ? 'Stäng' : 'Meny';
      document.body.style.overflow = open ? 'hidden' : '';
    };

    menuBtn.addEventListener('click', function () {
      setMenu(!nav.classList.contains('menu-open'));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('menu-open')) setMenu(false);
    });
  }

  /* ── 3. Scrollstyrda reveals ──────────────────────────── */
  var revealClass = function (el) {
    return el.classList.contains('r') ? 'in' : 'visible';
  };

  var observer = null;
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add(revealClass(entry.target));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
  }

  function observe(el) {
    if (observer) observer.observe(el);
    else el.classList.add(revealClass(el));
  }

  /* github.js och blog.js kopplar in sina kort via den här */
  window.norrtouObserve = observe;

  document.querySelectorAll('.reveal, .heading-reveal, .r').forEach(observe);

  /* ── 4. Hero-parallax ─────────────────────────────────── */
  var heroImg = document.getElementById('hero-img');
  if (heroImg && !prefersReducedMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var drift = Math.min(window.scrollY * 0.08, 120);
        heroImg.style.transform = 'scale(1.08) translateY(' + drift + 'px)';
        ticking = false;
      });
    });
  }

  /* ── 5. Kontaktformulär ───────────────────────────────── */
  var form = document.getElementById('contact-form');
  if (form && window.fetch) {
    var note = form.querySelector('.form-note');
    var setNote = function (msg) { if (note) note.textContent = msg; };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setNote('Skickar …');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            setNote('Tack! Ditt meddelande är skickat — jag hör av mig snart.');
          } else {
            setNote('Något gick fel. Prova igen, eller hör av dig via LinkedIn.');
          }
        })
        .catch(function () {
          setNote('Något gick fel. Prova igen, eller hör av dig via LinkedIn.');
        });
    });
  }
})();
