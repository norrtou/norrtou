/**
 * norrtou CREATIONS — github.js
 * Hämtar publika GitHub-repositories i realtid och renderar dem som kort.
 * Inget bygg-steg, inga nycklar — körs direkt i webbläsaren på GitHub Pages.
 *
 * ─────────────────────────────────────────────────────────────
 *  REDIGERA HÄR — det här är allt du normalt behöver röra:
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  var CONFIG = {
    /* Ditt GitHub-användarnamn */
    username: 'norrtou',

    /* Repos som INTE ska visas (t.ex. själva webbplatsen). Skiftlägesokänsligt. */
    hide: ['norrtou'],

    /* Visa endast forkade repos? Standard: dölj forkar. */
    includeForks: false,

    /*
     * Egen text per repo. Skriv repo-namnet som nyckel.
     * 'title'  – snyggare visningsnamn (valfritt; annars repo-namnet)
     * 'desc'   – din egen beskrivning (vinner över GitHubs egen text)
     * 'demo'   – länk till appen/sidan (valfritt; annars repots Pages-sida om den finns)
     * 'image'  – sökväg till skärmdump som visas överst på kortet, t.ex. '/img/namn.webp' (valfritt)
     *
     * Lägg till nya rader efter behov — repos utan egen text använder
     * automatiskt GitHubs beskrivning.
     */
    descriptions: {
      'norrtounia': {
        title: 'Norrtounia — The Dark Forest',
        desc: 'Ett textbaserat retro-dungeon crawler i en mörk fantasyvärld. Träd in i Norrtounias förbannade skog, där skuggor vandrar – överlever du?',
        image: '/img/norrtounia.webp'
      },
      'snake': {
        title: 'Snake (WebAssembly)',
        desc: 'En klassisk Snake byggd som experiment i WebAssembly – ett test av prestandakrävande spel-logik direkt i webbläsaren.'
      },
      'anatomiquiz': {
        title: 'Anatomiquiz',
        desc: 'Gratis interaktiv anatomiquiz på svenska – skelett, muskler, neurologi och medicinsk terminologi. Med quiz och flashcards för studenter inom vård och medicin.',
        demo: 'https://anatomiquiz.se',
        image: '/img/anatomiquiz.webp'
      },
      'leonoria': {
        title: 'Leonoria',
        desc: 'En levande fantasyvärld för bordsrollspel: utforska procedurellt genererade världar, skapa kartor och karaktärer och väv dina egna legender.',
        image: '/img/leonoria.webp'
      },
      'hand': {
        title: 'Hands',
        desc: 'Allt om den mänskliga handen – anatomi, fysiologi, hälsa och träning, samlat i en app.',
        image: '/img/hands.webp'
      },
      'smallsteps': {
        title: 'Small Steps',
        desc: 'En webbapp som hjälper dig bryta ner till synes stora uppgifter i små, hanterbara steg.',
        image: '/img/smallsteps.webp'
      },
      'activitydiary': {
        title: 'Activity Diary',
        desc: 'En enkel aktivitetsdagbok, användbar inom arbetsterapi och rehabilitering.',
        image: '/img/activitydiary.webp'
      }
    },

    /* Fallback-text för repos som varken har egen eller GitHub-beskrivning */
    fallbackDesc: 'Ett projekt under utveckling — mer information kommer.',

    /* Hur länge svaret från GitHub sparas i webbläsaren (minuter).
       Inom den tiden laddas projekten direkt utan nytt API-anrop.
       Sätt till 0 för att stänga av cachning. */
    cacheMinutes: 60
  };
  /* ──────────────────────── slut på redigerbar del ─────────── */


  var GH_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12C24 5.37 18.63 0 12 0z"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function prettify(name) {
    return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  function timeAgo(iso) {
    if (!iso) return '';
    var then = new Date(iso).getTime();
    var days = Math.floor((Date.now() - then) / 86400000);
    if (days < 1)   return 'idag';
    if (days < 2)   return 'igår';
    if (days < 30)  return days + ' dagar sedan';
    if (days < 60)  return '1 månad sedan';
    if (days < 365) return Math.floor(days / 30) + ' månader sedan';
    var y = Math.floor(days / 365);
    return y + (y === 1 ? ' år sedan' : ' år sedan');
  }

  function skeleton(grid, n) {
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<div class="repo-card skeleton" aria-hidden="true">' +
              '<div class="sk sk-title"></div>' +
              '<div class="sk sk-line"></div>' +
              '<div class="sk sk-line"></div>' +
              '<div class="sk sk-line short"></div></div>';
    }
    grid.innerHTML = html;
  }

  function cardHTML(repo) {
    var ov = CONFIG.descriptions[repo.name] || CONFIG.descriptions[repo.name.toLowerCase()] || {};
    var title = ov.title || prettify(repo.name);
    var desc  = ov.desc  || repo.description || CONFIG.fallbackDesc;
    var demo  = ov.demo
      || (repo.homepage && repo.homepage.trim() ? repo.homepage.trim() : null)
      || (repo.has_pages ? 'https://' + CONFIG.username + '.github.io/' + repo.name + '/' : null);

    var meta = [];
    if (repo.language) {
      meta.push('<span class="repo-lang"><span class="lang-dot"></span>' + esc(repo.language) + '</span>');
    }
    if (repo.stargazers_count > 0) meta.push('<span>★ ' + repo.stargazers_count + '</span>');
    if (repo.pushed_at) meta.push('<span>Uppd. ' + esc(timeAgo(repo.pushed_at)) + '</span>');

    var links = '<a href="' + esc(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' + GH_ICON + ' Kod</a>';
    if (demo) {
      links += '<a href="' + esc(demo) + '" target="_blank" rel="noopener noreferrer">↗ Testa appen</a>';
    }

    var media = '';
    if (ov.image) {
      var mhref = demo || repo.html_url;
      media = '<a class="repo-media" href="' + esc(mhref) + '" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">' +
                '<img src="' + esc(ov.image) + '" alt="Skärmbild av ' + esc(title) + '" loading="lazy" decoding="async">' +
              '</a>';
    }

    return '<article class="repo-card r' + (ov.image ? ' has-media' : '') + '">' +
             media +
             '<div class="repo-top"><span class="repo-ico">' + GH_ICON + '</span>' +
               '<h3>' + esc(title) + '</h3></div>' +
             '<p class="repo-desc">' + esc(desc) + '</p>' +
             (meta.length ? '<div class="repo-meta">' + meta.join('') + '</div>' : '') +
             '<div class="repo-links">' + links + '</div>' +
           '</article>';
  }

  function render(grid, repos, limit) {
    var hide = CONFIG.hide.map(function (h) { return h.toLowerCase(); });

    var list = repos.filter(function (r) {
      if (!CONFIG.includeForks && r.fork) return false;
      if (r.archived || r.private) return false;
      return hide.indexOf(r.name.toLowerCase()) === -1;
    });

    /* Projekt med skärmbild först, utan skärmbild sist —
       inom varje grupp senast uppdaterade först */
    function hasImage(r) {
      var ov = CONFIG.descriptions[r.name] || CONFIG.descriptions[r.name.toLowerCase()] || {};
      return ov.image ? 1 : 0;
    }
    list.sort(function (a, b) {
      var img = hasImage(b) - hasImage(a);
      if (img !== 0) return img;
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });

    if (limit && limit > 0) list = list.slice(0, limit);

    if (!list.length) {
      grid.innerHTML = '<p class="repo-status">Inga projekt att visa just nu. ' +
        'Se allt på <a href="https://github.com/' + esc(CONFIG.username) + '" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>';
      return;
    }

    grid.innerHTML = list.map(cardHTML).join('');

    /* Koppla in scroll-reveal om observern finns (main.js exponerar den) */
    if (window.norrtouObserve) {
      grid.querySelectorAll('.r').forEach(window.norrtouObserve);
    } else {
      grid.querySelectorAll('.r').forEach(function (el) { el.classList.add('in'); });
    }
  }

  function fail(grid) {
    grid.innerHTML = '<p class="repo-status">Kunde inte hämta projekt från GitHub just nu. ' +
      'Se allt direkt på <a href="https://github.com/' + esc(CONFIG.username) +
      '" target="_blank" rel="noopener noreferrer">github.com/' + esc(CONFIG.username) + '</a>.</p>';
  }

  /* ── localStorage-cache ─────────────────────────────────────
     Sparar GitHub-svaret per användarnamn så att återkommande
     besökare laddar projekten direkt, utan nytt API-anrop. */
  var CACHE_KEY = 'norrtou_repos_v2_' + CONFIG.username;

  function readCache() {
    if (!CONFIG.cacheMinutes) return null;
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.data)) return null;
      var ageMs = Date.now() - obj.t;
      return { data: obj.data, fresh: ageMs < CONFIG.cacheMinutes * 60000 };
    } catch (e) { return null; }
  }

  function writeCache(data) {
    if (!CONFIG.cacheMinutes) return;
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: data }));
    } catch (e) { /* full eller avstängd lagring — ignoreras */ }
  }

  /* Behåll bara fälten vi använder, så cachen hålls liten */
  function slim(repos) {
    return repos.map(function (r) {
      return {
        name: r.name, description: r.description, homepage: r.homepage,
        html_url: r.html_url, language: r.language, has_pages: r.has_pages,
        stargazers_count: r.stargazers_count, pushed_at: r.pushed_at,
        fork: r.fork, archived: r.archived, private: r.private
      };
    });
  }

  function init() {
    var grid = document.getElementById('repo-grid');
    if (!grid) return;

    var limit = parseInt(grid.getAttribute('data-limit'), 10) || 0;

    /* Färsk cache → rendera direkt, inget anrop */
    var cached = readCache();
    if (cached && cached.fresh) {
      render(grid, cached.data, limit);
      return;
    }

    skeleton(grid, limit || 4);

    fetch('https://api.github.com/users/' + CONFIG.username + '/repos?per_page=100&sort=pushed', {
      headers: { 'Accept': 'application/vnd.github+json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
      })
      .then(function (repos) {
        if (!Array.isArray(repos)) throw new Error('Oväntat svar');
        var data = slim(repos);
        writeCache(data);
        render(grid, data, limit);
      })
      .catch(function () {
        /* Hämtning misslyckades — visa gammal cache hellre än felruta */
        if (cached && cached.data.length) {
          render(grid, cached.data, limit);
        } else {
          fail(grid);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
