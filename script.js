/* ==========================================================================
   ECLIPSE STORE — SCRIPT.JS (VEXO & TRY-ON STUDIO CONTROLLER)
   ========================================================================== */

// Global State
const state = {
  cart: JSON.parse(localStorage.getItem('eclipse_cart_v2') || '[]'),
  tryOn: {
    name: 'Karan Aujla Signature Tee',
    drop: 'Drop 001',
    color: 'Vintage Black',
    fit: 'Oversized',
    view: 'Front',
    mood: 'Deadpan',
    price: 999
  }
};

// ==========================================================================
// 1. TRY-ON STUDIO CONTROLLER (WATTASHIRT STYLE)
// ==========================================================================

function initTryOnStudio() {
  updateLookSummary();
}

function setTryOnColor(colorName, el) {
  state.tryOn.color = colorName;
  
  // Update indicator text
  const valDisplay = document.getElementById('colorValDisplay');
  if (valDisplay) valDisplay.textContent = colorName;
  
  // Update button active states
  document.querySelectorAll('.color-swatch-btn').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  
  // Apply visual effect to model image
  const modelImg = document.getElementById('stageModelImg');
  if (modelImg) {
    if (colorName === 'Bone White') {
      modelImg.style.filter = 'contrast(1.1) brightness(1.2) drop-shadow(0 25px 35px rgba(0,0,0,0.18))';
    } else {
      modelImg.style.filter = 'drop-shadow(0 25px 35px rgba(0,0,0,0.18))';
    }
  }
  
  updateLookSummary();
  showToast(`Color updated: ${colorName}`);
}

function setTryOnFit(fitType, el) {
  state.tryOn.fit = fitType;
  
  // Update indicator text
  const valDisplay = document.getElementById('fitValDisplay');
  if (valDisplay) valDisplay.textContent = fitType;
  
  // Update button active states
  document.querySelectorAll('.fit-btn').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  
  // Subtle model scale to reflect fit silhouette
  const modelImg = document.getElementById('stageModelImg');
  if (modelImg) {
    if (fitType === 'Regular') {
      modelImg.style.transform = 'scale(0.96)';
    } else {
      modelImg.style.transform = 'scale(1)';
    }
  }
  
  updateLookSummary();
  showToast(`Fit profile: ${fitType}`);
}

function setTryOnView(viewName, el) {
  state.tryOn.view = viewName;
  
  // Update indicator text
  const valDisplay = document.getElementById('viewValDisplay');
  if (valDisplay) valDisplay.textContent = viewName;
  
  // Update button active states
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
  
  // Swap model image smoothly
  const modelImg = document.getElementById('stageModelImg');
  if (!modelImg) return;
  
  modelImg.classList.add('fade-out');
  
  setTimeout(() => {
    if (viewName === 'Back') {
      modelImg.src = 'karan-back.png';
      modelImg.alt = 'Karan Aujla Tee Back View';
    } else if (viewName === 'Side') {
      modelImg.src = 'karan-front.jpg';
      modelImg.style.transform = 'scale(0.98) rotateY(15deg)';
      modelImg.alt = 'Karan Aujla Tee Side View';
    } else {
      modelImg.src = 'karan-front.jpg';
      modelImg.style.transform = 'scale(1) rotateY(0deg)';
      modelImg.alt = 'Karan Aujla Tee Front View';
    }
    modelImg.classList.remove('fade-out');
  }, 200);
  
  updateLookSummary();
}

function setTryOnMood(moodName, el) {
  state.tryOn.mood = moodName;
  
  // Update indicator text
  const valDisplay = document.getElementById('moodValDisplay');
  if (valDisplay) valDisplay.textContent = moodName;
  
  // Update card active states
  document.querySelectorAll('.mood-card').forEach(card => card.classList.remove('active'));
  if (el) el.classList.add('active');
  
  const modelImg = document.getElementById('stageModelImg');
  if (modelImg) {
    if (moodName === 'Street Stance') {
      modelImg.style.transform = 'scale(1.03) translateY(-4px)';
    } else if (moodName === 'Detail Zoom') {
      modelImg.style.transform = 'scale(1.1) translateY(-20px)';
    } else {
      modelImg.style.transform = 'scale(1) translateY(0)';
    }
  }
  
  updateLookSummary();
}

function updateLookSummary() {
  const summaryText = document.getElementById('lookSummaryText');
  const priceDisplay = document.getElementById('lookPrice');
  
  if (summaryText) {
    summaryText.textContent = `${state.tryOn.color} · ${state.tryOn.fit} · ${state.tryOn.view} · ${state.tryOn.mood}`;
  }
  
  if (priceDisplay) {
    priceDisplay.textContent = `₹${state.tryOn.price}`;
  }
}

function addCurrentLookToCart() {
  const item = {
    id: `karan-001-${state.tryOn.color}-${state.tryOn.fit}`.toLowerCase().replace(/\s+/g, '-'),
    name: state.tryOn.name,
    meta: `${state.tryOn.color} · ${state.tryOn.fit}`,
    price: state.tryOn.price,
    img: state.tryOn.view === 'Back' ? 'karan-back.png' : 'karan-front.jpg',
    qty: 1
  };
  
  addToCart(item);
  openCartDrawer();
  showToast(`✦ Added ${state.tryOn.name} (${state.tryOn.color}) to Bag!`);
}

// ==========================================================================
// 2. CART MANAGEMENT & SLIDE-OVER DRAWER
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
  showToast('Item removed from cart');
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
        <p style="font-size: 15px; font-weight: 600; color: var(--dark); margin-bottom: 6px;">Your Bag is Empty</p>
        <p style="font-size: 13px;">Experience the Signature Drop in our Try-On studio.</p>
        <button onclick="closeCartDrawer(); scrollToSection('tryon')" class="btn-sign" style="margin-top: 20px; display: inline-block;">
          Launch Try-On Studio →
        </button>
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
          <div class="cart-item-meta">${item.meta || 'Drop 001'}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; background: #f1f3f5; border-radius: 20px; padding: 2px 10px;">
              <button onclick="updateQty('${item.id}', -1)" style="font-size: 14px; font-weight: 700; cursor: pointer;">-</button>
              <span style="font-size: 13px; font-weight: 700; min-width: 16px; text-align: center;">${item.qty}</span>
              <button onclick="updateQty('${item.id}', 1)" style="font-size: 14px; font-weight: 700; cursor: pointer;">+</button>
            </div>
            <div class="cart-item-price">₹${item.price * item.qty}</div>
          </div>
        </div>
        <button onclick="removeFromCart('${item.id}')" style="color: var(--text-muted); font-size: 16px; cursor: pointer;">✕</button>
      </div>
    `;
  }).join('');
  
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  
  // Free Shipping Threshold (₹1499)
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

// ==========================================================================
// 3. MOBILE DRAWER NAVIGATION
// ==========================================================================

function openMobileDrawer() {
  document.getElementById('mobileDrawerOverlay')?.classList.add('active');
  document.getElementById('mobileDrawer')?.classList.add('active');
}

function closeMobileDrawer() {
  document.getElementById('mobileDrawerOverlay')?.classList.remove('active');
  document.getElementById('mobileDrawer')?.classList.remove('active');
}

// ==========================================================================
// 4. QUICK ADD & CATALOG HELPERS
// ==========================================================================

function quickAddProduct(id, name, price, img, meta) {
  addToCart({
    id,
    name,
    price,
    img,
    meta: meta || 'Standard Drop',
    qty: 1
  });
  openCartDrawer();
  showToast(`✦ Added ${name} to Bag!`);
}

function scrollToSection(sectionId) {
  closeMobileDrawer();
  const el = document.getElementById(sectionId);
  if (el) {
    const offset = 80;
    const pos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: pos, behavior: 'smooth' });
  }
}

// ==========================================================================
// 5. TOAST NOTIFICATIONS
// ==========================================================================

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;
  
  toast.textContent = msg;
  toast.classList.add('active');
  
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, 2800);
}

// ==========================================================================
// 6. VIDEO MODAL
// ==========================================================================

function openVideoModal() {
  alert("✦ ECLIPSE DROP 001 FILM\n\nDirecting: Chennai Street Division\nModel: Karan Aujla Signature Edition\nFabric: 240+ GSM Combed French Terry\n\n(Full campaign teaser loaded!)");
}

// ==========================================================================
// 7. TRACK ORDER
// ==========================================================================

function trackOrderSubmit(e) {
  e.preventDefault();
  const idInput = document.getElementById('trackOrderInput');
  const resultBox = document.getElementById('trackResultBox');
  if (!idInput || !resultBox) return;
  
  const id = idInput.value.trim().toUpperCase();
  if (!id) return;
  
  resultBox.innerHTML = `
    <div style="background: #ffffff; border: 1px solid rgba(13,15,18,0.1); border-radius: 16px; padding: 24px; margin-top: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="font-family: var(--font-tech); font-size: 13px; font-weight: 700; color: var(--accent-gold);">ORDER #${id}</span>
        <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px;">IN TRANSIT</span>
      </div>
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Karan Aujla Signature Drop Tee (Oversized)</div>
      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">Dispatched via BlueDart Express Air from Chennai Hub. Estimated delivery in 2 business days.</p>
    </div>
  `;
}

// ==========================================================================
// 8. CHECKOUT TRIGGER
// ==========================================================================

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

// Initial Run
document.addEventListener('DOMContentLoaded', () => {
  initTryOnStudio();
  updateCartBadge();
  renderCart();
});
