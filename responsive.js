// responsive.js
(function() {
  function adjustLayout() {
    const width = window.innerWidth;

    // ----- Index Page (.tool-card)
    const toolsContainer = document.querySelector('.tools');
    const toolCards = document.querySelectorAll('.tool-card');
    if (toolsContainer) {
      if (width < 500) {
        toolsContainer.style.gridTemplateColumns = '1fr';
      } else if (width < 768) {
        toolsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
      } else {
        toolsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
      }
      toolCards.forEach(card => {
        card.style.padding = width < 500 ? '18px' : '25px';
        card.style.fontSize = width < 500 ? '14px' : '16px';
      });
    }

    // ----- Forms (.controls)
    const controls = document.querySelectorAll('.controls');
    controls.forEach(control => {
      control.style.padding = width < 500 ? '15px' : '30px';
      control.style.fontSize = width < 500 ? '14px' : '16px';

      const inputs = control.querySelectorAll('input, select, button');
      inputs.forEach(input => {
        input.style.width = '100%';
        input.style.fontSize = width < 500 ? '14px' : '16px';
        input.style.padding = width < 500 ? '10px' : '';
      });
    });

    // ----- Result / Storage Cards
    const results = document.querySelectorAll('.result, .card, .inner-card, .nested-card, .partial');
    results.forEach(res => {
      if (width < 500) {
        res.style.fontSize = '16px';
        res.style.padding = '10px';
        res.style.flexDirection = 'column';
      } else if (width < 768) {
        res.style.fontSize = '18px';
        res.style.padding = '12px';
        res.style.flexDirection = '';
      } else {
        res.style.fontSize = '';
        res.style.padding = '';
        res.style.flexDirection = '';
      }
    });

    // ----- Header scaling
    const header = document.querySelector('h1');
    if (header) {
      header.style.fontSize = width < 500 ? '28px' : '36px';
    }
  }

  window.addEventListener('load', adjustLayout);
  window.addEventListener('resize', adjustLayout);
})();