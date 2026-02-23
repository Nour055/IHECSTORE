/* ============================================================
   IHEC NEWS STORE — JavaScript.js
   Cart, filter tabs, toast, drawer
   ============================================================ */

// ── STATE ────────────────────────────────────────────────
let cart = [];

// ── DOM SETUP ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createCartDrawer();
  updateCartCount();
});

// ── CART DRAWER ──────────────────────────────────────────
function createCartDrawer() {
  const overlay = document.createElement('div');
  overlay.id = 'cartOverlay';
  overlay.onclick = closeCart;
  document.body.appendChild(overlay);

  const drawer = document.createElement('div');
  drawer.id = 'cartDrawer';
  drawer.innerHTML = `
    <div class="drawer-header">
      <h3>Votre panier</h3>
      <button class="drawer-close" onclick="closeCart()">✕</button>
    </div>
    <div class="drawer-items" id="drawerItems"></div>
    <div class="drawer-footer" id="drawerFooter" style="display:none">
      <div class="drawer-total">
        <span>Total</span>
        <span id="drawerTotal">0 DT</span>
      </div>
      <button class="btn-checkout" onclick="handleCheckout()">
        Commander →
      </button>
    </div>
  `;
  document.body.appendChild(drawer);

  // Open cart on nav button click
  document.querySelector('.nav-cart').addEventListener('click', openCart);
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const container = document.getElementById('drawerItems');
  const footer    = document.getElementById('drawerFooter');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.3">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.63.63-.18 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <p>Votre panier est vide.</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-icon">
        ${item.icon}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price} DT × ${item.qty}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${i}, +1)">+</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('drawerTotal').textContent = total + ' DT';
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = total;
}

function handleCheckout() {
  showToast('📩 Commande envoyée ! Nous vous contacterons bientôt.');
  cart = [];
  updateCartCount();
  closeCart();
}

// ── ADD TO CART ──────────────────────────────────────────
function addToCart(btn) {
  // Find product info from card
  const card = btn.closest('.card, .hero-card');

  let name, priceText, iconHTML;

  if (card.classList.contains('hero-card')) {
    name      = card.querySelector('.hero-card-name')?.textContent || 'Article';
    priceText = card.querySelector('.hero-card-price')?.textContent || '0';
    iconHTML  = `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.3" width="24" height="24" stroke="rgba(255,255,255,.6)">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
    </svg>`;
  } else {
    name      = card.querySelector('.card-name')?.textContent || 'Article';
    priceText = card.querySelector('.card-price')?.textContent || '0';
    iconHTML  = card.querySelector('.card-icon')?.innerHTML || '';
  }

  const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

  // Check if already in cart
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, icon: iconHTML });
  }

  updateCartCount();
  showToast(`✓ "${name}" ajouté au panier`);

  // Button feedback
  const original = btn.textContent;
  btn.textContent = '✓ Ajouté';
  btn.classList.add('added');
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('added');
  }, 1400);
}

// ── FILTER TABS ──────────────────────────────────────────
function filter(tabEl, cat) {
  // Update active tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  // Show/hide cards
  document.querySelectorAll('.card').forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.classList.remove('hidden');
      card.style.animation = 'fadeInUp .3s ease both';
    } else {
      card.classList.add('hidden');
    }
  });
}

// ── TOAST ────────────────────────────────────────────────
let toastTimer;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── NAV SCROLL EFFECT ────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (!nav) return;
  if (window.scrollY > 30) {
    nav.style.boxShadow = '0 4px 30px rgba(13,27,62,.4)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

// ── FADE-IN ON SCROLL ─────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.card, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .4s ease, transform .4s ease';
  observer.observe(el);
});
