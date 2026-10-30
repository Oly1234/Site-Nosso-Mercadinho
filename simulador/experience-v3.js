(() => {
  const API = 'https://adm-olypres.web.app/api/community/public/site';
  const $ = id => document.getElementById(id);
  const state = {products: [], cart: [], scanned: new Set(), posts: [], postIndex: 0};
  const safeImage = value => {
    try { const url = new URL(value); return url.protocol === 'https:' && ['production.images.vmpay.vertitecnologia.com.br','vmpay.vertitecnologia.com.br'].includes(url.hostname) ? url.href : null; } catch { return null; }
  };
  const safePost = value => {
    try { const url = new URL(value); return url.protocol === 'https:' && ['www.instagram.com','instagram.com'].includes(url.hostname) ? url.href : null; } catch { return null; }
  };
  async function getJson(path) {
    const response = await fetch(`${API}${path}`, {signal: AbortSignal.timeout(9000)});
    if (!response.ok) throw Error('unavailable');
    return response.json();
  }
  function updateCart() {
    $('cart-count').textContent = `${state.cart.length} ${state.cart.length === 1 ? 'item' : 'itens'} na sacola`;
    $('go-checkout').disabled = state.cart.length === 0;
    $('monitor-value').textContent = state.cart.length ? `${state.cart.length} ITEM${state.cart.length > 1 ? 'S' : ''}` : 'PRONTO';
    $('monitor-hint').textContent = state.cart.length ? 'Sacola demonstrativa' : 'Escolha um produto';
  }
  function renderProducts() {
    const grid = $('product-grid'); grid.replaceChildren();
    state.products.forEach(product => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'product';
      button.setAttribute('aria-pressed', String(state.cart.some(item => item.id === product.id)));
      const image = document.createElement('img'); image.src = product.image; image.alt = ''; image.loading = 'lazy';
      const name = document.createElement('strong'); name.textContent = product.name;
      const hint = document.createElement('small'); hint.textContent = 'Toque para adicionar';
      button.append(image, name, hint);
      button.addEventListener('click', () => {
        const index = state.cart.findIndex(item => item.id === product.id);
        if (index < 0) state.cart.push(product); else state.cart.splice(index, 1);
        button.classList.toggle('selected', index < 0);
        button.setAttribute('aria-pressed', String(index < 0));
        hint.textContent = index < 0 ? '✓ Na sacola' : 'Toque para adicionar';
        updateCart();
      });
      grid.append(button);
    });
    ['shelf-one','shelf-two'].forEach((id, shelf) => {
      const node = $(id); node.replaceChildren();
      state.products.slice(shelf * 6, shelf * 6 + 6).forEach((product, index) => {
        const card = document.createElement('div'); card.className = 'mini-product'; card.style.animationDelay = `${index * 90}ms`;
        const image = document.createElement('img'); image.src = product.image; image.alt = ''; image.loading = 'lazy'; card.append(image); node.append(card);
      });
    });
  }
  function step(name) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.id === `${name}-tab`));
    document.querySelectorAll('.steps span').forEach(span => span.classList.toggle('active', span.dataset.step === name));
    $('visitor').classList.toggle('at-checkout', name !== 'shop');
    $('scene-status').textContent = name === 'shop' ? 'PORTAS ABERTAS · 24H' : name === 'scan' ? 'CAIXA EM USO' : 'VISITA CONCLUÍDA';
    if (name === 'scan') renderScan();
    if (name === 'finish') { $('finish-count').textContent = String(state.cart.length); $('monitor-value').textContent = 'OBRIGADO!'; $('monitor-hint').textContent = 'Volte sempre'; }
  }
  function renderScan() {
    const list = $('scan-list'); list.replaceChildren();
    state.cart.forEach((product, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'scan-item';
      button.classList.toggle('scanned', state.scanned.has(product.id));
      button.setAttribute('aria-label', `${state.scanned.has(product.id) ? 'Lido: ' : 'Escanear: '}${product.name}`);
      const image = document.createElement('img'); image.src = product.image; image.alt = '';
      const name = document.createElement('span'); name.textContent = product.name;
      const mark = document.createElement('b'); mark.textContent = state.scanned.has(product.id) ? '✓' : '◎';
      button.append(image, name, mark);
      button.addEventListener('click', () => {
        state.scanned.add(product.id); button.classList.add('scanned'); mark.textContent = '✓'; button.setAttribute('aria-label', `Lido: ${product.name}`);
        $('monitor-value').textContent = `${state.scanned.size}/${state.cart.length}`;
        $('monitor-hint').textContent = product.name.slice(0, 25);
        $('go-finish').disabled = state.scanned.size !== state.cart.length;
      }); list.append(button);
    });
    $('go-finish').disabled = state.scanned.size !== state.cart.length;
  }
  function showPost() {
    if (!state.posts.length) return;
    const post = state.posts[state.postIndex++ % state.posts.length];
    const frame = $('ad-frame'); frame.replaceChildren();
    const image = document.createElement('img'); image.src = post.image; image.alt = 'Publicidade publicada pela equipe do Nosso Mercadinho'; image.loading = 'lazy'; frame.append(image);
    $('ad-link').href = post.permalink;
  }
  async function load() {
    const [catalog, feed] = await Promise.allSettled([getJson('/products'),getJson('/posts')]);
    if (catalog.status === 'fulfilled' && Array.isArray(catalog.value.products)) {
      state.products = catalog.value.products.filter(product => /^\d{1,20}$/.test(String(product.id)) && typeof product.name === 'string' && safeImage(product.image)).slice(0,12).map(product => ({id:String(product.id),name:product.name.slice(0,90),image:safeImage(product.image)}));
    }
    $('catalog-note').textContent = state.products.length ? 'Uma amostra do catálogo integrado. Os itens variam conforme a unidade.' : 'O catálogo está temporariamente indisponível. Volte em instantes para experimentar.';
    if (state.products.length) renderProducts(); else $('product-grid').innerHTML = '<div class="loading">Catálogo indisponível no momento.</div>';
    if (feed.status === 'fulfilled' && Array.isArray(feed.value.posts)) {
      state.posts = feed.value.posts.filter(post => safePost(post.permalink) && /^https:\/\/adm-olypres\.web\.app\/api\/community\/public\/site\/posts\//.test(post.image || '')).slice(0,6);
      showPost(); if (state.posts.length > 1) setInterval(showPost, 7000);
    }
  }
  $('go-checkout').addEventListener('click', () => {state.scanned.clear(); step('scan');});
  $('back-shop').addEventListener('click', () => step('shop'));
  $('go-finish').addEventListener('click', () => {if (state.scanned.size === state.cart.length && state.cart.length) step('finish');});
  $('restart').addEventListener('click', () => {state.cart = []; state.scanned.clear(); renderProducts(); updateCart(); step('shop');});
  load();
})();
