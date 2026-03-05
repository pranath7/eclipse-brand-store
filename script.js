/* =====================================================
   ECLIPSE STORE — SCRIPT.JS  (v2 — with coupons + localStorage)
   ===================================================== */

// ===== STATE =====
let cart = [];
let selectedSize = null;
let selectedPayment = null;
let deliveryData = {};
let appliedCoupon = null;
const BASE_PRICE = 999;

// ===== COUPONS (hardcoded; admin can override via localStorage) =====
function getCoupons() {
    const stored = localStorage.getItem('eclipse_coupons');
    if (stored) return JSON.parse(stored);
    return {
        'ECLIPSE10': { discount: 10, type: 'percent', label: '10% off' },
        'LAUNCH20': { discount: 20, type: 'percent', label: '20% off' },
        'FLAT100': { discount: 100, type: 'flat', label: '₹100 off' },
        'DREAM50': { discount: 50, type: 'flat', label: '₹50 off' }
    };
}

function calcFinalPrice() {
    if (!appliedCoupon) return BASE_PRICE;
    const c = getCoupons()[appliedCoupon];
    if (!c) return BASE_PRICE;
    if (c.type === 'percent') return Math.round(BASE_PRICE * (1 - c.discount / 100));
    return Math.max(0, BASE_PRICE - c.discount);
}

// ===== LOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        initReveal();
    }, 300);
});

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
});
function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    if (cursorFollower) { cursorFollower.style.left = followerX + 'px'; cursorFollower.style.top = followerY + 'px'; }
    requestAnimationFrame(animateFollower);
}
animateFollower();
document.addEventListener('mouseover', (e) => { if (e.target.closest('a,button,[onclick],.product-card,.payment-option,.size-btn')) { if (cursor) cursor.classList.add('hover'); if (cursorFollower) cursorFollower.classList.add('hover'); } });
document.addEventListener('mouseout', (e) => { if (e.target.closest('a,button,[onclick],.product-card,.payment-option,.size-btn')) { if (cursor) cursor.classList.remove('hover'); if (cursorFollower) cursorFollower.classList.remove('hover'); } });

// ===== NAVBAR =====
window.addEventListener('scroll', () => {
    const nb = document.getElementById('navbar');
    if (nb) nb.classList.toggle('scrolled', window.scrollY > 50);
});
document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const t = document.querySelector(href);
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMobileMenu();
        }
    });
});

// ===== HAMBURGER =====
const hamburgerEl = document.getElementById('hamburger');
if (hamburgerEl) hamburgerEl.addEventListener('click', () => {
    hamburgerEl.classList.toggle('active');
    document.getElementById('mobileMenu').classList.toggle('open');
});
function closeMobileMenu() {
    const h = document.getElementById('hamburger');
    const m = document.getElementById('mobileMenu');
    if (h) h.classList.remove('active');
    if (m) m.classList.remove('open');
}

// ===== HERO FLIP =====
(function () {
    const back = document.getElementById('heroBack');
    const front = document.getElementById('heroFront');
    const btn = document.getElementById('heroFlipBtn');
    if (!back || !front || !btn) return;
    let showingBack = true;
    btn.addEventListener('click', () => {
        if (showingBack) { back.classList.remove('active'); front.classList.add('active'); }
        else { front.classList.remove('active'); back.classList.add('active'); }
        showingBack = !showingBack;
    });
})();
setInterval(() => {
    const back = document.getElementById('heroBack');
    const front = document.getElementById('heroFront');
    if (!back || !front) return;
    if (back.classList.contains('active')) { back.classList.remove('active'); front.classList.add('active'); }
    else { front.classList.remove('active'); back.classList.add('active'); }
}, 4000);

// ===== SCROLL REVEAL =====
function initReveal() {
    const els = document.querySelectorAll('.product-card,.section-header,.feature,.contact-item,.about-text,.about-visual');
    els.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
}

// ===== MODAL SYSTEM =====
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    if (document.querySelectorAll('.modal-overlay.open').length === 0) document.body.style.overflow = '';
}
function closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
    selectedSize = null; selectedPayment = null; appliedCoupon = null;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.classList.remove('open'); if (document.querySelectorAll('.modal-overlay.open').length === 0) document.body.style.overflow = ''; } });
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { const o = document.querySelectorAll('.modal-overlay.open'); if (o.length > 0) { o[o.length - 1].classList.remove('open'); if (document.querySelectorAll('.modal-overlay.open').length === 0) document.body.style.overflow = ''; } }
});

// ===== PRODUCT MODAL =====
function openProduct() { openModal('productModal'); }
function switchPmImg(el, src) {
    document.getElementById('pmMainImg').src = src;
    document.querySelectorAll('.pm-thumb').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

// ===== SIZE =====
function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSize = btn.dataset.size;
    const se = document.getElementById('sizeError');
    if (se) se.classList.remove('visible');
    const omSize = document.getElementById('omSize');
    if (omSize) omSize.textContent = selectedSize;
}
function openSizeGuide() { openModal('sizeModal'); }

// ===== CART =====
function addToCart() {
    if (!selectedSize) { const se = document.getElementById('sizeError'); if (se) se.classList.add('visible'); showToast('Please select a size first!', 'error'); return; }
    if (cart.find(i => i.size === selectedSize)) { showToast(`Size ${selectedSize} already in cart!`, 'error'); return; }
    cart.push({ id: Date.now(), name: 'Karan Aujla Tee — 001', size: selectedSize, price: BASE_PRICE, img: 'tshirt-front.png' });
    updateCartCount(); showToast(`✅ Size ${selectedSize} added!`, 'success'); renderCart();
}
function updateCartCount() { const cc = document.getElementById('cartCount'); if (cc) cc.textContent = cart.length; }
function renderCart() {
    const ie = document.getElementById('cartItems');
    const ee = document.getElementById('cartEmpty');
    const fe = document.getElementById('cartFooter');
    if (!ie) return;
    ie.innerHTML = '';
    if (cart.length === 0) { if (ee) ee.classList.remove('hidden'); if (fe) fe.classList.add('hidden'); return; }
    if (ee) ee.classList.add('hidden'); if (fe) fe.classList.remove('hidden');
    let total = 0;
    cart.forEach(item => {
        total += item.price;
        const div = document.createElement('div'); div.className = 'cart-item';
        div.innerHTML = `<img src="${item.img}" alt="${item.name}" class="cart-item-img" /><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-meta">Size: ${item.size}</div></div><div class="cart-item-price">₹${item.price}</div><button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>`;
        ie.appendChild(div);
    });
    const ct = document.getElementById('cartTotal'); if (ct) ct.textContent = `₹${total}`;
}
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); updateCartCount(); renderCart(); showToast('Item removed', 'error'); }
const cartBtn = document.getElementById('cartBtn');
if (cartBtn) cartBtn.addEventListener('click', () => { renderCart(); openModal('cartModal'); });
function proceedToCheckout() { if (cart.length === 0) return; if (!selectedSize && cart.length > 0) selectedSize = cart[0].size; closeModal('cartModal'); openOrderModal(); }

// ===== ORDER MODAL =====
function openOrderModal() {
    if (!selectedSize) { const se = document.getElementById('sizeError'); if (se) se.classList.add('visible'); showToast('Please select a size!', 'error'); return; }
    const os = document.getElementById('omSize'); if (os) os.textContent = selectedSize;
    updateOrderSummary();
    resetOrderModal();
    openModal('orderModal');
}
function resetOrderModal() {
    document.getElementById('omStep1').classList.remove('hidden');
    document.getElementById('omStep2').classList.add('hidden');
    selectedPayment = null; appliedCoupon = null;
    document.getElementById('codOption').classList.remove('selected');
    document.getElementById('onlineOption').classList.remove('selected');
    document.getElementById('codWarning').classList.add('hidden');
    document.getElementById('upiSection').classList.add('hidden');
    document.getElementById('paymentError').classList.add('hidden');
    document.getElementById('utrInput').value = '';
    document.getElementById('couponInput').value = '';
    document.getElementById('couponMsg').textContent = '';
    document.getElementById('couponInputWrap').classList.add('hidden');
    document.getElementById('couponToggle').textContent = 'Apply Code';
    updateOrderSummary();
}
function updateOrderSummary() {
    const final = calcFinalPrice();
    const elMRP = document.getElementById('osMRP'); if (elMRP) elMRP.textContent = `₹${BASE_PRICE}`;
    const elTotal = document.getElementById('osTotal'); if (elTotal) elTotal.textContent = `₹${final}`;
    const elDisc = document.getElementById('osDiscount');
    const elDiscRow = document.getElementById('osDiscountRow');
    const elUPIAmt = document.getElementById('upiAmountDisplay');
    const elOmPrice = document.getElementById('omPriceDisplay');
    const elBuyNow = document.getElementById('buyNowPrice');
    if (appliedCoupon) {
        const saved = BASE_PRICE - final;
        if (elDisc) elDisc.textContent = `— ₹${saved}`;
        if (elDiscRow) elDiscRow.classList.remove('hidden');
    } else { if (elDiscRow) elDiscRow.classList.add('hidden'); }
    if (elUPIAmt) elUPIAmt.textContent = `₹${final}`;
    if (elOmPrice) elOmPrice.textContent = `₹${final}`;
    if (elBuyNow) elBuyNow.textContent = `₹${final}`;
}

// ===== COUPON =====
function toggleCoupon() {
    const wrap = document.getElementById('couponInputWrap');
    const btn = document.getElementById('couponToggle');
    const isHidden = wrap.classList.contains('hidden');
    if (isHidden) { wrap.classList.remove('hidden'); btn.textContent = 'Hide'; }
    else { wrap.classList.add('hidden'); btn.textContent = 'Apply Code'; }
}
function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim().toUpperCase();
    const msgEl = document.getElementById('couponMsg');
    if (!code) { if (msgEl) { msgEl.textContent = 'Please enter a coupon code.'; msgEl.className = 'coupon-msg error'; } return; }
    const coupons = getCoupons();
    if (coupons[code]) {
        appliedCoupon = code;
        const c = coupons[code];
        if (msgEl) { msgEl.textContent = `✅ Coupon applied — ${c.label}!`; msgEl.className = 'coupon-msg success'; }
        updateOrderSummary();
        showToast(`🎟️ ${c.label} applied!`, 'success');
    } else {
        appliedCoupon = null;
        if (msgEl) { msgEl.textContent = '❌ Invalid coupon code.'; msgEl.className = 'coupon-msg error'; }
        updateOrderSummary();
    }
}

// ===== PAYMENT FLOW =====
function goToPayment() {
    const name = document.getElementById('omName').value.trim();
    const phone = document.getElementById('omPhone').value.trim();
    const address = document.getElementById('omAddress').value.trim();
    const city = document.getElementById('omCity').value.trim();
    const pin = document.getElementById('omPin').value.trim();
    const state = document.getElementById('omState').value.trim();
    if (!name) { showToast('Enter your full name.', 'error'); document.getElementById('omName').focus(); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { showToast('Enter a valid 10-digit number.', 'error'); document.getElementById('omPhone').focus(); return; }
    if (!address) { showToast('Enter your address.', 'error'); document.getElementById('omAddress').focus(); return; }
    if (!city) { showToast('Enter your city.', 'error'); document.getElementById('omCity').focus(); return; }
    if (!/^\d{6}$/.test(pin)) { showToast('Enter a valid 6-digit PIN.', 'error'); document.getElementById('omPin').focus(); return; }
    if (!state) { showToast('Enter your state.', 'error'); document.getElementById('omState').focus(); return; }
    deliveryData = { name, phone, email: document.getElementById('omEmail').value.trim(), address, city, pin, state };
    document.getElementById('omStep1').classList.add('hidden');
    document.getElementById('omStep2').classList.remove('hidden');
    const codOption = document.getElementById('codOption');
    const isChennai = city.toLowerCase().includes('chennai');
    codOption.style.opacity = isChennai ? '' : '0.4';
    codOption.style.pointerEvents = isChennai ? '' : 'none';
}
function goBackToDelivery() { document.getElementById('omStep2').classList.add('hidden'); document.getElementById('omStep1').classList.remove('hidden'); }
function selectPayment(type) {
    selectedPayment = type;
    document.getElementById('paymentError').classList.add('hidden');
    if (type === 'cod') {
        document.getElementById('codOption').classList.add('selected'); document.getElementById('onlineOption').classList.remove('selected');
        document.getElementById('codWarning').classList.remove('hidden'); document.getElementById('upiSection').classList.add('hidden');
    } else {
        document.getElementById('onlineOption').classList.add('selected'); document.getElementById('codOption').classList.remove('selected');
        document.getElementById('codWarning').classList.add('hidden'); document.getElementById('upiSection').classList.remove('hidden');
    }
}

// ===== PLACE ORDER + SAVE TO LOCALSTORAGE =====
function placeOrder() {
    if (!selectedPayment) { document.getElementById('paymentError').classList.remove('hidden'); return; }
    if (selectedPayment === 'online') {
        const utr = document.getElementById('utrInput').value.trim();
        if (!utr || utr.length < 8) { showToast('Enter a valid UTR / Transaction ID.', 'error'); document.getElementById('utrInput').focus(); return; }
    }
    const finalPrice = calcFinalPrice();
    const orderId = 'ECL' + Date.now().toString().slice(-8).toUpperCase();
    const utr = selectedPayment === 'online' ? document.getElementById('utrInput').value.trim() : '';
    // Save order
    const order = {
        id: orderId,
        timestamp: new Date().toISOString(),
        customer: deliveryData,
        product: 'Karan Aujla Tee — 001',
        size: selectedSize,
        mrp: BASE_PRICE,
        coupon: appliedCoupon || '',
        finalPrice,
        paymentMethod: selectedPayment,
        utr,
        status: 'Pending'
    };
    const orders = JSON.parse(localStorage.getItem('eclipse_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('eclipse_orders', JSON.stringify(orders));

    document.getElementById('orderId').textContent = orderId;
    let msg = selectedPayment === 'cod'
        ? `Your order for <strong>Karan Aujla Tee (${selectedSize})</strong> is placed! We'll call <strong>${deliveryData.phone}</strong> to confirm. COD amount: ₹${finalPrice}.`
        : `Payment confirmed! <strong>Karan Aujla Tee (${selectedSize})</strong> will be dispatched to <strong>${deliveryData.city}</strong> within 1–3 days. UTR: <strong>${utr}</strong>. Paid: ₹${finalPrice}.`;
    document.getElementById('successMsg').innerHTML = msg;
    closeModal('orderModal'); openModal('successModal');
    cart = []; updateCartCount();
    selectedSize = null; appliedCoupon = null;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
}

// ===== COPY UPI =====
function copyUPI() { navigator.clipboard.writeText('pranath7@fam').then(() => showToast('✅ UPI ID copied!', 'success')).catch(() => showToast('UPI: pranath7@fam', 'success')); }

// ===== NOTIFY =====
function openNotifyModal() { openModal('notifyModal'); }
function submitNotify(e) {
    e.preventDefault();
    const name = document.getElementById('notifyName').value.trim();
    const contact = document.getElementById('notifyContact').value.trim();
    if (!name || !contact) return;
    const list = JSON.parse(localStorage.getItem('eclipse_notify') || '[]');
    list.unshift({ name, contact, timestamp: new Date().toISOString() });
    localStorage.setItem('eclipse_notify', JSON.stringify(list));
    showToast(`🔔 ${name}, you're on the list!`, 'success');
    closeModal('notifyModal');
    document.getElementById('notifyName').value = ''; document.getElementById('notifyContact').value = '';
}

// ===== CONTACT FORM =====
function submitContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const contact = document.getElementById('cfContact').value.trim();
    const msg = document.getElementById('cfMessage').value.trim();
    if (!name || !contact || !msg) return;
    const messages = JSON.parse(localStorage.getItem('eclipse_messages') || '[]');
    messages.unshift({ name, contact, message: msg, timestamp: new Date().toISOString() });
    localStorage.setItem('eclipse_messages', JSON.stringify(messages));
    showToast(`✅ Message sent! We'll reply soon, ${name}.`, 'success');
    document.getElementById('contactForm').reset();
}

// ===== POLICY MODAL =====
const policies = {
    shipping: `<h2>Shipping Policy</h2><h3>Processing Time</h3><p>Orders are processed within 1–2 business days after payment confirmation.</p><h3>Delivery Timeline</h3><p>Standard delivery takes 3–7 business days. Chennai orders: 1–3 days.</p><h3>Shipping Charges</h3><p>Free shipping on all orders.</p><h3>COD</h3><p>COD is available only within Chennai metropolitan region.</p>`,
    returns: `<h2>Returns & Exchange Policy</h2><h3>7-Day Return Window</h3><p>Returns accepted within 7 days of delivery if unused and in original packaging.</p><h3>Exchange</h3><p>Size exchanges accepted. Contact us within 7 days.</p><h3>Refunds</h3><p>Approved refunds processed within 5–7 business days.</p>`,
    privacy: `<h2>Privacy Policy</h2><h3>Information We Collect</h3><p>Name, phone, email (optional), and delivery address for order processing.</p><h3>How We Use It</h3><p>Your data is used only to process and deliver your order.</p><h3>Payment Security</h3><p>We do not store payment details. UTR IDs stored only for order verification.</p>`
};
function showPolicy(type) { document.getElementById('policyContent').innerHTML = policies[type] || '<p>Not found.</p>'; openModal('policyModal'); }

// ===== TOAST =====
let toastTimeout;
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerHTML = msg; t.className = `toast ${type} show`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== SHOP NOW BUTTON =====
const shopNowBtn = document.getElementById('shopNowBtn');
if (shopNowBtn) shopNowBtn.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); });

// ===== MARQUEE PAUSE =====
const mqBand = document.querySelector('.marquee-band');
if (mqBand) {
    const mq = document.querySelector('.marquee-track');
    mqBand.addEventListener('mouseenter', () => { if (mq) mq.style.animationPlayState = 'paused'; });
    mqBand.addEventListener('mouseleave', () => { if (mq) mq.style.animationPlayState = 'running'; });
}

// ===== PARALLAX =====
window.addEventListener('scroll', () => {
    const el = document.querySelector('.hero-product-float');
    if (el) el.style.transform = `translateY(${window.scrollY * 0.08}px)`;
});

// ===== INPUT FILTERS =====
const omPhoneEl = document.getElementById('omPhone');
if (omPhoneEl) omPhoneEl.addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });
const omPinEl = document.getElementById('omPin');
if (omPinEl) omPinEl.addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });

// ===== CUSTOM ORDERS =====
function sendCustomWhatsApp() {
    const type = document.getElementById('customType').value;
    const qty = document.getElementById('customQty').value;
    const color = document.getElementById('customColor').value || 'Any';
    const idea = document.getElementById('customIdea').value;

    let message = `Hi Eclipse! 🌑\nI want to make a *Custom Order*.\n\n`;
    message += `👕 *Garment:* ${type}\n`;
    message += `📦 *Quantity:* ${qty}\n`;
    message += `🎨 *Color:* ${color}\n`;

    if (idea.trim()) {
        message += `💡 *Design Idea:* ${idea}\n`;
    }

    message += `\nI have the design file ready to send.`;

    const phone = "916369142027";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
}

console.log('%c ECLIPSE STORE v2 ', 'background:#c9a84c;color:#000;font-size:18px;font-weight:bold;padding:6px 16px;border-radius:4px;');
