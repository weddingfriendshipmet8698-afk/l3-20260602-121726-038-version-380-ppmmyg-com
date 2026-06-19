(function () {
  function initPlayer(shell) {
    var video = shell.querySelector(".movie-video");
    var button = shell.querySelector(".play-layer");
    var message = shell.querySelector(".player-message");
    if (!video || !button) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attach() {
      var src = video.getAttribute("data-video");
      if (!src) {
        setMessage("播放暂时无法启动，请稍后再试");
        return Promise.reject(new Error("missing video"));
      }
      if (video.getAttribute("data-ready") === "1") {
        return Promise.resolve();
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.setAttribute("data-ready", "1");
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        shell.hlsInstance = hls;
        video.setAttribute("data-ready", "1");
        return Promise.resolve();
      }
      setMessage("播放暂时无法启动，请稍后再试");
      return Promise.reject(new Error("unsupported"));
    }

    function play() {
      button.classList.add("is-hidden");
      attach().then(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
            setMessage("点击播放按钮继续观看");
          });
        }
      }).catch(function () {
        button.classList.remove("is-hidden");
      });
    }

    button.addEventListener("click", play);
    shell.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
      setMessage("");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(initPlayer);
  });
})();
