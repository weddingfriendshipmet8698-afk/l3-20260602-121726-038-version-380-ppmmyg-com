(function () {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        const prev = hero.querySelector('.hero-prev');
        const next = hero.querySelector('.hero-next');
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        const restart = function () {
            window.clearInterval(timer);
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.slide || 0));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        start();
    }

    const searchInput = document.querySelector('#movie-search-input');
    const searchCards = Array.from(document.querySelectorAll('#search-results .movie-card'));
    const searchStatus = document.querySelector('#movie-search-status');

    if (searchInput && searchCards.length) {
        const params = new URLSearchParams(window.location.search);
        const initialValue = params.get('q') || '';
        searchInput.value = initialValue;

        const filterCards = function () {
            const value = searchInput.value.trim().toLowerCase();
            let visible = 0;

            searchCards.forEach(function (card) {
                const haystack = (card.dataset.search || '').toLowerCase();
                const matched = !value || haystack.includes(value);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (searchStatus) {
                searchStatus.textContent = value ? '匹配到 ' + visible + ' 部影片' : '输入关键词后即可筛选片目';
            }
        };

        searchInput.addEventListener('input', filterCards);
        filterCards();
    }
})();
