// =========================================================
// Cralite Global Cursor Ring — Enlarges on hover
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const waitForHeader = setInterval(() => {
    const toggleBtn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");
    const header = document.querySelector(".site-header");

    if (toggleBtn && nav && header) {
      clearInterval(waitForHeader);

      // Open / close full-screen menu
      toggleBtn.addEventListener("click", () => {
        nav.classList.toggle("open");
        toggleBtn.classList.toggle("active");
        header.classList.toggle("menu-open");
      });

      // Close drawer when link clicked
      document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
          nav.classList.remove("open");
          toggleBtn.classList.remove("active");
          header.classList.remove("menu-open");
        });
      });

      // Dropdown toggles
      const dropdowns = document.querySelectorAll(".menu-item.has-dropdown");
      dropdowns.forEach(item => {
        const toggle = item.querySelector(".dropdown-toggle");
        toggle.addEventListener("click", e => {
          e.stopPropagation();

          // Optional: close other dropdowns
          dropdowns.forEach(d => {
            if (d !== item) d.classList.remove("open");
          });

          item.classList.toggle("open");
        });
      });
    }
  }, 200);
});



(function () {
  if (document.querySelector(".custom-cursor-ring")) return;

  document.addEventListener("DOMContentLoaded", () => {
    const ring = document.createElement("div");
    ring.classList.add("custom-cursor-ring");
    document.body.appendChild(ring);

    let x = 0, y = 0, tx = 0, ty = 0;
    const speed = 0.18;

    document.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      ring.style.opacity = "1";
    });

    function animate() {
      x += (tx - x) * speed;
      y += (ty - y) * speed;
      ring.style.top = y + "px";
      ring.style.left = x + "px";
      requestAnimationFrame(animate);
    }
    animate();

    // --- Hover detection ---
    document.querySelectorAll("a, button, .category-tab, [role='button'], input[type='button'], input[type='submit']")
      .forEach(el => {
        el.addEventListener("mouseenter", () => {
          ring.classList.add("hovered");
        });
        el.addEventListener("mouseleave", () => {
          ring.classList.remove("hovered");
        });
      });

    // Hide when leaving window
    document.addEventListener("mouseleave", () => {
      ring.style.opacity = "0";
    });
  });
})();

window.addEventListener("scroll", () => {
  const header = document.querySelector(".site-header");
  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

document.addEventListener("scroll", () => {
  const header = document.querySelector(".site-header");
  if (window.scrollY > 30) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});