(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));

    searchInputs.forEach(function (input) {
      var section = input.closest("section");
      var area = document.querySelector("[data-search-area]");
      var buttons = section ? Array.prototype.slice.call(section.querySelectorAll("[data-filter]")) : [];
      var filterValue = "";

      function applyFilter() {
        var query = input.value.trim().toLowerCase();
        var cards = area ? Array.prototype.slice.call(area.querySelectorAll("[data-card]")) : [];

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" ").toLowerCase();
          var queryMatched = !query || text.indexOf(query) !== -1;
          var filterMatched = !filterValue || text.indexOf(filterValue.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(queryMatched && filterMatched));
        });
      }

      input.addEventListener("input", applyFilter);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          filterValue = button.getAttribute("data-filter") || "";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilter();
        });
      });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var src = player.getAttribute("data-video-src");
      var loaded = false;
      var hlsInstance = null;

      function load() {
        if (!video || !src || loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function start() {
        load();
        if (video) {
          var result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-playing");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
