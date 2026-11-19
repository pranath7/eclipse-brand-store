/* ==========================================================================
   ECLIPSE STORE — SCRIPT.JS (AUJLA SZN 1 OFFICIAL DROP CONTROLLER)
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
// 1. PRODUCTS DATABASE (OFFICIAL AUJLA SZN 1 + JOGGER 003)
// ==========================================================================

const PRODUCTS_DATA = {
  'karan-001': {
    id: 'karan-001',
    name: 'AUJLA SZN 1 Signature Tee',
    drop: 'OFFICIAL DROP · AUJLA SZN 1',
    category: 'tees',
    desc: 'Heavyweight 240+ GSM combed cotton in Mocha Tan. Features luxury embroidered KA chest monogram and high-density "AUJLA SZN 1" Lamborghini Estate back graphic.',
    price: 999,
    colors: [
      { name: 'Mocha Tan', hex: '#b3946b' },
      { name: 'Vintage Black', hex: '#111111' }
    ],
    fits: ['Regular', 'Oversized'],
    defaultColor: 'Mocha Tan',
    defaultFit: 'Oversized',
    views: {
      'Mocha Tan': {
        Front: 'karan-szn1-front.jpg',
        Side: 'karan-side.jpg',
        Back: 'karan-szn1-back.png'
      },
      'Vintage Black': {
        Front: 'karan-front.jpg',
        Side: 'karan-side.jpg',
        Back: 'karan-back.png'
      }
    },
    moods: [
      { id: 'Front Stance', label: 'Front KA', img: 'karan-szn1-front.jpg' },
      { id: 'Back Artwork', label: 'Back Art', img: 'karan-szn1-back.png' },
      { id: 'Side Profile', label: 'Side Profile', img: 'karan-side.jpg' }
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
  }
};

// ==========================================================================
// 2. OPEN PERSONALIZED TRY-ON STUDIO
// ==========================================================================

function openProductTryOn(productId, initialView) {
  const prod = PRODUCTS_DATA[productId] || PRODUCTS_DATA['karan-001'];
  state.activeProduct = prod;
  const viewToUse = initialView || (productId === 'karan-001' ? 'Back' : 'Front');
  state.activeLook = {
    color: prod.defaultColor,
    fit: prod.defaultFit,
    size: 'L',
    view: viewToUse,
    mood: (productId === 'karan-001' && viewToUse === 'Back') ? 'Back Artwork' : prod.moods[0].id
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

  // Size reset
  document.querySelectorAll('.size-btn-pill').forEach(b => b.classList.remove('active'));
  document.querySelector('.size-btn-pill[data-size="L"]')?.classList.add('active');
  const sizeDisp = document.getElementById('studioSizeDisplay');
  if (sizeDisp) sizeDisp.textContent = 'L';

  // View reset
  document.querySelectorAll('.view-btn-pill').forEach(b => b.classList.remove('active'));
  document.querySelector(`.view-btn-pill[data-view="${viewToUse}"]`)?.classList.add('active');
  document.getElementById('studioViewDisplay').textContent = viewToUse;

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

function setStudioSize(sizeName, el) {
  state.activeLook.size = sizeName;
  const disp = document.getElementById('studioSizeDisplay');
  if (disp) disp.textContent = sizeName;
  document.querySelectorAll('.size-btn-pill').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  updateStudioSummary();
  showToast(`Size: ${sizeName}`);
}

function setStudioView(viewName, el) {
  state.activeLook.view = viewName;
  document.getElementById('studioViewDisplay').textContent = viewName;
  document.querySelectorAll('.view-btn-pill').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderStudioModel();
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
    summary.textContent = `${state.activeLook.color} · ${state.activeLook.fit} · Size ${state.activeLook.size || 'L'} · ${state.activeLook.view}`;
  }
}

function addStudioLookToCart() {
  const prod = state.activeProduct;
  if (!prod) return;

  const colorViews = prod.views[state.activeLook.color] || prod.views[prod.defaultColor];
  const imgSrc = colorViews[state.activeLook.view] || colorViews['Front'];
  const size = state.activeLook.size || 'L';

  addToCart({
    id: `${prod.id}-${state.activeLook.color}-${state.activeLook.fit}-${size}`.toLowerCase().replace(/\s+/g, '-'),
    name: prod.name,
    meta: `${state.activeLook.color} · ${state.activeLook.fit} · Size ${size}`,
    price: prod.price,
    img: imgSrc,
    qty: 1
  });

  closeProductTryOn();
  openCartDrawer();
  showToast(`✦ Added ${prod.name} (Size ${size}) to Bag!`);
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

function quickAddToCart(productId) {
  const prod = PRODUCTS_DATA[productId] || PRODUCTS_DATA['karan-001'];
  const defaultImg = prod.views[prod.defaultColor]?.Back || prod.views[prod.defaultColor]?.Front || 'karan-szn1-back.png';
  addToCart({
    id: `${prod.id}-${prod.defaultColor}-${prod.defaultFit}`.toLowerCase().replace(/\s+/g, '-'),
    name: prod.name,
    meta: `${prod.defaultColor} · ${prod.defaultFit}`,
    price: prod.price,
    img: defaultImg,
    qty: 1
  });
  openCartDrawer();
  showToast(`✦ Added ${prod.name} to Bag!`);
}

const bundleSelectionState = {
  teeSize: 'L',
  joggerSize: 'M'
};

function selectBundleSize(type, size, buttonEl) {
  if (type === 'tee') {
    bundleSelectionState.teeSize = size;
    const labelEl = document.getElementById('selectedTeeSizeLabel');
    if (labelEl) {
      const fitNote = (size === 'L' || size === 'XL' || size === 'XXL') ? 'Oversized' : 'Standard Fit';
      labelEl.textContent = `${size} (${fitNote})`;
    }
    document.querySelectorAll('#bundleTeeChips .bundle-size-chip').forEach(btn => btn.classList.remove('active'));
    if (buttonEl) buttonEl.classList.add('active');
  } else if (type === 'jogger') {
    bundleSelectionState.joggerSize = size;
    const labelEl = document.getElementById('selectedJoggerSizeLabel');
    if (labelEl) {
      const fitNote = (size === 'M' || size === 'L') ? 'Relaxed' : 'Comfort Fit';
      labelEl.textContent = `${size} (${fitNote})`;
    }
    document.querySelectorAll('#bundleJoggerChips .bundle-size-chip').forEach(btn => btn.classList.remove('active'));
    if (buttonEl) buttonEl.classList.add('active');
  }
}

function buyFullBundle() {
  const teeSize = bundleSelectionState.teeSize || 'L';
  const joggerSize = bundleSelectionState.joggerSize || 'M';
  const bundleId = `bundle-szn1-tee-${teeSize}-jogger-${joggerSize}`.toLowerCase();
  
  addToCart({
    id: bundleId,
    name: 'AUJLA SZN 1 Uniform Set',
    meta: `Tee: Mocha Tan (Size ${teeSize}) + Jogger: Obsidian Black (Size ${joggerSize})`,
    price: 1999,
    img: 'karan-szn1-card.jpg',
    qty: 1,
    isBundle: true
  });
  
  openCartDrawer();
  showToast(`⚡ AUJLA SZN 1 Set (Tee: ${teeSize} + Jogger: ${joggerSize}) Added to Bag!`);
}

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
        <p style="font-size: 13px;">Experience AUJLA SZN 1 in our Try-On studio.</p>
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
          <div class="cart-item-meta">${item.meta || 'AUJLA SZN 1'}</div>
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

  // Auto Bundle Savings if customer added 1 Tee & 1 Jogger individually
  const teesCount = state.cart.filter(i => (i.id.includes('karan-001') || i.name.toLowerCase().includes('tee')) && !i.isBundle).reduce((s, i) => s + i.qty, 0);
  const joggersCount = state.cart.filter(i => (i.id.includes('jogger-003') || i.name.toLowerCase().includes('jogger')) && !i.isBundle).reduce((s, i) => s + i.qty, 0);
  const bundlePairs = Math.min(teesCount, joggersCount);
  const bundleDiscount = bundlePairs * 199;
  const netSubtotal = Math.max(0, subtotal - bundleDiscount);

  if (subtotalEl) {
    if (bundleDiscount > 0) {
      subtotalEl.innerHTML = `₹${netSubtotal} <span style="font-size: 12px; color: #16a34a; font-weight: 700; display: block;">⚡ Saved ₹${bundleDiscount} (Bundle Deal ₹1,999)</span>`;
    } else {
      subtotalEl.textContent = `₹${subtotal}`;
    }
  }

  const freeThreshold = 1499;
  if (netSubtotal >= freeThreshold) {
    if (meterText) meterText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked Free Express Shipping!`;
    if (meterFill) meterFill.style.width = '100%';
  } else {
    const diff = freeThreshold - netSubtotal;
    const pct = Math.min(100, Math.round((netSubtotal / freeThreshold) * 100));
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
  alert("✦ AUJLA SZN 1 CAMPAIGN FILM\n\nOfficial Karan Aujla Drop\nPiece: Luxury Embroidered KA Monogram Tee\nArt: Lamborghini Estate Edition\nFabric: 240+ GSM Heavyweight Combed Cotton\n\n(Full campaign teaser loaded!)");
}

function triggerCheckout() {
  if (state.cart.length === 0) {
    showToast('Your bag is empty! Add an item to proceed.');
    return;
  }
  // Navigate directly to dedicated WhatsApp Checkout Page
  window.location.href = 'checkout.html';
}

function toggleMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const toggleBtn = document.getElementById('mobileNavToggle');
  if (drawer) {
    const isActive = drawer.classList.toggle('active');
    if (toggleBtn) toggleBtn.classList.toggle('open', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductTryOn();
    closeCartDrawer();
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer && drawer.classList.contains('active')) {
      toggleMobileNav();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
});
