(function () {
  function start(playerId, streamUrl) {
    var root = document.getElementById(playerId);

    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var button = root.querySelector(".play-layer");
    var hlsInstance = null;
    var ready = false;

    if (!video || !button) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.controls = true;
      ready = true;
    }

    function play() {
      attach();
      root.classList.add("is-playing");
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  window.MoviePlayer = {
    start: start
  };
})();
