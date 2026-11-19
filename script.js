/* ==========================================================================
   ECLIPSE STORE — SCRIPT.JS (STREETWEAR ONLY + PERSONALIZED TRY-ON)
   ========================================================================== */

const state = {
  cart: JSON.parse(localStorage.getItem('eclipse_cart_v2') || '[]'),
  currentCategory: 'all',
  activeProduct: null,
  activeLook: {
    color: '',
    fit: '',
    view: 'Front',
    mood: ''
  }
};

// ==========================================================================
// 1. STREETWEAR-ONLY PRODUCTS DATABASE
// ==========================================================================

const PRODUCTS_DATA = {
  'karan-001': {
    id: 'karan-001',
    name: 'Karan Aujla Signature Tee',
    drop: 'DROP 001 · SIGNATURE OVERSIZED',
    category: 'tees',
    desc: 'Heavyweight 240+ GSM combed french terry cotton. Handwritten script chest signature with vintage luxury car back print graphic.',
    price: 999,
    colors: [
      { name: 'Vintage Black', hex: '#111111' },
      { name: 'Bone White', hex: '#f4f3ef' }
    ],
    fits: ['Regular', 'Oversized'],
    defaultColor: 'Vintage Black',
    defaultFit: 'Oversized',
    views: {
      'Vintage Black': {
        Front: 'karan-front.jpg',
        Side: 'karan-side.jpg',
        Back: 'karan-back.png'
      },
      'Bone White': {
        Front: 'karan-white-front.jpg',
        Side: 'karan-side.jpg',
        Back: 'karan-white-back.jpg'
      }
    },
    moods: [
      { id: 'Deadpan', label: 'Deadpan', img: 'karan-front.jpg' },
      { id: 'Street', label: 'Street', img: 'karan-side.jpg' },
      { id: 'Detail', label: 'Detail', img: 'karan-front.jpg' }
    ]
  },
  'karan-white': {
    id: 'karan-white',
    name: 'Karan Signature Tee (Bone White)',
    drop: 'DROP 001 · BONE WHITE EDITION',
    category: 'tees',
    desc: 'Off-white combed heavyweight cotton with contrasting black handwritten script signature and monochrome back artwork.',
    price: 999,
    colors: [
      { name: 'Bone White', hex: '#f4f3ef' },
      { name: 'Vintage Black', hex: '#111111' }
    ],
    fits: ['Regular', 'Oversized'],
    defaultColor: 'Bone White',
    defaultFit: 'Oversized',
    views: {
      'Bone White': {
        Front: 'karan-white-front.jpg',
        Side: 'karan-side.jpg',
        Back: 'karan-white-back.jpg'
      },
      'Vintage Black': {
        Front: 'karan-front.jpg',
        Side: 'karan-side.jpg',
        Back: 'karan-back.png'
      }
    },
    moods: [
      { id: 'Deadpan', label: 'Deadpan', img: 'karan-white-front.jpg' },
      { id: 'Street', label: 'Street', img: 'karan-side.jpg' },
      { id: 'Detail', label: 'Detail', img: 'karan-white-front.jpg' }
    ]
  },
  'jogger-003': {
    id: 'jogger-003',
    name: 'Signature Streetwear Jogger',
    drop: 'DROP 003 · THE JOGGER',
    category: 'joggers',
    desc: 'Heavyweight 320+ GSM brushed cotton fleece. Deep functional streetwear pockets, ribbed cuffs, and relaxed athletic drape.',
    price: 1199,
    colors: [
      { name: 'Obsidian Black', hex: '#111111' },
      { name: 'Street Slate', hex: '#374151' }
    ],
    fits: ['Relaxed Fit', 'Stacked Fit'],
    defaultColor: 'Obsidian Black',
    defaultFit: 'Relaxed Fit',
    views: {
      'Obsidian Black': {
        Front: 'eclipse-jogger-1.jpg',
        Side: 'eclipse-jogger-2.jpg',
        Back: 'eclipse-jogger-3.jpg'
      },
      'Street Slate': {
        Front: 'eclipse-jogger-2.jpg',
        Side: 'eclipse-jogger-1.jpg',
        Back: 'eclipse-jogger-3.jpg'
      }
    },
    moods: [
      { id: 'Motion', label: 'Motion', img: 'eclipse-jogger-1.jpg' },
      { id: 'Stance', label: 'Stance', img: 'eclipse-jogger-2.jpg' },
      { id: 'Detail', label: 'Detail', img: 'eclipse-jogger-3.jpg' }
    ]
  },
  'karan-dream': {
    id: 'karan-dream',
    name: '"It Was All A Dream" Back Edition',
    drop: 'DROP 001 · GRAPHIC BACK PRINT',
    category: 'tees',
    desc: 'Feature back piece showcasing the iconic vintage Lamborghini luxury car illustration and bold street typography.',
    price: 999,
    colors: [
      { name: 'Vintage Black', hex: '#111111' },
      { name: 'Bone White', hex: '#f4f3ef' }
    ],
    fits: ['Oversized', 'Regular'],
    defaultColor: 'Vintage Black',
    defaultFit: 'Oversized',
    views: {
      'Vintage Black': {
        Front: 'karan-back.png',
        Side: 'karan-side.jpg',
        Back: 'karan-front.jpg'
      },
      'Bone White': {
        Front: 'karan-white-back.jpg',
        Side: 'karan-side.jpg',
        Back: 'karan-white-front.jpg'
      }
    },
    moods: [
      { id: 'Back Art', label: 'Back Art', img: 'karan-back.png' },
      { id: 'Street', label: 'Street', img: 'karan-side.jpg' },
      { id: 'Front View', label: 'Front', img: 'karan-front.jpg' }
    ]
  }
};

// ==========================================================================
// 2. OPEN PERSONALIZED TRY-ON STUDIO
// ==========================================================================

function openProductTryOn(productId) {
  const prod = PRODUCTS_DATA[productId] || PRODUCTS_DATA['karan-001'];
  state.activeProduct = prod;
  state.activeLook = {
    color: prod.defaultColor,
    fit: prod.defaultFit,
    view: 'Front',
    mood: prod.moods[0].id
  };

  document.getElementById('studioProductTag').textContent = prod.drop;
  document.getElementById('studioMainTitle').textContent = prod.name;
  document.getElementById('studioDesc').textContent = prod.desc;
  document.getElementById('studioPrice').textContent = `₹${prod.price}`;

  // Swatches
  const swatchContainer = document.getElementById('studioSwatchContainer');
  document.getElementById('studioColorDisplay').textContent = prod.defaultColor;
  swatchContainer.innerHTML = prod.colors.map((c, i) => `
    <button class="studio-swatch ${i === 0 ? 'active' : ''}"
            style="background: ${c.hex}; border: 1px solid #ccc;"
            onclick="setStudioColor('${c.name}', this)"
            aria-label="${c.name}"></button>
  `).join('');

  // Fits
  const fitContainer = document.getElementById('studioFitContainer');
  document.getElementById('studioFitDisplay').textContent = prod.defaultFit;
  fitContainer.innerHTML = prod.fits.map((f, i) => `
    <button class="fit-btn-pill ${i === 1 || prod.fits.length === 1 ? 'active' : ''}"
            onclick="setStudioFit('${f}', this)">${f}</button>
  `).join('');

  // Moods
  const moodContainer = document.getElementById('studioMoodContainer');
  document.getElementById('studioMoodDisplay').textContent = prod.moods[0].label;
  moodContainer.innerHTML = prod.moods.map((m, i) => `
    <div class="studio-mood-card ${i === 0 ? 'active' : ''}" onclick="setStudioMood('${m.id}', this)">
      <div class="studio-mood-thumb">
        <img src="${m.img}" alt="${m.label}" />
      </div>
      <span class="studio-mood-label">${m.label}</span>
    </div>
  `).join('');

  // View reset
  document.querySelectorAll('.view-btn-pill').forEach(b => b.classList.remove('active'));
  document.querySelector('.view-btn-pill[data-view="Front"]')?.classList.add('active');
  document.getElementById('studioViewDisplay').textContent = 'Front';

  renderStudioModel();
  updateStudioSummary();

  document.getElementById('tryonStudioOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProductTryOn() {
  document.getElementById('tryonStudioOverlay')?.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function setStudioColor(colorName, el) {
  state.activeLook.color = colorName;
  document.getElementById('studioColorDisplay').textContent = colorName;
  document.querySelectorAll('.studio-swatch').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');
  renderStudioModel();
  updateStudioSummary();
  showToast(`Color: ${colorName}`);
}

function setStudioFit(fitName, el) {
  state.activeLook.fit = fitName;
  document.getElementById('studioFitDisplay').textContent = fitName;
  document.querySelectorAll('.fit-btn-pill').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  updateStudioSummary();
  showToast(`Fit: ${fitName}`);
}

function setStudioView(viewName, el) {
  state.activeLook.view = viewName;
  document.getElementById('studioViewDisplay').textContent = viewName;
  document.querySelectorAll('.view-btn-pill').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderStudioModel();
  updateStudioSummary();
}

function setStudioMood(moodId, el) {
  state.activeLook.mood = moodId;
  document.getElementById('studioMoodDisplay').textContent = moodId;
  document.querySelectorAll('.studio-mood-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  updateStudioSummary();
}

function renderStudioModel() {
  const prod = state.activeProduct;
  const modelImg = document.getElementById('studioModelImg');
  if (!prod || !modelImg) return;

  const colorViews = prod.views[state.activeLook.color] || prod.views[prod.defaultColor];
  const imgSrc = colorViews[state.activeLook.view] || colorViews['Front'];

  modelImg.classList.add('fade-out');
  setTimeout(() => {
    modelImg.src = imgSrc;
    modelImg.alt = `${prod.name} ${state.activeLook.color} ${state.activeLook.view}`;
    modelImg.classList.remove('fade-out');
  }, 160);
}

function updateStudioSummary() {
  const summary = document.getElementById('studioLookSummary');
  if (summary && state.activeLook) {
    summary.textContent = `${state.activeLook.color} · ${state.activeLook.fit} · ${state.activeLook.view} · ${state.activeLook.mood}`;
  }
}

function addStudioLookToCart() {
  const prod = state.activeProduct;
  if (!prod) return;

  const colorViews = prod.views[state.activeLook.color] || prod.views[prod.defaultColor];
  const imgSrc = colorViews[state.activeLook.view] || colorViews['Front'];

  addToCart({
    id: `${prod.id}-${state.activeLook.color}-${state.activeLook.fit}`.toLowerCase().replace(/\s+/g, '-'),
    name: prod.name,
    meta: `${state.activeLook.color} · ${state.activeLook.fit}`,
    price: prod.price,
    img: imgSrc,
    qty: 1
  });

  closeProductTryOn();
  openCartDrawer();
  showToast(`✦ Added ${prod.name} to Bag!`);
}

// ==========================================================================
// 3. CATEGORY FILTERS
// ==========================================================================

function filterCategory(cat, el) {
  state.currentCategory = cat;
  document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');

  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-cat');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// ==========================================================================
// 4. CART & DRAWER
// ==========================================================================

function addToCart(product) {
  const existing = state.cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push(product);
  }
  saveCart();
  renderCart();
  updateCartBadge();
}

function updateQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
  updateCartBadge();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('eclipse_cart_v2', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartBadgeCount');
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('drawerSubtotal');
  const meterText = document.getElementById('shippingMeterText');
  const meterFill = document.getElementById('shippingMeterFill');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size: 40px; margin-bottom: 12px;">🛍️</div>
        <p style="font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 6px;">Your Bag is Empty</p>
        <p style="font-size: 13px;">Click on any product to try it on and configure your look.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (meterText) meterText.textContent = 'Free Shipping on orders above ₹1,499';
    if (meterFill) meterFill.style.width = '0%';
    return;
  }

  let subtotal = 0;
  container.innerHTML = state.cart.map(item => {
    subtotal += item.price * item.qty;
    return `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.meta || 'Drop Collection'}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; background: #f1f3f5; border-radius: 20px; padding: 2px 10px;">
              <button onclick="updateQty('${item.id}', -1)" style="font-size: 14px; font-weight: 700;">-</button>
              <span style="font-size: 13px; font-weight: 700; min-width: 16px; text-align: center;">${item.qty}</span>
              <button onclick="updateQty('${item.id}', 1)" style="font-size: 14px; font-weight: 700;">+</button>
            </div>
            <div class="cart-item-price">₹${item.price * item.qty}</div>
          </div>
        </div>
        <button onclick="removeFromCart('${item.id}')" style="color: var(--text-muted); font-size: 16px;">✕</button>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  const freeThreshold = 1499;
  if (subtotal >= freeThreshold) {
    if (meterText) meterText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked Free Express Shipping!`;
    if (meterFill) meterFill.style.width = '100%';
  } else {
    const diff = freeThreshold - subtotal;
    const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
    if (meterText) meterText.innerHTML = `Add <strong>₹${diff}</strong> more to unlock <strong>Free Express Shipping</strong>`;
    if (meterFill) meterFill.style.width = `${pct}%`;
  }
}

function openCartDrawer() {
  document.getElementById('cartDrawerOverlay')?.classList.add('active');
  document.getElementById('cartDrawer')?.classList.add('active');
  renderCart();
}

function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay')?.classList.remove('active');
  document.getElementById('cartDrawer')?.classList.remove('active');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const pos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: pos, behavior: 'smooth' });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 2500);
}

function openVideoModal() {
  alert("✦ ECLIPSE CAMPAIGN FILM\n\nModel: Karan Aujla Signature Edition\nDrop: 001 & 003\nFabric: 240+ GSM Combed French Terry\n\n(Full campaign teaser loaded!)");
}

function triggerCheckout() {
  if (state.cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  const total = state.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const orderId = 'ECL' + Math.floor(100000 + Math.random() * 900000);
  const confirmed = confirm(`Proceed to Checkout for ₹${total}?\n\nOrder Ref: ${orderId}\nPayment: 1-Click UPI / COD Pan-India`);
  if (confirmed) {
    state.cart = [];
    saveCart();
    renderCart();
    updateCartBadge();
    closeCartDrawer();
    alert(`🎉 Order Placed Successfully!\n\nOrder ID: ${orderId}\nWe have sent tracking details to your registered number.`);
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductTryOn();
    closeCartDrawer();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
});
