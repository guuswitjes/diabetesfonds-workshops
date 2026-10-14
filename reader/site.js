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

// Screenshots: klik om groot te zien, klik of Escape om te sluiten
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a.shot-link');
  if (!link) return;
  e.preventDefault();
  var box = document.createElement('div');
  box.className = 'shot-zoom';
  var img = document.createElement('img');
  img.src = link.getAttribute('href');
  img.alt = (link.querySelector('img') || {}).alt || '';
  box.appendChild(img);
  function close() { box.remove(); document.removeEventListener('keydown', onKey); }
  function onKey(ev) { if (ev.key === 'Escape') close(); }
  box.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(box);
});

// Voorbeelden (quiz) openen in een pop-up op de pagina. Sluiten met het kruisje, Escape of een klik naast het venster.
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a.pop-open');
  if (!link) return;
  e.preventDefault();
  var overlay = document.createElement('div');
  overlay.className = 'pop-overlay';
  var box = document.createElement('div');
  box.className = 'pop-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', link.getAttribute('data-pop-title') || '');
  var btn = document.createElement('button');
  btn.className = 'pop-close';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Sluiten');
  btn.textContent = '×';
  var frame = document.createElement('iframe');
  frame.src = link.getAttribute('href');
  frame.title = link.getAttribute('data-pop-title') || '';
  box.appendChild(btn);
  box.appendChild(frame);
  overlay.appendChild(box);
  var prev = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  function close() { overlay.remove(); document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); window.removeEventListener('message', onMsg); link.focus(); }
  function onKey(ev) { if (ev.key === 'Escape') close(); }
  btn.addEventListener('click', close);
  overlay.addEventListener('click', function (ev) { if (ev.target === overlay) close(); });
  function onMsg(ev) { if (ev.source === frame.contentWindow && ev.data === 'pop-close') close(); }
  window.addEventListener('message', onMsg);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
  frame.addEventListener('load', function () { try { frame.contentWindow.focus(); } catch (err) {} });
});
