document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Thanks for reaching out! I will get back to you soon.");
    this.reset();
  });
  