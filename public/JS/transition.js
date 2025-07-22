document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with the class 'slide-in'
  const sliders = document.querySelectorAll(".slide-in");

  // Create an IntersectionObserver to track visibility
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add 'visible' class when element enters the viewport
        entry.target.classList.add("visible");
      } else {
        // Remove 'visible' class when it leaves the viewport
        entry.target.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.2 // Trigger when 20% of the element is visible
  });

  // Start observing each slider element
  sliders.forEach(slide => observer.observe(slide));
});

