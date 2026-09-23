window.HELP_IMPROVE_VIDEOJS = false;

// Video slots: every .video-slot[data-video] shows its placeholder card until
// the named mp4 actually exists. Drop the file into static/videos/ and the
// clip takes over — no HTML edits needed.
function setupVideoSlots() {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loopers = [];

  document.querySelectorAll('.video-slot[data-video]').forEach(function (slot) {
    var frame = slot.querySelector('.video-frame');
    var video = slot.querySelector('video');
    if (!frame || !video || video.querySelector('source')) return;

    var source = document.createElement('source');
    source.src = slot.getAttribute('data-video');
    source.type = 'video/mp4';

    video.addEventListener('loadeddata', function () {
      frame.classList.add('has-video');
      if (slot.hasAttribute('data-loop') && !reduceMotion) {
        video.muted = true;
        video.loop = true;
        loopers.push(video);
      } else {
        video.controls = true;
      }
    }, { once: true });

    video.appendChild(source);
    video.load();
  });

  // Short loops play only while on screen, so a page full of clips stays cheap.
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () { v.controls = true; });
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.5 });

    var attach = setInterval(function () {
      while (loopers.length) observer.observe(loopers.pop());
    }, 400);
    setTimeout(function () { clearInterval(attach); }, 8000);
  }
}

$(document).ready(function () {
  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
    pagination: false,
    breakpoints: [
      { changePoint: 640, slidesToShow: 1, slidesToScroll: 1 },
      { changePoint: 1024, slidesToShow: 2, slidesToScroll: 1 }
    ]
  };

  // Initialize every .carousel (bulma-carousel), then wire the video slots —
  // after, so the clones an infinite carousel makes get wired too.
  bulmaCarousel.attach('.carousel', options);
  bulmaSlider.attach();
  setupVideoSlots();
});
