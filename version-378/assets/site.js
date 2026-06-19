(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                schedule();
            });
        });

        show(0);
        schedule();
    }

    function setupFilters() {
        var list = document.querySelector("[data-card-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var textInput = document.querySelector("[data-card-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var counter = document.querySelector("[data-filter-count]");
        var querySync = document.querySelector("[data-query-sync]");

        if (querySync) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            querySync.value = query;
        }

        function applyFilters() {
            var text = normalize(textInput && textInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;

                if (text && haystack.indexOf(text) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = visible + " 部";
            }
        }

        [textInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute("data-src");
            var hlsInstance = null;

            function play() {
                if (!source) {
                    return;
                }
                player.classList.add("is-playing");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.src) {
                        video.src = source;
                    }
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsInstance) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    return;
                }

                if (!video.src) {
                    video.src = source;
                }
                video.play().catch(function () {});
            }

            button.addEventListener("click", play);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
        });
    }

    function setupImageFallback() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
                image.parentElement && image.parentElement.classList.add("image-missing");
            }, { once: true });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
        setupImageFallback();
    });
})();
