(() => {
  const matches = [
    ['Coca-Cola', 'produto-coca-cola.jpg'],
    ['Doritos', 'produto-doritos.jpg']
  ];
  document.querySelectorAll('button.produto').forEach(button => {
    const match = matches.find(([name]) => button.textContent.includes(name));
    if (!match) return;
    const image = document.createElement('img');
    image.src = match[1]; image.alt = ''; image.loading = 'lazy'; image.className = 'product-thumb';
    button.prepend(image);
  });
  document.querySelectorAll('button.produto,.btn').forEach(button => button.addEventListener('click', () => {
    button.classList.remove('tap-pulse');
    void button.offsetWidth;
    button.classList.add('tap-pulse');
  }));
})();
