(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var button = qs(".menu-toggle");
    var panel = qs(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        panel.classList.add("is-open");
      } else {
        panel.setAttribute("hidden", "");
        panel.classList.remove("is-open");
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function initHero() {
    var slides = qsa(".hero-slide");
    var dots = qsa(".hero-dot");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target")) || 0);
        start();
      });
    });

    var prev = qs(".hero-prev");
    var next = qs(".hero-next");
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
    show(0);
    start();
  }

  function initFilters() {
    qsa("[data-filter-scope]").forEach(function (scope) {
      var input = qs(".js-filter-input", scope);
      var year = qs(".js-year-filter", scope);
      var region = qs(".js-region-filter", scope);
      var cards = qsa(".js-card", scope);
      var count = qs("[data-filter-count]", scope);

      function run() {
        var keyword = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || normalize(card.getAttribute("data-year")) === selectedYear;
          var matchRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
          var matched = matchKeyword && matchYear && matchRegion;
          card.classList.toggle("is-hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible ? "筛选结果 " + visible + " 部" : "暂无匹配内容";
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", run);
          control.addEventListener("change", run);
        }
      });
      run();
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a href=\"./movies/" + escapeHTML(movie.file) + "\" aria-label=\"" + escapeHTML(movie.title) + "\">",
      "<div class=\"card-cover\">",
      "<img src=\"./" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"score-badge\">" + escapeHTML(movie.score) + "</span>",
      "<span class=\"play-hover\">▶</span>",
      "</div>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><span>" + escapeHTML(movie.category) + "</span><span>" + escapeHTML(movie.year) + "</span></div>",
      "<h3>" + escapeHTML(movie.title) + "</h3>",
      "<p>" + escapeHTML(movie.one_line) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var results = qs("[data-search-results]");
    var status = qs("[data-search-status]");
    if (!results || !window.movieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = normalize(params.get("q"));
    var formInput = qs(".search-page-form input[name='q']");
    if (formInput && keyword) {
      formInput.value = params.get("q");
    }
    if (!keyword) {
      status.textContent = "输入关键词即可搜索片名、题材、地区和标签。";
      results.innerHTML = window.movieSearchIndex.slice(0, 12).map(movieCard).join("");
      return;
    }
    var matched = window.movieSearchIndex.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.one_line,
        movie.category,
        movie.genre,
        movie.region,
        movie.year,
        (movie.tags || []).join(" ")
      ].join(" "));
      return haystack.indexOf(keyword) !== -1;
    });
    status.textContent = matched.length ? "搜索结果 " + matched.length + " 部" : "暂无匹配内容";
    results.innerHTML = matched.slice(0, 240).map(movieCard).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
