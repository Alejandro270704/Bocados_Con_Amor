/* ============================================================
   BOCADOS CON AMOR — app.js
   ============================================================ */

'use strict';

// ========== RESTAURANT LOCATION (Cra. 21b #115-116, Bucaramanga) ==========
const RESTAURANT_LAT = 7.1198;
const RESTAURANT_LNG = -73.1227;

const ZONE_COORDS = {
  'Bucaramanga':   { lat: 7.1197,  lng: -73.1228 },
  'Floridablanca': { lat: 7.0627,  lng: -73.0944 },
  'Girón':         { lat: 7.0742,  lng: -73.1714 },
  'Piedecuesta':   { lat: 6.9914,  lng: -73.0531 },
};

function calcShipping(zone) {
  const dest = ZONE_COORDS[zone];
  if (!dest) return 2500;
  const R = 6371;
  const dLat = (dest.lat - RESTAURANT_LAT) * Math.PI / 180;
  const dLng = (dest.lng - RESTAURANT_LNG) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2
    + Math.cos(RESTAURANT_LAT * Math.PI/180)
    * Math.cos(dest.lat * Math.PI/180)
    * Math.sin(dLng/2)**2;
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  if (km <= 3)  return 2500;
  if (km <= 6)  return 4000;
  if (km <= 10) return 6000;
  return 8000;
}

// ========== STATE ==========
const state = {
  cart: [],
  cartOpen: false,
  checkoutOpen: false,
  checkoutStep: 'info',
  checkoutForm: {
    name: '', phone: '', email: '', address: '',
    zone: 'Bucaramanga', deliveryDate: '', notes: '',
    paymentMethod: 'efectivo'
  },
  activeCategory: 'Todos',
};

// ========== PRODUCT DATA ==========
const products = [
  { id: 1, name: 'Pancakes de Fresa', category: 'Dulces', price: 8500, image: 'img/product-pancakes.jpg', description: 'Esponjosos pancakes con fresas frescas y crema batida', ingredients: ['Harina de trigo', 'Huevos frescos', 'Leche entera', 'Fresas frescas', 'Crema batida', 'Miel de maple', 'Mantequilla artesanal', 'Azúcar glass'] },
  { id: 2, name: 'Tostada Francesa', category: 'Dulces', price: 7800, image: 'img/product-french-toast.jpg', description: 'Pan brioche con miel de maple y frutos rojos', ingredients: ['Pan brioche artesanal', 'Huevos', 'Leche entera', 'Canela', 'Vainilla', 'Miel de maple', 'Frutos rojos mixtos', 'Azúcar glass'] },
  { id: 3, name: 'Açaí Bowl', category: 'Dulces', price: 9200, image: 'img/product-acai.jpg', description: 'Bowl de açaí con granola, frutas y flores comestibles', ingredients: ['Pulpa de açaí', 'Granola artesanal', 'Banano', 'Fresas', 'Arándanos', 'Coco rallado', 'Miel', 'Flores comestibles', 'Semillas de chía'] },
  { id: 4, name: 'Croissant Jamón y Queso', category: 'Salados', price: 6500, image: 'img/product-croissant.jpg', description: 'Croissant artesanal relleno de jamón y queso derretido', ingredients: ['Croissant artesanal', 'Jamón de calidad', 'Queso gruyère', 'Mantequilla', 'Mostaza dijon', 'Hierbas aromáticas'] },
  { id: 5, name: 'Tostada de Aguacate', category: 'Salados', price: 8000, image: 'img/product-avocado-toast.jpg', description: 'Pan artesanal con aguacate fresco, tomate cherry y microgreens', ingredients: ['Pan artesanal multigrano', 'Aguacate fresco', 'Tomates cherry', 'Microgreens', 'Limón', 'Aceite de oliva', 'Sal rosada del Himalaya', 'Pimienta negra', 'Semillas de sésamo'] },
  { id: 6, name: 'Huevos Benedictinos', category: 'Salados', price: 10500, image: 'img/product-eggs-benedict.jpg', description: 'Huevos pochados con salsa holandesa sobre pan artesanal', ingredients: ['Huevos frescos pochados', 'Pan artesanal', 'Jamón curado', 'Salsa holandesa', 'Mantequilla clarificada', 'Limón', 'Cebollín', 'Páprika'] },
  { id: 7, name: 'Latte con Arte', category: 'Bebidas', price: 4500, image: 'img/product-latte.jpg', description: 'Café latte con arte de corazón en espuma cremosa', ingredients: ['Café espresso doble', 'Leche entera vaporizada', 'Espuma cremosa', 'Esencia de vainilla (opcional)'] },
  { id: 8, name: 'Smoothie de Frutos Rojos', category: 'Bebidas', price: 6000, image: 'img/product-smoothie.jpg', description: 'Mezcla de fresas, arándanos y frambuesas naturales', ingredients: ['Fresas frescas', 'Arándanos', 'Frambuesas', 'Yogur natural', 'Miel', 'Leche de almendra', 'Hielo'] },
  { id: 9, name: 'Chocolate Caliente', category: 'Bebidas', price: 5200, image: 'img/product-chocolate.jpg', description: 'Chocolate artesanal con marshmallows y crema batida', ingredients: ['Chocolate artesanal 70%', 'Leche entera', 'Crema batida', 'Marshmallows', 'Canela', 'Vainilla'] },
];

// ========== HELPERS ==========
const fmt = (n) => '$' + n.toLocaleString('es-CO');
function totalItems() { return state.cart.reduce((s, i) => s + i.quantity, 0); }
function totalPrice() { return state.cart.reduce((s, i) => s + i.price * i.quantity, 0); }
function shippingCost() { return calcShipping(state.checkoutForm.zone); }

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ========== NAVBAR ==========
const hamburger  = $('#hamburger');
const mobileMenu = $('#mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
$$('.mobile-nav-link, .mobile-order-btn').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});
document.addEventListener('click', (e) => {
  const a = e.target.closest("a[href^='#']");
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#') return;
  const el = document.querySelector(id);
  if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});
const heroBg = $('#heroBg');
window.addEventListener('scroll', () => {
  if (heroBg) heroBg.style.transform = `scale(1) translateY(${window.scrollY * 0.3}px)`;
}, { passive: true });

// ========== REVEAL ==========
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
$$('.reveal').forEach(el => revealObserver.observe(el));

// ========== PRODUCT POPUP ==========
function openProductPopup(product) {
  const existing = $('#productPopupOverlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'productPopupOverlay';
  overlay.className = 'popup-overlay';
  overlay.innerHTML = `
    <div class="popup-modal" role="dialog" aria-modal="true">
      <button class="popup-close" id="popupClose" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="popup-img-wrap">
        <img src="${product.image}" alt="${product.name}" class="popup-img" />
        <span class="popup-category">${product.category}</span>
      </div>
      <div class="popup-content">
        <h2 class="popup-name">${product.name}</h2>
        <p class="popup-desc">${product.description}</p>
        <div class="popup-ingredients">
          <h4 class="popup-ing-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 8v4l3 3"/></svg>
            Ingredientes
          </h4>
          <ul class="popup-ing-list">
            ${product.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>
        <div class="popup-footer">
          <span class="popup-price">${fmt(product.price)}</span>
          <button class="btn-primary popup-add-btn" id="popupAddBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('open'));
  const close = () => {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 300);
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  $('#popupClose', overlay).addEventListener('click', close);
  $('#popupAddBtn', overlay).addEventListener('click', (e) => {
    const btn = e.currentTarget;
    addToCart(product.id);
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> ¡Añadido!`;
    setTimeout(() => close(), 900);
  });
}

// ========== PRODUCTS GRID ==========
const productsGrid = $('#productsGrid');

function renderProducts() {
  const filtered = state.activeCategory === 'Todos' ? products : products.filter(p => p.category === state.activeCategory);
  productsGrid.innerHTML = '';
  filtered.forEach((p, i) => productsGrid.appendChild(createProductCard(p, i)));
}

function createProductCard(p, index) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.style.animationDelay = `${index * 0.07}s`;
  card.innerHTML = `
    <div class="product-img-wrap">
      <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" width="640" height="640" />
      <div class="product-overlay"></div>
      <span class="product-category">${p.category}</span>
      <button class="view-popup-btn" aria-label="Ver detalles">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Ver detalle
      </button>
      <button class="add-hover-btn" data-id="${p.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        Agregar al carrito
      </button>
    </div>
    <div class="product-info">
      <h3 class="product-name">${p.name}</h3>
      <p class="product-desc">${p.description}</p>
      <div class="product-bottom">
        <span class="product-price">${fmt(p.price)}</span>
        <button class="add-btn" data-id="${p.id}" aria-label="Añadir al carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </button>
      </div>
    </div>
  `;
  card.querySelector('.view-popup-btn').addEventListener('click', () => openProductPopup(p));
  card.querySelector('.add-hover-btn').addEventListener('click', (e) => handleAddToCart(p.id, e.currentTarget));
  card.querySelector('.add-btn').addEventListener('click', (e) => handleAddToCart(p.id, e.currentTarget));
  return card;
}

function handleAddToCart(id, btn) {
  addToCart(id);
  if (btn) {
    btn.classList.add('added');
    const origHTML = btn.innerHTML;
    if (btn.classList.contains('add-hover-btn')) {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> ¡Añadido!`;
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    }
    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = origHTML; }, 1500);
  }
}

$$('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.activeCategory = btn.dataset.cat;
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts();
  });
});
renderProducts();

// ========== CART ==========
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(i => i.id === id);
  if (existing) { existing.quantity++; } else { state.cart.push({ ...product, quantity: 1 }); }
  updateCartUI();
  openCart();
}
function removeFromCart(id) { state.cart = state.cart.filter(i => i.id !== id); updateCartUI(); }
function updateQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) { removeFromCart(id); return; }
  updateCartUI();
}
function clearCart() { state.cart = []; updateCartUI(); }

function updateCartUI() {
  const count = totalItems();
  $$('#cartCount, #cartCountMobile').forEach(el => {
    el.textContent = count;
    el.classList.toggle('hidden', count === 0);
  });
  const cartItemCount = $('#cartItemCount');
  if (cartItemCount) cartItemCount.textContent = `${count} ${count === 1 ? 'producto' : 'productos'}`;
  const cartItems  = $('#cartItems');
  const cartFooter = $('#cartFooter');
  if (state.cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
        <p>Tu carrito está vacío</p><p>¡Agrega algo delicioso! 💕</p>
      </div>`;
    cartFooter.classList.add('hidden');
  } else {
    cartItems.innerHTML = state.cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-price">${fmt(item.price)}</p>
          <div class="cart-item-controls">
            <div class="qty-controls">
              <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Disminuir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Aumentar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            </div>
            <button class="remove-btn" data-id="${item.id}" aria-label="Eliminar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
          </div>
        </div>
      </div>`).join('');
    cartItems.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => updateQty(parseInt(btn.dataset.id), btn.dataset.action === 'inc' ? 1 : -1));
    });
    cartItems.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
    });
    cartFooter.classList.remove('hidden');
  }
  $('#cartSubtotal').textContent = fmt(totalPrice());
  $('#cartTotal').textContent    = fmt(totalPrice());
}

function openCart() {
  state.cartOpen = true;
  $('#cartDrawer').classList.add('open');
  $('#cartOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  state.cartOpen = false;
  $('#cartDrawer').classList.remove('open');
  $('#cartOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

$('#cartBtn').addEventListener('click', openCart);
$('#cartBtnMobile').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);
$('#clearCartBtn').addEventListener('click', clearCart);
$('#checkoutBtn').addEventListener('click', () => { closeCart(); setTimeout(() => openCheckout(), 250); });

// ========== CHECKOUT ==========
function openCheckout() {
  state.checkoutOpen = true;
  state.checkoutStep = 'info';
  state.checkoutForm = { name:'', phone:'', email:'', address:'', zone:'Bucaramanga', deliveryDate:'', notes:'', paymentMethod:'efectivo' };
  $('#checkoutModal').classList.remove('hidden');
  $('#modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderCheckoutStep();
}
function closeCheckout() {
  state.checkoutOpen = false;
  $('#checkoutModal').classList.add('hidden');
  $('#modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
  if (state.checkoutStep === 'confirmation') { clearCart(); state.checkoutStep = 'info'; }
}

$('#closeModal').addEventListener('click', closeCheckout);
$('#modalOverlay').addEventListener('click', closeCheckout);
$('#backBtn').addEventListener('click', () => goToStep('info'));

function goToStep(step) { state.checkoutStep = step; renderCheckoutStep(); }

function renderCheckoutStep() {
  const step = state.checkoutStep;
  const titles    = { info:'Datos de entrega', payment:'Método de pago', confirmation:'¡Pedido confirmado!' };
  const subtitles = { info:'Paso 1 de 2',      payment:'Paso 2 de 2',    confirmation:'Tu pedido está en camino' };
  $('#modalTitle').textContent    = titles[step];
  $('#modalSubtitle').textContent = subtitles[step];
  $('#backBtn').classList.toggle('hidden', step !== 'payment');
  [0,1,2].forEach(i => {
    const filled = (step==='info'&&i===0)||(step==='payment'&&i<=1)||step==='confirmation';
    $(`#prog${i}`).classList.toggle('filled', filled);
  });
  const body   = $('#modalBody');
  const footer = $('#modalFooter');

  if (step === 'info') {
    body.innerHTML = renderInfoStep();
    footer.innerHTML = `<button class="btn-primary btn-full" id="continueBtn" ${!canContinue()?'disabled':''}>Continuar al pago <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></button>`;
    $$('#modalBody input, #modalBody textarea').forEach(input => {
      input.value = state.checkoutForm[input.name] || '';
      input.addEventListener('input', (e) => {
        state.checkoutForm[e.target.name] = e.target.value;
        const btn = $('#continueBtn');
        if (btn) btn.disabled = !canContinue();
      });
    });
    $('#continueBtn').addEventListener('click', () => { if (canContinue()) goToStep('payment'); });
    updateShippingPreview();
  }
  if (step === 'payment') {
    body.innerHTML = renderPaymentStep();
    const shipping = shippingCost();
    footer.innerHTML = `<button class="btn-primary btn-full" id="confirmBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Confirmar pedido — ${fmt(totalPrice()+shipping)}</button>`;
    $$('.payment-method').forEach(btn => {
      btn.addEventListener('click', () => {
        state.checkoutForm.paymentMethod = btn.dataset.method;
        $$('.payment-method').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
    $('#confirmBtn').addEventListener('click', () => goToStep('confirmation'));
  }
  if (step === 'confirmation') {
    body.innerHTML = renderConfirmationStep();
    footer.innerHTML = `<button class="btn-primary btn-full" id="doneBtn">Volver al inicio 💕</button>`;
    $('#doneBtn').addEventListener('click', closeCheckout);
  }
}

function updateShippingPreview() {
  const el = $('#shippingPreview');
  if (!el) return;
  const zone = state.checkoutForm.zone;
  const cost = calcShipping(zone);
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>Envío a <strong>${zone}</strong>: <strong style="color:var(--primary)">${fmt(cost)}</strong>`;
}

function canContinue() {
  const { name, phone, address, zone, deliveryDate } = state.checkoutForm;
  return name.trim() && phone.trim() && address.trim() && zone && deliveryDate;
}

function getMinDate() {
  const d = new Date(); d.setDate(d.getDate()+1);
  return d.toISOString().split('T')[0];
}

function renderInfoStep() {
  const summaryItems = state.cart.map(item => `
    <div class="summary-item">
      <img src="${item.image}" alt="${item.name}" />
      <div class="summary-item-info"><p>${item.name}</p><p>x${item.quantity}</p></div>
      <span class="summary-item-price">${fmt(item.price*item.quantity)}</span>
    </div>`).join('');
  const zones = ['Bucaramanga','Floridablanca','Girón','Piedecuesta'];
  const zoneEmojis = { 'Bucaramanga':'🏙️','Floridablanca':'🌿','Girón':'🏘️','Piedecuesta':'⛰️' };
  return `
    <div class="order-summary">
      <div class="order-summary-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Resumen (${totalItems()} ${totalItems()===1?'producto':'productos'})</div>
      <div class="summary-items">${summaryItems}</div>
    </div>
    <div class="form-group"><div class="input-wrap"><svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><input type="text" name="name" placeholder="Tu nombre completo" /></div></div>
    <div class="form-group"><div class="input-wrap"><svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.19 12.9a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg><input type="tel" name="phone" placeholder="Número de teléfono" /></div></div>
    <div class="form-group"><div class="input-wrap"><svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><input type="email" name="email" placeholder="Correo electrónico (opcional)" /></div></div>
    <div class="form-group">
      <label class="form-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Zona de entrega</label>
      <div class="zone-grid">
        ${zones.map(z=>`<button type="button" class="zone-btn${state.checkoutForm.zone===z?' selected':''}" data-zone="${z}"><span class="zone-emoji">${zoneEmojis[z]}</span><span>${z}</span></button>`).join('')}
      </div>
      <div class="shipping-preview" id="shippingPreview"></div>
    </div>
    <div class="form-group"><div class="input-wrap"><svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg><input type="text" name="address" placeholder="Dirección de entrega" /></div></div>
    <div class="form-group">
      <label class="form-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Fecha del pedido</label>
      <div class="input-wrap"><svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><input type="date" name="deliveryDate" min="${getMinDate()}" /></div>
    </div>
    <div class="form-group"><div class="input-wrap"><svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="top:1rem;transform:none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><textarea name="notes" placeholder="Notas adicionales (opcional)" rows="2" style="padding-left:2.75rem"></textarea></div></div>
  `;
}

function renderPaymentStep() {
  const methods = [
    { value:'efectivo',     label:'Efectivo contra entrega', emoji:'💵', desc:'Paga cuando recibas tu pedido' },
    { value:'transferencia',label:'Transferencia bancaria',  emoji:'🏦', desc:'Te enviaremos los datos por WhatsApp' },
    { value:'nequi',        label:'Nequi / Daviplata',       emoji:'📱', desc:'Pago rápido desde tu celular' },
  ];
  const shipping = shippingCost();
  const zone = state.checkoutForm.zone;
  return `
    <p class="payment-desc">Selecciona cómo deseas pagar:</p>
    ${methods.map(m=>`<button class="payment-method ${state.checkoutForm.paymentMethod===m.value?'selected':''}" data-method="${m.value}"><span class="payment-emoji">${m.emoji}</span><div><p class="payment-label">${m.label}</p><p class="payment-sublabel">${m.desc}</p></div><div class="payment-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div></button>`).join('')}
    <div class="payment-total">
      <div class="payment-total-row"><span>Subtotal</span><span>${fmt(totalPrice())}</span></div>
      <div class="payment-total-row"><span>📍 Envío a ${zone}</span><span style="color:var(--primary);font-weight:600">${fmt(shipping)}</span></div>
      <div class="payment-total-row total"><span>Total</span><span>${fmt(totalPrice()+shipping)}</span></div>
    </div>`;
}

function renderConfirmationStep() {
  const { name, address, zone, paymentMethod, deliveryDate } = state.checkoutForm;
  const methodLabels = { efectivo:'Efectivo', transferencia:'Transferencia', nequi:'Nequi / Daviplata' };
  const shipping = shippingCost();
  const dateStr = deliveryDate
    ? new Date(deliveryDate+'T12:00:00').toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
    : '—';
  return `
    <div class="confirmation-wrap">
      <div class="confirm-icon-outer"><div class="confirm-icon-inner"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div></div>
      <h3>¡Gracias, ${name||'corazón'}! 💕</h3>
      <p>Tu pedido ha sido recibido con mucho amor. Te contactaremos pronto para confirmar los detalles.</p>
      <div class="confirm-details">
        <div class="confirm-details-title"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Detalles del pedido</div>
        <div class="confirm-row"><span>Productos</span><span>${totalItems()}</span></div>
        <div class="confirm-row"><span>Pago</span><span>${methodLabels[paymentMethod]||paymentMethod}</span></div>
        <div class="confirm-row"><span>Zona</span><span>${zone}</span></div>
        <div class="confirm-row"><span>Fecha</span><span style="max-width:12rem;text-align:right">${dateStr}</span></div>
        <div class="confirm-row"><span>Dirección</span><span style="max-width:11rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${address||'—'}</span></div>
        <div class="confirm-row"><span>Envío</span><span>${fmt(shipping)}</span></div>
        <div class="confirm-row total"><span>Total</span><span>${fmt(totalPrice()+shipping)}</span></div>
      </div>
    </div>`;
}

// Zone button delegation
document.addEventListener('click', (e) => {
  const zBtn = e.target.closest('.zone-btn');
  if (!zBtn) return;
  state.checkoutForm.zone = zBtn.dataset.zone;
  $$('.zone-btn').forEach(b => b.classList.remove('selected'));
  zBtn.classList.add('selected');
  updateShippingPreview();
  const btn = $('#continueBtn');
  if (btn) btn.disabled = !canContinue();
});

updateCartUI();
