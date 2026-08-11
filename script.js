const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
  const setMenuState = (isOpen) => {
    menu.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };

  let lastTouchTime = 0;

  const toggleMenu = () => {
    const isOpen = menu.classList.contains("open");
    setMenuState(!isOpen);
  };

  menuToggle.addEventListener("touchstart", (event) => {
    event.preventDefault();
    lastTouchTime = Date.now();
    toggleMenu();
  }, { passive: false });

  menuToggle.addEventListener("click", (event) => {
    event.preventDefault();

    if (Date.now() - lastTouchTime < 450) {
      return;
    }

    toggleMenu();
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (!menu.classList.contains("open")) {
      return;
    }

    if (menu.contains(target) || menuToggle.contains(target)) {
      return;
    }

    setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
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