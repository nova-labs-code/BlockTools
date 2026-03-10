// responsive.js

(function() {
  function adjustLayout() {
    const toolsContainer = document.querySelector('.tools');
    const cards = document.querySelectorAll('.tool-card');

    if (!toolsContainer) return;

    const width = window.innerWidth;

    // Adjust grid layout based on screen width
    if (width <= 480) {
      toolsContainer.style.gridTemplateColumns = '1fr';
      cards.forEach(card => {
        card.style.padding = '20px';
        card.style.fontSize = '14px';
      });
    } else if (width <= 768) {
      toolsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
      cards.forEach(card => {
        card.style.padding = '22px';
        card.style.fontSize = '15px';
      });
    } else {
      toolsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
      cards.forEach(card => {
        card.style.padding = '25px';
        card.style.fontSize = '16px';
      });
    }

    // Optional: scale header font
    const header = document.querySelector('h1');
    if (header) {
      header.style.fontSize = width < 500 ? '28px' : '36px';
    }
  }

  // Run on page load
  window.addEventListener('load', adjustLayout);

  // Run on window resize
  window.addEventListener('resize', adjustLayout);
})();