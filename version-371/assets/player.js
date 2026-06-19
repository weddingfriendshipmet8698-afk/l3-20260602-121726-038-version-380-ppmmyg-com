import { H as Hls } from './hls-vendor.js';

export function mountPlayer(options) {
    const video = document.querySelector(options.video);
    const overlay = document.querySelector(options.overlay);
    const src = options.src;
    let hls = null;
    let mounted = false;

    if (!video || !src) {
        return;
    }

    const load = function () {
        if (mounted) {
            return;
        }

        mounted = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    };

    const play = function () {
        load();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                video.controls = true;
            });
        }
    };

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
