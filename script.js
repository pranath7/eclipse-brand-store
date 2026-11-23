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
        Front: 'hero-szn1-cutout.png',
        Side: 'karan-side-mocha-cutout.png',
        Back: 'hero-szn1-back-cutout.png'
      },
      'Vintage Black': {
        Front: 'karan-black-front-cutout.png',
        Side: 'karan-side-cutout.png',
        Back: 'karan-black-back-cutout.png'
      }
    },
    moods: [
      { id: 'Back Artwork', label: 'Back (Art)', img: 'hero-szn1-back-cutout.png' },
      { id: 'Front Stance', label: 'Front (KA)', img: 'hero-szn1-cutout.png' }
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
        Back: 'eclipse-jogger-3.jpg'
      },
      'Street Slate': {
        Front: 'eclipse-jogger-2.jpg',
        Back: 'eclipse-jogger-3.jpg'
      }
    },
    moods: [
      { id: 'Front Stance', label: 'Front', img: 'eclipse-jogger-1.jpg' },
      { id: 'Back View', label: 'Back', img: 'eclipse-jogger-3.jpg' }
    ]
  }
};

// ==========================================================================
// 2. OPEN PERSONALIZED TRY-ON STUDIO
// ==========================================================================

function openProductTryOn(productId, initialView) {
  const prod = PRODUCTS_DATA[productId] || PRODUCTS_DATA['karan-001'];
  state.activeProduct = prod;
  let viewToUse = initialView || (productId === 'karan-001' ? 'Back' : 'Front');
  if (viewToUse === 'Side') {
    viewToUse = (productId === 'karan-001' ? 'Back' : 'Front');
  }
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
  const studioPriceEl = document.getElementById('studioPrice');
  if (studioPriceEl) {
    studioPriceEl.innerHTML = `
      <span class="lock-glyph">🔒</span>
      <span class="classified-txt">PRICE CLASSIFIED</span>
      <span class="classified-sub">REVEALS DEC 1</span>
    `;
  }

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

  // Dynamic View Buttons for Tee vs Jogger (Side view removed per brand specification)
  const viewToggle = document.getElementById('studioViewToggle');
  if (viewToggle) {
    if (prod.id === 'karan-001') {
      viewToggle.innerHTML = `
        <button class="view-btn-pill ${viewToUse === 'Back' ? 'active' : ''}" data-view="Back" onclick="setStudioView('Back', this)">Back (Art)</button>
        <button class="view-btn-pill ${viewToUse === 'Front' ? 'active' : ''}" data-view="Front" onclick="setStudioView('Front', this)">Front (KA)</button>
      `;
    } else {
      viewToggle.innerHTML = `
        <button class="view-btn-pill ${viewToUse === 'Front' ? 'active' : ''}" data-view="Front" onclick="setStudioView('Front', this)">Front</button>
        <button class="view-btn-pill ${viewToUse === 'Back' ? 'active' : ''}" data-view="Back" onclick="setStudioView('Back', this)">Back</button>
      `;
    }
  }

  // View reset
  document.querySelectorAll('.view-btn-pill').forEach(b => b.classList.remove('active'));
  document.querySelector(`.view-btn-pill[data-view="${viewToUse}"]`)?.classList.add('active');
  document.getElementById('studioViewDisplay').textContent = viewToUse;

  // Initialize 3D Parallax Tilt Handler on the Studio Stage
  initStudio3DTilt();

  renderStudioModel();
  updateStudioSummary();

  document.getElementById('tryonStudioOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// 3D Parallax Hover for Floating Model
function initStudio3DTilt() {
  const stage = document.getElementById('studioCenterStage');
  const floatWrap = document.getElementById('studioFloatWrap');
  if (!stage || !floatWrap || stage.dataset.tiltInitialized) return;

  stage.dataset.tiltInitialized = 'true';

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    floatWrap.style.transform = `perspective(1000px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg) translateY(-8px)`;
  });

  stage.addEventListener('mouseleave', () => {
    floatWrap.style.transform = '';
  });
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
  const imgSrc = colorViews[state.activeLook.view] || colorViews['Front'] || colorViews['Back'];

  const floorShadow = document.querySelector('.studio-floor-shadow');
  if (prod.id === 'jogger-003') {
    modelImg.classList.add('is-full-photo');
    if (floorShadow) floorShadow.style.opacity = '0';
  } else {
    modelImg.classList.remove('is-full-photo');
    if (floorShadow) floorShadow.style.opacity = '';
  }

  modelImg.classList.add('fade-out');
  setTimeout(() => {
    modelImg.src = imgSrc;
    modelImg.alt = `${prod.name} ${state.activeLook.color} ${state.activeLook.view}`;
    modelImg.classList.remove('fade-out');
  }, 160);

  // Update 3D Floating Badge
  const badgeText = document.getElementById('studio3dBadgeText');
  if (badgeText) {
    const v = state.activeLook.view;
    let label = v;
    if (prod.id === 'karan-001') {
      label = v === 'Back' ? 'BACK ARTWORK' : 'FRONT KA';
      badgeText.textContent = `3D FLOAT · ${label} (${state.activeLook.color.toUpperCase()})`;
    } else {
      label = v === 'Front' ? 'FRONT STANCE' : 'BACK VIEW';
      badgeText.textContent = `HIGH-RES VIEW · ${label} (${state.activeLook.color.toUpperCase()})`;
    }
  }
}

function updateStudioSummary() {
  const summary = document.getElementById('studioLookSummary');
  const mobileSummary = document.getElementById('studioMobileLookSummary');
  if (state.activeLook) {
    const text = `${state.activeLook.color} · ${state.activeLook.fit} · Size ${state.activeLook.size || 'L'} · ${state.activeLook.view}`;
    if (summary) summary.textContent = text;
    if (mobileSummary) mobileSummary.textContent = text;
  }
}

function addStudioLookToCart() {
  openVipFromStudio();
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
  openVipModal(productId);
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
  openVipModal('bundle');
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

function updateCartBadge() {}

function renderCart() {}

function openCartDrawer() {
  openVipModal('karan-001');
}

function closeCartDrawer() {}

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

function triggerCheckout() {
  openVipModal('karan-001');
}

function toggleMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const toggleBtn = document.getElementById('mobileNavToggle');
  if (drawer) {
    const isActive = drawer.classList.toggle('active');
    if (toggleBtn) toggleBtn.classList.toggle('open', isActive);
    drawer.setAttribute('aria-hidden', !isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
  }
}

function navigateMobileNav(targetId) {
  toggleMobileNav();
  if (targetId) {
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  }
}

// ==========================================================================
// 8. PRE-LAUNCH COUNTDOWN TIMER (DECEMBER 1ST, 2026 DROP)
// ==========================================================================

const DROP_DATE = new Date('2026-12-01T00:00:00+05:30').getTime();

function updateDropCountdown() {
  const now = new Date().getTime();
  const diff = DROP_DATE - now;

  let days = 0, hours = 0, mins = 0, secs = 0;
  if (diff > 0) {
    days = Math.floor(diff / (1000 * 60 * 60 * 24));
    hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    mins = Math.floor((diff / (1000 * 60)) % 60);
    secs = Math.floor((diff / 1000) % 60);
  }

  const dStr = String(days).padStart(2, '0');
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(mins).padStart(2, '0');
  const sStr = String(secs).padStart(2, '0');

  // Navbar ticker
  const navD = document.getElementById('navDays');
  const navH = document.getElementById('navHours');
  const navM = document.getElementById('navMins');
  const navS = document.getElementById('navSecs');
  if (navD) navD.textContent = dStr;
  if (navH) navH.textContent = hStr;
  if (navM) navM.textContent = mStr;
  if (navS) navS.textContent = sStr;

  // Hero Countdown Cards
  const heroD = document.getElementById('heroDays');
  const heroH = document.getElementById('heroHours');
  const heroM = document.getElementById('heroMins');
  const heroS = document.getElementById('heroSecs');
  if (heroD) heroD.textContent = dStr;
  if (heroH) heroH.textContent = hStr;
  if (heroM) heroM.textContent = mStr;
  if (heroS) heroS.textContent = sStr;

  // Modal Countdown
  const modalD = document.getElementById('modalDays');
  const modalH = document.getElementById('modalHours');
  const modalM = document.getElementById('modalMins');
  const modalS = document.getElementById('modalSecs');
  if (modalD) modalD.textContent = dStr;
  if (modalH) modalH.textContent = hStr;
  if (modalM) modalM.textContent = mStr;
  if (modalS) modalS.textContent = sStr;
}

// ==========================================================================
// 9. VIP EARLY ACCESS PASS MODAL HANDLER
// ==========================================================================

let currentVipItem = {
  id: 'karan-001',
  name: 'AUJLA SZN 1 Signature Tee',
  drop: 'OFFICIAL DROP // AUJLA SZN 1',
  meta: 'Mocha Tan · Size L · 🔒 Price Unlocks Dec 1',
  img: 'hero-szn1-back-cutout.png',
  size: 'L'
};

function openVipModal(itemId) {
  if (itemId === 'bundle') {
    const teeSize = bundleSelectionState.teeSize || 'L';
    const joggerSize = bundleSelectionState.joggerSize || 'M';
    currentVipItem = {
      id: 'bundle',
      name: 'THE AUJLA SZN 1 UNIFORM (2-PIECE)',
      drop: 'OFFICIAL DROP BUNDLE // 2-PIECE SET',
      meta: `Tee: Size ${teeSize} · Jogger: Size ${joggerSize} · 🔒 VIP Pricing Unlocks Dec 1`,
      img: 'karan-szn1-card.jpg',
      size: `${teeSize} (Tee) / ${joggerSize} (Jogger)`
    };
  } else if (itemId === 'jogger-003') {
    currentVipItem = {
      id: 'jogger-003',
      name: 'Signature Streetwear Jogger',
      drop: 'DROP 003 // SIGNATURE JOGGERS',
      meta: 'Obsidian Black · Size L · 🔒 Price Unlocks Dec 1',
      img: 'eclipse-jogger-card.jpg',
      size: 'L'
    };
  } else {
    currentVipItem = {
      id: 'karan-001',
      name: 'AUJLA SZN 1 Signature Tee',
      drop: 'OFFICIAL DROP // AUJLA SZN 1',
      meta: 'Mocha Tan · Size L · 🔒 Price Unlocks Dec 1',
      img: 'hero-szn1-back-cutout.png',
      size: 'L'
    };
  }

  const imgEl = document.getElementById('vipItemImg');
  const dropEl = document.getElementById('vipItemDrop');
  const nameEl = document.getElementById('vipItemName');
  const metaEl = document.getElementById('vipItemMeta');

  if (imgEl) imgEl.src = currentVipItem.img;
  if (dropEl) dropEl.textContent = currentVipItem.drop;
  if (nameEl) nameEl.textContent = currentVipItem.name;
  if (metaEl) metaEl.textContent = currentVipItem.meta;

  document.getElementById('vipModalOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openVipFromStudio() {
  const prod = state.activeProduct || PRODUCTS_DATA['karan-001'];
  const look = state.activeLook || { color: 'Mocha Tan', fit: 'Oversized', size: 'L', view: 'Back' };
  const size = look.size || 'L';
  const colorViews = prod.views[look.color] || prod.views[prod.defaultColor];
  const imgSrc = colorViews[look.view] || colorViews['Front'];

  currentVipItem = {
    id: prod.id,
    name: prod.name,
    drop: prod.drop,
    meta: `${look.color} · ${look.fit} · Size ${size} · 🔒 Price Unlocks Dec 1`,
    img: imgSrc,
    size: size
  };

  const imgEl = document.getElementById('vipItemImg');
  const dropEl = document.getElementById('vipItemDrop');
  const nameEl = document.getElementById('vipItemName');
  const metaEl = document.getElementById('vipItemMeta');

  if (imgEl) imgEl.src = currentVipItem.img;
  if (dropEl) dropEl.textContent = currentVipItem.drop;
  if (nameEl) nameEl.textContent = currentVipItem.name;
  if (metaEl) metaEl.textContent = currentVipItem.meta;

  document.querySelectorAll('.vip-size-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.size === size);
  });

  document.getElementById('vipModalOverlay')?.classList.add('active');
}

function closeVipModal(e) {
  if (e && e.target && !e.target.classList.contains('vip-modal-overlay') && !e.target.classList.contains('vip-modal-close')) {
    return;
  }
  document.getElementById('vipModalOverlay')?.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function selectVipSize(size, btn) {
  currentVipItem.size = size;
  document.querySelectorAll('.vip-size-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const metaEl = document.getElementById('vipItemMeta');
  if (metaEl) {
    metaEl.textContent = metaEl.textContent.replace(/Size [A-Z0-9]+/, `Size ${size}`);
  }
}

function submitVipPass(e) {
  e.preventDefault();
  const name = document.getElementById('vipName').value.trim();
  const phone = document.getElementById('vipPhone').value.trim();
  const size = currentVipItem.size || 'L';

  const reservationCode = 'VIP-' + Math.floor(1000 + Math.random() * 9000);
  const data = { name, phone, size, item: currentVipItem.name, code: reservationCode, date: new Date().toISOString() };
  localStorage.setItem('eclipse_vip_pass', JSON.stringify(data));

  const msg = `⚡ *AUJLA SZN 1 — VIP EARLY ACCESS PASS* ⚡\n\nHey ECLIPSE, lock my VIP Drop Pass for 1st December!\n\n• *Pass ID:* ${reservationCode}\n• *Name:* ${name}\n• *WhatsApp:* ${phone}\n• *Preferred Piece:* ${currentVipItem.name}\n• *Selected Size:* ${size}\n\nSend me the 1-hour early drop link before public sellout!`;

  const ECLIPSE_WHATSAPP_NUMBER = '916369142027';
  const waUrl = `https://wa.me/${ECLIPSE_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');

  closeVipModal();
  showToast(`✦ VIP Pass ${reservationCode} Reserved! Opening WhatsApp...`);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductTryOn();
    closeCartDrawer();
    closeVipModal();
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer && drawer.classList.contains('active')) {
      toggleMobileNav();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateDropCountdown();
  setInterval(updateDropCountdown, 1000);

  const urlParams = new URLSearchParams(window.location.search);
  
  // If vip=1 is present, open VIP pass modal immediately
  if (urlParams.get('vip')) {
    setTimeout(() => {
      openVipModal('karan-001');
    }, 200);
  }

  // Support direct URL deeplinking to 3D Try-On Studio (e.g. ?tryon=karan-001&view=Back)
  const tryonTarget = urlParams.get('tryon');
  const viewTarget = urlParams.get('view');
  if (tryonTarget && PRODUCTS_DATA[tryonTarget]) {
    setTimeout(() => {
      openProductTryOn(tryonTarget, viewTarget || (tryonTarget === 'karan-001' ? 'Back' : 'Front'));
    }, 120);
  }
});
