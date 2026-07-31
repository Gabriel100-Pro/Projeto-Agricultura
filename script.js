const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
    });
  });
}

const galleryVideoPlayer = document.getElementById("galleryVideoPlayer");
const carouselPrev = document.getElementById("carouselPrev");
const carouselNext = document.getElementById("carouselNext");
const videoSourceList = document.querySelectorAll("#videoSourceList li[data-video-src]");

if (galleryVideoPlayer && carouselPrev && carouselNext && videoSourceList.length > 0) {
  const videoSources = Array.from(videoSourceList).map((item) => item.dataset.videoSrc).filter(Boolean);
  let currentIndex = 0;

  const setCarouselVideo = (index) => {
    currentIndex = (index + videoSources.length) % videoSources.length;
    const currentSource = videoSources[currentIndex];

    galleryVideoPlayer.pause();
    galleryVideoPlayer.setAttribute("src", currentSource);
    galleryVideoPlayer.load();
  };

  carouselPrev.addEventListener("click", () => {
    setCarouselVideo(currentIndex - 1);
  });

  carouselNext.addEventListener("click", () => {
    setCarouselVideo(currentIndex + 1);
  });
}

AOS.init({
  duration: 900,
  easing: "ease-out-cubic",
  once: true,
  offset: 80
});