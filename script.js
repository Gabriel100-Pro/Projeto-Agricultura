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
const servicesSection = document.getElementById("servicos");

if (servicesSection) {
  servicesSection.classList.add("services-stagger-ready");

  let servicesRevealed = false;

  const revealServices = () => {
    if (servicesRevealed) {
      return;
    }

    servicesRevealed = true;
    servicesSection.classList.add("services-animate");
  };

  // Failsafe for browsers/devices where IntersectionObserver can be inconsistent.
  const servicesFallbackTimeout = window.setTimeout(revealServices, 1800);

  if ("IntersectionObserver" in window) {
    const servicesObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          if (entry.intersectionRatio >= 0.28) {
            revealServices();
            window.clearTimeout(servicesFallbackTimeout);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: [0.2, 0.28, 0.36]
      }
    );

    servicesObserver.observe(servicesSection);
  } else {
    revealServices();
    window.clearTimeout(servicesFallbackTimeout);
  }
}

if (galleryVideoPlayer && carouselPrev && carouselNext && videoSourceList.length > 0) {
  const videoSources = Array.from(videoSourceList).map((item) => item.dataset.videoSrc).filter(Boolean);
  let currentIndex = 0;

  const primeInitialVideoFrame = () => {
    if (galleryVideoPlayer.dataset.framePrimed === "true") {
      return;
    }

    const setFirstFrame = () => {
      if (galleryVideoPlayer.dataset.framePrimed === "true") {
        return;
      }

      try {
        galleryVideoPlayer.currentTime = 0.01;
        galleryVideoPlayer.dataset.framePrimed = "true";
      } catch (_error) {
        // Ignore iOS timing edge-cases; metadata listener will retry.
      }
    };

    if (galleryVideoPlayer.readyState >= 1) {
      setFirstFrame();
    }

    galleryVideoPlayer.addEventListener("loadedmetadata", setFirstFrame, { once: true });
    galleryVideoPlayer.addEventListener("loadeddata", setFirstFrame, { once: true });
  };

  // Ensure the player always starts with the first source from the configured list.
  if (videoSources[0]) {
    galleryVideoPlayer.src = videoSources[0];
    galleryVideoPlayer.load();
    primeInitialVideoFrame();
  }

  const setCarouselVideo = (index) => {
    currentIndex = (index + videoSources.length) % videoSources.length;
    const currentSource = videoSources[currentIndex];

    galleryVideoPlayer.pause();
    galleryVideoPlayer.src = currentSource;
    galleryVideoPlayer.dataset.framePrimed = "false";
    galleryVideoPlayer.load();
    primeInitialVideoFrame();
  };

  galleryVideoPlayer.addEventListener("error", () => {
    if (videoSources.length > 1) {
      setCarouselVideo(currentIndex + 1);
    }
  });

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