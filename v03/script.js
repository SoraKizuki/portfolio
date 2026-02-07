document.addEventListener("DOMContentLoaded", () => {
  // Vivus
  new Vivus(
    "cat-line",
    { start: "autostart", type: "scenario-sync", duration: 200 },
    function (obj) {
      obj.reset().play();
    },
  );

  // 無限スライダー
  function initInfiniteSlider(selector, speed) {
    const track = document.querySelector(selector);
    if (!track) return;

    const images = Array.from(track.querySelectorAll("img"));
    const imagePromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(imagePromises).then(() => {
      const originalChildren = Array.from(track.children);

      const fragmentBefore = document.createDocumentFragment();
      const fragmentAfter = document.createDocumentFragment();

      originalChildren.forEach((item) => {
        const cloneBefore = item.cloneNode(true);
        cloneBefore.setAttribute("aria-hidden", "true");
        fragmentBefore.appendChild(cloneBefore);

        const cloneAfter = item.cloneNode(true);
        cloneAfter.setAttribute("aria-hidden", "true");
        fragmentAfter.appendChild(cloneAfter);
      });

      track.insertBefore(fragmentBefore, track.firstChild);
      track.appendChild(fragmentAfter);

      let singleSetWidth = 0;
      let currentPos = 0;
      let isPaused = false;

      const updateMetrics = () => {
        singleSetWidth = track.scrollWidth / 3;
        currentPos = -singleSetWidth;
        track.style.transform = `translateX(${currentPos}px)`;
      };

      const resizeObserver = new ResizeObserver(() => {
        updateMetrics();
      });
      resizeObserver.observe(track);

      updateMetrics();

      function animate() {
        if (!isPaused) {
          currentPos -= speed;

          if (speed > 0 && currentPos <= -singleSetWidth * 2) {
            currentPos += singleSetWidth;
          } else if (speed < 0 && currentPos >= 0) {
            currentPos -= singleSetWidth;
          }

          track.style.transform = `translateX(${currentPos}px)`;
        }
        requestAnimationFrame(animate);
      }

      track.addEventListener("mouseenter", () => (isPaused = true));
      track.addEventListener("mouseleave", () => (isPaused = false));

      requestAnimationFrame(animate);
    });
  }

  initInfiniteSlider("#main-slider", 1);
  initInfiniteSlider("#movie-row-1", -1);
  initInfiniteSlider("#movie-row-2", 1);

  // Skill Toggle
  const skillBtn = document.getElementById("skill-btn");
  const skillTable = document.getElementById("skill-table");
  if (skillBtn && skillTable) {
    skillBtn.addEventListener("click", () => {
      if (skillTable.style.display === "block") {
        skillTable.style.display = "none";
      } else {
        skillTable.style.display = "block";
      }
    });
  }

  // Accordion
  const acHeaders = document.querySelectorAll(".ac-header");
  acHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;

      if (header.classList.contains("active")) {
        header.classList.remove("active");
        content.style.height = "0";
      } else {
        acHeaders.forEach((h) => {
          h.classList.remove("active");
          h.nextElementSibling.style.height = "0";
        });

        header.classList.add("active");
        content.style.height = content.scrollHeight + "px";
      }
    });
  });

  // Close Button
  const closeBtns = document.querySelectorAll(".ac-close-btn");
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const content = btn.closest(".ac-content");
      const header = content.previousElementSibling;

      const rect = header.getBoundingClientRect();
      const offset = window.pageYOffset || document.documentElement.scrollTop;
      const target = rect.top + offset - 80;
      window.scrollTo({
        top: target,
        behavior: "smooth",
      });

      setTimeout(() => {
        if (header.classList.contains("active")) {
          header.click();
        }
      }, 600);
    });
  });

  // Hamburger
  const hamburger = document.getElementById("menubar_hdr");
  const menu = document.getElementById("menubar");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("ham");
    if (hamburger.classList.contains("ham")) {
      document.body.classList.add("menu-open", "noscroll");
    } else {
      document.body.classList.remove("menu-open", "noscroll");
    }
  });

  menu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("ham");
      document.body.classList.remove("menu-open", "noscroll");
    });
  });

  // Scroll
  const pageTopBtn = document.querySelector(".pagetop");
  window.addEventListener("scroll", () => {
    if (window.scrollY >= 300) {
      pageTopBtn.classList.add("show");
    } else {
      pageTopBtn.classList.remove("show");
    }
  });
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const target =
        targetId === "#" ? document.body : document.querySelector(targetId);
      if (target) {
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  // Toast
  const toast = document.getElementById("toast");
  if (toast && !sessionStorage.getItem("popupShown")) {
    setTimeout(() => {
      toast.classList.add("show");
      sessionStorage.setItem("popupShown", "true");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 4000);
    }, 3000);
  }
  if (toast) {
    toast.querySelector(".close-btn").addEventListener("click", () => {
      toast.classList.remove("show");
    });
  }

  // Lightbox
  const modalLinks = document.querySelectorAll("a[data-modal-group]");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalImg = document.getElementById("modal-img");
  const modalCaption = document.getElementById("modal-caption");
  const modalClose = document.getElementById("modal-close");
  const modalPrev = document.querySelector(".modal-prev");
  const modalNext = document.querySelector(".modal-next");
  let galleryImages = [];
  let currentIndex = 0;

  if (modalLinks.length > 0) {
    modalLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const group = link.getAttribute("data-modal-group");
        galleryImages = Array.from(
          document.querySelectorAll(`a[data-modal-group="${group}"]`),
        );
        currentIndex = galleryImages.indexOf(link);
        openModal();
      });
    });

    function openModal() {
      updateModalImage();
      modalOverlay.classList.add("active");
    }
    function closeModal() {
      modalOverlay.classList.remove("active");
    }
    function updateModalImage() {
      const currentLink = galleryImages[currentIndex];
      modalImg.src = currentLink.getAttribute("href");
      modalCaption.textContent = currentLink.getAttribute("data-title") || "";
    }

    modalClose.addEventListener("click", closeModal);

    modalOverlay.addEventListener("click", (e) => {
      closeModal();
    });

    modalPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex =
        currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
      updateModalImage();
    });
    modalNext.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex =
        currentIndex < galleryImages.length - 1 ? currentIndex + 1 : 0;
      updateModalImage();
    });
  }
});
