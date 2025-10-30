document.addEventListener("DOMContentLoaded", () => {
  // Hamburger menu toggle (if it exists)
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
    });
  }

  // Login / Register button
  document.querySelectorAll(".donate-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  });

  // Optional: portal card buttons
  document.querySelectorAll(".portal-card button").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("Welcome to meriLipi! Let's start learning! 🎉");
    });
  });
});
