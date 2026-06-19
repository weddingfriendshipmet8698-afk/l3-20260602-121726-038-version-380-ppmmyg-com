(function () {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let active = 0;

    const showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }
  }

  const filter = document.querySelector("[data-filter]");
  const cardList = document.querySelector("[data-card-list]");

  if (filter && cardList) {
    const keyword = filter.querySelector("[data-filter-keyword]");
    const year = filter.querySelector("[data-filter-year]");
    const sort = filter.querySelector("[data-filter-sort]");
    const cards = Array.from(cardList.querySelectorAll(".movie-card"));

    const apply = function () {
      const text = (keyword.value || "").trim().toLowerCase();
      const selectedYear = year.value;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(" ").toLowerCase();
        const matchText = !text || haystack.indexOf(text) !== -1;
        const matchYear = !selectedYear || card.dataset.year === selectedYear;
        card.classList.toggle("is-hidden", !(matchText && matchYear));
      });

      const sorted = cards.slice().sort(function (a, b) {
        if (sort.value === "title") {
          return a.dataset.title.localeCompare(b.dataset.title, "zh-Hans-CN");
        }
        if (sort.value === "heat") {
          const ah = parseFloat(a.querySelector(".movie-score").textContent) || 0;
          const bh = parseFloat(b.querySelector(".movie-score").textContent) || 0;
          return bh - ah;
        }
        return Number(b.dataset.year) - Number(a.dataset.year);
      });

      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });
    };

    [keyword, year, sort].forEach(function (input) {
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });
  }

  const results = document.getElementById("search-results");

  if (results && window.MovieSearchIndex) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const title = document.getElementById("search-title");
    const kicker = document.getElementById("search-kicker");
    const pageInput = document.querySelector(".page-search input[name='q']");

    if (pageInput) {
      pageInput.value = query;
    }

    const createCard = function (movie) {
      const card = document.createElement("a");
      card.className = "movie-card";
      card.href = movie.url;
      card.innerHTML = [
        "<span class=\"poster-wrap\">",
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"poster-shade\"></span>",
        "<span class=\"movie-score\">" + movie.heat + "</span>",
        "</span>",
        "<span class=\"movie-info\">",
        "<strong>" + escapeHtml(movie.title) + "</strong>",
        "<span class=\"movie-meta\">" + movie.year + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</span>",
        "<span class=\"movie-summary\">" + escapeHtml(movie.summary) + "</span>",
        "<span class=\"tag-row\"><span>" + escapeHtml(movie.category) + "</span></span>",
        "</span>"
      ].join("");
      return card;
    };

    const render = function () {
      results.innerHTML = "";

      if (!query) {
        title.textContent = "请输入关键词";
        kicker.textContent = "影片结果";
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "输入影片名称、年份、地区或题材开始搜索";
        results.appendChild(empty);
        return;
      }

      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      const matched = window.MovieSearchIndex.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.genre,
          movie.category,
          movie.tags,
          movie.summary
        ].join(" ").toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      title.textContent = "“" + query + "” 的搜索结果";
      kicker.textContent = "影片结果";

      if (!matched.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "未找到相关影片";
        results.appendChild(empty);
        return;
      }

      matched.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
    };

    render();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
