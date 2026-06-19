(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('.filter-input');
    var filterYear = document.querySelector('.filter-year');
    var filterType = document.querySelector('.filter-type');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(filterInput ? filterInput.value : '');
        var year = filterYear ? filterYear.value : '';
        var type = filterType ? filterType.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.tags,
                card.textContent
            ].join(' '));
            var ok = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                ok = false;
            }
            if (year && card.dataset.year !== year) {
                ok = false;
            }
            if (type && card.dataset.type !== type) {
                ok = false;
            }

            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        document.body.classList.toggle('has-no-results', visible === 0);
    }

    if (filterInput || filterYear || filterType) {
        [filterInput, filterYear, filterType].forEach(function (node) {
            if (node) {
                node.addEventListener('input', runFilter);
                node.addEventListener('change', runFilter);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && filterInput) {
            filterInput.value = query;
        }
        runFilter();
    }
}());
