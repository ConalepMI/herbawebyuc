
document.addEventListener('DOMContentLoaded', function () {

    /* ---------- AOS INIT ---------- */
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });

    /* ---------- PRELOADER ---------- */
    var preloader = document.getElementById('preloader');
    window.addEventListener('load', function () {
        setTimeout(function () { preloader.classList.add('hide'); }, 400);
    });
    // fallback in case load already fired
    setTimeout(function () { preloader.classList.add('hide'); }, 2500);

    /* ---------- SCROLL TO TOP + PROGRESS RING (set up first so onScroll can use it) ---------- */
    var scrollTopBtn = document.getElementById('scrollTop');
    var progressCircle = scrollTopBtn.querySelector('.progress');
    var radius = 23;
    var circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;

    function updateScrollProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? scrollTop / docHeight : 0;
        progressCircle.style.strokeDashoffset = circumference - pct * circumference;
        if (scrollTop > 400) scrollTopBtn.classList.add('show');
        else scrollTopBtn.classList.remove('show');
    }
    function scrollToTopHandler() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    scrollTopBtn.addEventListener('click', scrollToTopHandler);
    scrollTopBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToTopHandler(); }
    });

    /* ---------- NAVBAR SCROLL STATE ---------- */
    var nav = document.getElementById('mainNav');
    function onScroll() {
        if (window.scrollY > 40) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        updateScrollProgress();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* collapse mobile menu after clicking a link */
    document.querySelectorAll('#navMenu .nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            var collapseEl = document.getElementById('navMenu');
            var bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
            if (bsCollapse) bsCollapse.hide();
        });
    });

    /* ---------- ANIMATED COUNTERS ---------- */
    var counters = document.querySelectorAll('.counter');
    var counted = new WeakSet();
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1800;
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var value = Math.floor(eased * target);
            el.textContent = value.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
    }
    var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !counted.has(entry.target)) {
                counted.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { counterObserver.observe(c); });

    /* ---------- CAUSE PROGRESS BARS ---------- */
    var progressBars = document.querySelectorAll('.cause-progress-fill');
    var progressObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                el.style.width = el.getAttribute('data-progress') + '%';
                progressObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });
    progressBars.forEach(function (bar) { progressObserver.observe(bar); });

    /* ---------- MOUSE-FOLLOW GLOW IN HERO ---------- */
    var heroGlow = document.querySelector('.hero-glow');
    var heroSection = document.querySelector('.hero');
    if (heroSection && window.matchMedia('(pointer:fine)').matches) {
        heroSection.addEventListener('mousemove', function (e) {
            var rect = heroSection.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            heroGlow.style.transform = 'translate(' + (x - 260) * 0.15 + 'px,' + (y - 260) * 0.15 + 'px)';
        });
    }

    /* ---------- CONFETTI BURST (demo only) ---------- */
    function burstConfetti(originEl) {
        var colors = ['#16A34A', '#F59E0B', '#EF4444', '#22c55e', '#FBBF24'];
        var rect = originEl.getBoundingClientRect();
        for (var i = 0; i < 26; i++) {
            var piece = document.createElement('span');
            piece.className = 'confetti-piece';
            var size = 6 + Math.random() * 6;
            piece.style.width = size + 'px';
            piece.style.height = (size * 0.4) + 'px';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.left = (rect.left + rect.width / 2) + 'px';
            piece.style.top = (rect.top) + 'px';
            var angle = Math.random() * Math.PI - Math.PI / 2;
            var velocity = 4 + Math.random() * 5;
            var vx = Math.cos(angle) * velocity * 18;
            var vy = -Math.abs(Math.sin(angle) * velocity) * 22 - 40;
            var rotation = Math.random() * 720 - 360;
            document.body.appendChild(piece);
            piece.animate([
                { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                { transform: 'translate(' + vx + 'px,' + (vy + 260) + 'px) rotate(' + rotation + 'deg)', opacity: 0 }
            ], { duration: 1100 + Math.random() * 400, easing: 'cubic-bezier(.22,.61,.36,1)' });
            (function (p) { setTimeout(function () { p.remove(); }, 1600); })(piece);
        }
    }
    ['heroDonateBtn', 'ctaDonateBtn'].forEach(function (id) {
        var btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', function (e) {
            if (btn.tagName === 'BUTTON') e.preventDefault();
            burstConfetti(btn);
        });
    });
    document.querySelectorAll('.cause-donate').forEach(function (btn) {
        btn.addEventListener('click', function () { burstConfetti(btn); });
    });

    /* ---------- CONTACT FORM (demo submit) ---------- */
    var form = document.getElementById('contactForm');
    var status = document.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        status.innerHTML = '<div class="alert alert-success mt-2 mb-0" style="border-radius:12px;"><i class="bi bi-check-circle-fill me-2"></i>Thanks! Your message has been sent.</div>';
        form.reset();
        form.classList.remove('was-validated');
    });

});


/* ---------- FAQ SEARCH + CATEGORY FILTER ---------- */
var searchInput = document.getElementById('faqSearch');
if (searchInput) {
    var clearBtn = document.getElementById('faqClear');
    var catButtons = document.querySelectorAll('.faq-cat-btn');
    var faqItems = document.querySelectorAll('.faq-item');
    var faqGroups = document.querySelectorAll('.faq-group');
    var emptyState = document.getElementById('faqEmpty');
    var activeCat = 'all';

    function applyFilters() {
        var term = searchInput.value.trim().toLowerCase();
        clearBtn.classList.toggle('show', term.length > 0);
        var anyVisible = false;

        faqItems.forEach(function (item) {
            var matchesCat = activeCat === 'all' || item.getAttribute('data-cat') === activeCat;
            var text = item.textContent.toLowerCase();
            var matchesSearch = term === '' || text.indexOf(term) !== -1;
            var visible = matchesCat && matchesSearch;
            item.setAttribute('data-hidden', visible ? 'false' : 'true');
            if (visible) anyVisible = true;
        });

        faqGroups.forEach(function (group) {
            var visibleItems = group.querySelectorAll('.faq-item[data-hidden="false"]');
            group.style.display = visibleItems.length > 0 ? '' : 'none';
        });

        emptyState.classList.toggle('show', !anyVisible);
    }

    searchInput.addEventListener('input', applyFilters);
    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        applyFilters();
        searchInput.focus();
    });

    catButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            catButtons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            activeCat = btn.getAttribute('data-cat');
            applyFilters();
        });
    });

}



/* ---------- TOC SCROLLSPY ---------- */
var tocLinks = document.querySelectorAll('#policyToc a');
if (tocLinks) {
    var sections = Array.from(tocLinks).map(function (link) {
        return document.getElementById(link.getAttribute('href').substring(1));
    }).filter(Boolean);

    function updateTocActive() {
        var scrollPos = window.scrollY + 140;
        var current = sections[0];
        sections.forEach(function (sec) {
            if (sec.offsetTop <= scrollPos) current = sec;
        });
        tocLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
        });
    }
    window.addEventListener('scroll', updateTocActive, { passive: true });
    updateTocActive();

    tocLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.getElementById(link.getAttribute('href').substring(1));
            if (target) window.scrollTo({ top: target.offsetTop - 96, behavior: 'smooth' });
        });
    });
}

/* ---------- REPORT DOWNLOAD (demo) ---------- */
var reportStatus = document.getElementById('reportStatus');
if (reportStatus) {
    document.querySelectorAll('.btn-report').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var name = btn.getAttribute('data-report');
            reportStatus.innerHTML = '<div class="alert alert-success d-inline-flex align-items-center gap-2 mb-0" style="border-radius:12px;"><i class="bi bi-check-circle-fill"></i>' + name + ' is ready &mdash; connect a file host to enable live downloads.</div>';
        });
    });
}
