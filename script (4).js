document.addEventListener('DOMContentLoaded', function () {
  AOS.init({ duration: 700, once: true, offset: 60 });

  // Preloader
  window.addEventListener('load', function () {
    var pre = document.getElementById('hj-preloader');
    setTimeout(function () { pre.classList.add('hj-hide'); }, 400);
  });

  // Mobile nav toggle
  var toggle = document.getElementById('hjNavToggle');
  var links = document.getElementById('hjNavLinks');
  toggle.addEventListener('click', function () { links.classList.toggle('hj-open'); });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('hj-open'); });
  });

  // Animated ledger counters
  var counters = document.querySelectorAll('.hj-counter');
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var current = 0;
        var step = Math.max(1, Math.ceil(target / 100));
        var duration = 1600;
        var stepTime = Math.max(12, Math.floor(duration / (target / step)));
        var timer = setInterval(function () {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = current.toLocaleString('en-US');
        }, stepTime);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(function (c) { counterObserver.observe(c); });

  // Cause progress bars
  var fills = document.querySelectorAll('.hj-route-fill');
  var fillObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.style.width = el.getAttribute('data-progress') + '%';
        fillObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(function (f) { fillObserver.observe(f); });

  // Scroll top button + nav shadow
  var scrollTop = document.getElementById('hj-scrolltop');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 420) { scrollTop.classList.add('hj-show'); }
    else { scrollTop.classList.remove('hj-show'); }
  });
  scrollTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  scrollTop.addEventListener('keypress', function (e) { if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Contact form (demo)
  var form = document.getElementById('hjContactForm');
  var status = document.getElementById('hjFormStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    status.innerHTML = '<div style="font-family:var(--hj-font-mono);font-size:.82rem;color:var(--hj-gold-deep);"><i class="bi bi-check-circle-fill me-1"></i>Message stamped &amp; sent — we\'ll reply within 24 hours.</div>';
    form.reset();
  });

  // Donate buttons -> scroll to causes (demo)
  ['hjHeroDonate', 'hjCtaDonate'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('causes').scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
});


// Scrollspy for the TOC
var clauses = document.querySelectorAll('.hj-clause');
if (clauses) {
  var tocLinks = document.querySelectorAll('#hjToc a');
  var tocObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        tocLinks.forEach(function (a) {
          a.classList.toggle('hj-active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  clauses.forEach(function (c) { tocObserver.observe(c); });
}


var searchInput = document.getElementById('hjFaqSearch');
if (searchInput) {
  // ---- FAQ accordion (single-open per group not enforced; independent toggles) ----
  document.querySelectorAll('.hj-faq-q').forEach(function (btn) {
    var answer = document.getElementById(btn.getAttribute('aria-controls'));
    if (btn.getAttribute('aria-expanded') !== 'true') { answer.style.display = 'none'; }
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      answer.style.display = expanded ? 'none' : 'block';
    });
  });

  // ---- Category filter chips ----
  var chips = document.querySelectorAll('.hj-faq-chip');
  var groups = document.querySelectorAll('.hj-faq-group');

  function applyFilter(filter) {
    groups.forEach(function (g) {
      g.style.display = (filter === 'all' || g.getAttribute('data-group') === filter) ? '' : 'none';
    });
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('hj-active'); });
      chip.classList.add('hj-active');
      document.getElementById('hjFaqSearch').value = '';
      applyFilter(chip.getAttribute('data-filter'));
      document.getElementById('hjFaqEmpty').classList.remove('hj-show');
      document.querySelectorAll('.hj-faq-item').forEach(function (item) { item.classList.remove('hj-hidden'); });
    });
  });

  // ---- Search across question + answer text ----

  var emptyState = document.getElementById('hjFaqEmpty');
  searchInput.addEventListener('input', function () {
    var q = searchInput.value.trim().toLowerCase();
    chips.forEach(function (c) { c.classList.remove('hj-active'); });
    document.querySelector('[data-filter="all"]').classList.add('hj-active');
    groups.forEach(function (g) { g.style.display = ''; });

    var anyVisible = false;
    groups.forEach(function (group) {
      var visibleInGroup = 0;
      group.querySelectorAll('.hj-faq-item').forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var match = q === '' || text.indexOf(q) !== -1;
        item.classList.toggle('hj-hidden', !match);
        if (match) { visibleInGroup++; anyVisible = true; }
      });
      group.style.display = visibleInGroup > 0 ? '' : 'none';
    });
    emptyState.classList.toggle('hj-show', !anyVisible);
  });

}



// Scrollspy for the mini in-page TOC
var sections = document.querySelectorAll('.hj-article-body h2[id]');
if (sections) {
  var tocLinks = document.querySelectorAll('#hjPostToc a');
  var tocObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        tocLinks.forEach(function (a) {
          a.classList.toggle('hj-active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(function (s) { tocObserver.observe(s); });
}


// Animate allocation bars on scroll into view
var fills = document.querySelectorAll('.hj-alloc-fill');
if (fills) {
  var fillObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        el.style.width = el.getAttribute('data-progress') + '%';
        fillObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(function (f) { fillObserver.observe(f); });
}



