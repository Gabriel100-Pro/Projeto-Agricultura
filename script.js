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

const benefitsMarquee = document.getElementById("beneficios-faixa");
const benefitsMarqueeTrack = document.getElementById("benefitsMarqueeTrack");

if (benefitsMarquee && benefitsMarqueeTrack) {
  const benefitCards = Array.from(benefitsMarqueeTrack.querySelectorAll(".benefit-card"));
  let benefitsPaused = false;

  const setBenefitsPaused = (paused) => {
    benefitsPaused = paused;
    benefitsMarquee.classList.toggle("is-paused", paused);
    benefitCards.forEach((card) => {
      card.setAttribute("aria-pressed", String(paused));
    });
  };

  const toggleBenefitsPaused = () => {
    setBenefitsPaused(!benefitsPaused);
  };

  benefitsMarqueeTrack.addEventListener("click", (event) => {
    const card = event.target.closest(".benefit-card");

    if (!card || !benefitsMarqueeTrack.contains(card)) {
      return;
    }

    toggleBenefitsPaused();
  });

  benefitsMarqueeTrack.addEventListener("keydown", (event) => {
    const card = event.target.closest(".benefit-card");

    if (!card || !benefitsMarqueeTrack.contains(card)) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleBenefitsPaused();
  });

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reduceMotionQuery.matches) {
    setBenefitsPaused(true);
  }

  reduceMotionQuery.addEventListener?.("change", (event) => {
    if (event.matches) {
      setBenefitsPaused(true);
    }
  });
}

const testimonialsSection = document.querySelector(".testimonials");
const testimonialsCarousel = document.querySelector(".testimonials-carousel");
const testimonialsTrack = document.getElementById("testimonialsTrack");
const testimonialsGroup = document.getElementById("testimonialsGroup");

if (testimonialsSection && testimonialsCarousel && testimonialsTrack && testimonialsGroup) {
  const duplicateGroup = testimonialsGroup.cloneNode(true);
  duplicateGroup.id = "testimonialsGroupClone";
  duplicateGroup.querySelectorAll("[data-aos]").forEach((element) => {
    element.removeAttribute("data-aos");
    element.removeAttribute("data-aos-delay");
    element.removeAttribute("data-aos-duration");
  });
  testimonialsTrack.appendChild(duplicateGroup);

  const testimonialCards = Array.from(testimonialsTrack.querySelectorAll(".testimonial-card"));
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const visibleBreakpointDesktop = 980;
  const visibleBreakpointTablet = 640;
  const speedPxPerSecond = 40;
  let loopDistance = 0;
  let offset = 0;
  let isPaused = false;
  let lastTimestamp = 0;

  const getGapSize = () => {
    const groupStyles = window.getComputedStyle(testimonialsGroup);
    const gapValue = parseFloat(groupStyles.columnGap || groupStyles.gap || "20");

    return Number.isFinite(gapValue) ? gapValue : 20;
  };

  const setPausedState = (paused) => {
    isPaused = paused;
    testimonialsSection.classList.toggle("is-paused", paused);
    testimonialCards.forEach((card) => {
      card.setAttribute("aria-pressed", String(paused));
    });
  };

  const updateLayout = () => {
    const carouselWidth = testimonialsCarousel.getBoundingClientRect().width;

    if (!carouselWidth) {
      return;
    }

    const gapSize = getGapSize();
    const visibleCards = carouselWidth >= visibleBreakpointDesktop ? 3 : carouselWidth >= visibleBreakpointTablet ? 2 : 1;
    const cardWidth = (carouselWidth - gapSize * (visibleCards - 1)) / visibleCards;

    testimonialsCarousel.style.setProperty("--testimonial-card-width", `${cardWidth}px`);

    const groupWidth = testimonialsGroup.getBoundingClientRect().width;
    loopDistance = groupWidth + gapSize;

    if (loopDistance > 0) {
      offset = offset % loopDistance;
      testimonialsTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
  };

  const togglePause = () => {
    setPausedState(!isPaused);
  };

  testimonialsTrack.addEventListener("click", (event) => {
    const card = event.target.closest(".testimonial-card");

    if (!card || !testimonialsTrack.contains(card)) {
      return;
    }

    event.preventDefault();
    togglePause();
  });

  testimonialsTrack.addEventListener("keydown", (event) => {
    const card = event.target.closest(".testimonial-card");

    if (!card || !testimonialsTrack.contains(card)) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    togglePause();
  });

  testimonialsTrack.addEventListener("focusin", () => {
    testimonialsSection.classList.add("is-focused");
  });

  testimonialsTrack.addEventListener("focusout", () => {
    testimonialsSection.classList.remove("is-focused");
  });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    resizeObserver.observe(testimonialsCarousel);
  } else {
    window.addEventListener("resize", updateLayout);
  }

  if (motionQuery.matches) {
    setPausedState(true);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateLayout).catch(() => {});
  }

  updateLayout();

  const animateTestimonials = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!isPaused && loopDistance > 0) {
      offset = (offset + (speedPxPerSecond * delta) / 1000) % loopDistance;
      testimonialsTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }

    window.requestAnimationFrame(animateTestimonials);
  };

  window.requestAnimationFrame(animateTestimonials);

  motionQuery.addEventListener?.("change", (event) => {
    if (event.matches) {
      setPausedState(true);
    }
  });
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