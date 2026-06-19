(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".page-filter[data-filter-target]"));
    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-filter-target");
      var items = Array.prototype.slice.call(document.querySelectorAll(selector));
      input.addEventListener("input", function () {
        var value = normalize(input.value);
        items.forEach(function (item) {
          var haystack = normalize(item.getAttribute("data-title") + " " + item.getAttribute("data-tags") + " " + item.textContent);
          item.classList.toggle("is-filtered-out", value && haystack.indexOf(value) === -1);
        });
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function buildSearchCard(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\" data-tags=\"" + escapeHtml((item.tags || []).join(" ")) + "\">" +
      "<a href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<div class=\"poster-frame\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"year-pill\">" + escapeHtml(item.year) + "</span>" +
      "<span class=\"play-hover\">▶</span>" +
      "</div>" +
      "<div class=\"movie-card-body\">" +
      "<h3>" + escapeHtml(item.title) + "</h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"card-tags\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    var input = document.getElementById("searchInput");
    if (!results || !status || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    var value = normalize(query);
    if (!value) {
      var starter = window.SEARCH_ITEMS.slice(0, 24);
      results.innerHTML = starter.map(buildSearchCard).join("");
      status.textContent = "浏览精选影片，或输入关键词搜索片库。";
      return;
    }
    var matched = window.SEARCH_ITEMS.filter(function (item) {
      var haystack = normalize([item.title, item.oneLine, item.region, item.type, item.year, (item.tags || []).join(" ")].join(" "));
      return haystack.indexOf(value) !== -1;
    }).slice(0, 120);
    results.innerHTML = matched.map(buildSearchCard).join("");
    status.textContent = matched.length ? "已找到相关影片" : "未找到相关影片";
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
