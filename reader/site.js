    // Kopieerknoppen
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pre = btn.parentElement.querySelector('pre');
        if (!pre) return;
        var text = pre.innerText;
        var done = function () {
          btn.textContent = 'Gekopieerd';
          btn.classList.add('done');
          setTimeout(function () { btn.textContent = 'Kopieer'; btn.classList.remove('done'); }, 1800);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
        } else {
          fallback(text); done();
        }
      });
    });
    function fallback(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }

    // Uitklapblok openen als een link ernaar verwijst
    function openTarget() {
      if (!location.hash) return;
      var el = document.querySelector(location.hash);
      if (el && el.tagName === 'DETAILS') { el.open = true; }
    }
    window.addEventListener('hashchange', openTarget);
    openTarget();

    // Menu op mobiel
    var toggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    toggle.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    sidebar.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented) return;
      sidebar.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });

    // Zijbalk: groepen in- en uitklappen
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-group]'));
    function setOpen(group, open) {
      var btn = group.querySelector('.nav-caret');
      var list = group.querySelector('.nav-sub');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      list.hidden = !open;
    }
    groups.forEach(function (g) {
      g.querySelector('.nav-caret').addEventListener('click', function () {
        setOpen(g, g.querySelector('.nav-sub').hidden);
      });
      // Klik op de tekst van de huidige groep klapt in en uit, net als het pijltje
      g.querySelector('.nav-link.head').addEventListener('click', function (e) {
        if (!g.classList.contains('current')) return;
        e.preventDefault();
        setOpen(g, g.querySelector('.nav-sub').hidden);
      });
    });
    groups.forEach(function (g) { setOpen(g, g.classList.contains('current')); });

    // Actieve link in de zijbalk (alleen links naar deze pagina), en de groep eromheen open
    var here = location.pathname.split('/').pop() || 'index.html';
    var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar .nav-link'));
    var pairs = links.map(function (l) {
      var href = l.getAttribute('href');
      var parts = href.split('#');
      if ((parts[0] || 'index.html') !== here || !parts[1]) return null;
      return { link: l, target: document.getElementById(parts[1]) };
    }).filter(function (p) { return p && p.target; });
    var current = null;
    function spy() {
      var line = window.innerHeight * 0.3;
      var hit = null;
      pairs.forEach(function (p) {
        if (p.target.getBoundingClientRect().top <= line) { hit = p; }
      });
      if (hit === current) return;
      current = hit;
      pairs.forEach(function (p) { p.link.classList.remove('active'); });
      if (hit) hit.link.classList.add('active');
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; spy(); });
    }, { passive: true });
    spy();
