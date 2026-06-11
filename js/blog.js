/**
 * norrtou CREATIONS — blog.js
 * Renderar nyhetslistan från /blog/posts.json.
 * Inget bygg-steg: lägg upp en nyhet genom att
 *   1. kopiera /blog/_template.html till /blog/<slug>.html och fylla i
 *   2. lägga till inlägget överst i /blog/posts.json
 *   3. (valfritt) lägga till URL:en i sitemap.xml
 *
 * Element som fylls i automatiskt:
 *   #news-grid  (startsidan, data-limit styr antal)
 *   #blog-grid  (bloggsidan, visar alla)
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
                'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return esc(iso);
    return parseInt(m[3], 10) + ' ' + MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1];
  }

  function cardHTML(post, headingTag) {
    var url = '/blog/' + encodeURIComponent(post.slug) + '.html';
    return '<article class="post-card r">' +
             '<div class="post-meta">' +
               '<time class="post-date" datetime="' + esc(post.date) + '">' + fmtDate(post.date) + '</time>' +
               (post.tag ? '<span class="post-tag">' + esc(post.tag) + '</span>' : '') +
             '</div>' +
             '<' + headingTag + '><a href="' + url + '">' + esc(post.title) + '</a></' + headingTag + '>' +
             '<p class="post-excerpt">' + esc(post.excerpt) + '</p>' +
             '<a class="post-more" href="' + url + '" aria-label="Läs hela: ' + esc(post.title) + '">Läs hela →</a>' +
           '</article>';
  }

  function render(grid, posts) {
    var limit = parseInt(grid.getAttribute('data-limit'), 10) || 0;
    var headingTag = grid.getAttribute('data-heading') || 'h3';
    var list = limit > 0 ? posts.slice(0, limit) : posts;

    if (!list.length) {
      grid.innerHTML = '<p class="repo-status">Inga nyheter ännu — men det kommer.</p>';
      return;
    }

    grid.innerHTML = list.map(function (p) { return cardHTML(p, headingTag); }).join('');

    if (window.norrtouObserve) {
      grid.querySelectorAll('.r').forEach(window.norrtouObserve);
    } else {
      grid.querySelectorAll('.r').forEach(function (el) { el.classList.add('in'); });
    }
  }

  function init() {
    var grids = [];
    var news = document.getElementById('news-grid');
    var blog = document.getElementById('blog-grid');
    if (news) grids.push(news);
    if (blog) grids.push(blog);
    if (!grids.length) return;

    fetch('/blog/posts.json', { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('posts.json ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var posts = (data && Array.isArray(data.posts)) ? data.posts : [];
        grids.forEach(function (g) { render(g, posts); });
      })
      .catch(function () {
        grids.forEach(function (g) {
          g.innerHTML = '<p class="repo-status">Kunde inte ladda nyheterna just nu. ' +
            'Prova att <a href="/blog/index.html">öppna nyhetssidan</a> igen om en stund.</p>';
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
