/* =====================================================
   ECLIPSE STORE — SCRIPT.JS  (v3 — Firebase Integrated)
   ===================================================== */

// ===== FIREBASE INIT =====
const firebaseConfig = {
    apiKey: "AIzaSyAzNaCsi3Yw5-6879_F1p0b1j0viyKThN4",
    authDomain: "eclipse-store-001.firebaseapp.com",
    projectId: "eclipse-store-001",
    storageBucket: "eclipse-store-001.firebasestorage.app",
    messagingSenderId: "42097707466",
    appId: "1:42097707466:web:21d84f904dbdd1c0872733"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ===== AUTH & USER STATE =====
let currentUser = null;
let currentWallet = 0;
let currentAffiliate = '';
let currentReferrals = 0;

let userOrdersUnsub = null;

firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        db.collection('users').doc(user.uid).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                currentWallet = data.walletBalance || 0;
                currentAffiliate = data.affiliateCode || '';
                currentReferrals = data.referralsCount || 0;

                const ab = document.getElementById('authBtn');
                if (ab) ab.innerHTML = `<span style="font-size:14px; font-weight:bold; margin-right:5px; color:var(--gold);">₹${currentWallet}</span> 👤`;
                const an = document.getElementById('accNameDisplay'); if (an) an.textContent = user.email.split('@')[0];
                const aw = document.getElementById('accWalletDisplay'); if (aw) aw.textContent = currentWallet;
                const aa = document.getElementById('accAffiliateDisplay'); if (aa) aa.textContent = currentAffiliate;
                const ar = document.getElementById('accReferralsDisplay'); if (ar) ar.textContent = currentReferrals;

                const lo = document.getElementById('accountLoggedOut'); if (lo) lo.style.display = 'none';
                const li = document.getElementById('accountLoggedIn'); if (li) li.style.display = 'block';

                const optGrp = document.getElementById('authOptInGroup'); if (optGrp) optGrp.style.display = 'none';

                const wtr = document.getElementById('osWalletToggleRow');
                if (wtr && currentWallet > 0) {
                    wtr.classList.remove('hidden');
                    const ap = document.getElementById('availPoints'); if (ap) ap.textContent = currentWallet;
                } else if (wtr) { wtr.classList.add('hidden'); const uc = document.getElementById('useWalletCheck'); if (uc) uc.checked = false; }
                if (document.getElementById('osTotal')) updateOrderSummary();
            }
        });

        // Fetch User's Orders
        if (userOrdersUnsub) userOrdersUnsub();
        userOrdersUnsub = db.collection('orders')
            .where('userId', '==', user.uid)
            .onSnapshot(snap => {
                const orders = [];
                snap.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
                // Sort client-side to avoid needing a composite index in Firebase
                orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                renderUserOrders(orders);
            }, err => {
                const wrap = document.getElementById('accOrdersDisplay');
                if (wrap) wrap.innerHTML = `<div style="text-align:center; color:var(--red); font-size:13px; padding:10px;">Error loading orders.</div>`;
                console.error("Order fetch error:", err);
            });

    } else {
        if (userOrdersUnsub) { userOrdersUnsub(); userOrdersUnsub = null; }
        currentWallet = 0; currentAffiliate = ''; currentReferrals = 0;
        const ab = document.getElementById('authBtn'); if (ab) ab.innerHTML = `👤`;
        const lo = document.getElementById('accountLoggedOut'); if (lo) lo.style.display = 'block';
        const li = document.getElementById('accountLoggedIn'); if (li) li.style.display = 'none';

        const optGrp = document.getElementById('authOptInGroup'); if (optGrp) optGrp.style.display = 'block';
        const wtr = document.getElementById('osWalletToggleRow'); if (wtr) { wtr.classList.add('hidden'); const uc = document.getElementById('useWalletCheck'); if (uc) uc.checked = false; }
        if (document.getElementById('osTotal')) updateOrderSummary();
    }
});

function renderUserOrders(orders) {
    const wrap = document.getElementById('accOrdersDisplay');
    if (!wrap) return;

    if (orders.length === 0) {
        wrap.innerHTML = `<div style="text-align:center; color:var(--grey); font-size:13px; padding:10px;">No orders yet. Start shopping!</div>`;
        return;
    }

    wrap.innerHTML = orders.map(o => {
        const d = new Date(o.timestamp);
        const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const st = (o.status || 'Pending').toLowerCase();
        return `
        <div class="acc-order-item">
            <div class="acc-o-left">
                <div class="acc-o-title">${o.product} — 001 (${o.size})</div>
                <div class="acc-o-date">Ordered on ${dateStr} • ${o.id}</div>
            </div>
            <div class="acc-o-status status-${st}">${o.status || 'Pending'}</div>
        </div>
        `;
    }).join('');
}

function toggleAccountCreation() {
    const chk = document.getElementById('createAccountCheck');
    const flds = document.getElementById('accountCreationFields');
    if (chk && flds) flds.style.display = chk.checked ? 'block' : 'none';
}
function openAuthModal() { openModal('accountModal'); }
function doUserLogin() {
    const e = document.getElementById('loginEmail').value.trim();
    const p = document.getElementById('loginPwd').value;
    const err = document.getElementById('loginError');
    if (!e || !p) { err.textContent = 'Enter email and password'; err.classList.remove('hidden'); return; }
    firebase.auth().signInWithEmailAndPassword(e, p).then(() => {
        err.classList.add('hidden'); closeModal('accountModal'); showToast('Logged in!', 'success');
    }).catch(e => { err.textContent = e.message; err.classList.remove('hidden'); });
}
function doUserLogout() { firebase.auth().signOut().then(() => { closeModal('accountModal'); showToast('Logged out.', 'success'); }); }

// ===== STATE =====
let cart = [];
let selectedSize = null;
let selectedPayment = null;
let deliveryData = {};
let appliedCoupon = null;
const BASE_PRICE = 999;

let activeCoupons = {};
db.collection('coupons').onSnapshot(snap => {
    activeCoupons = {};
    snap.forEach(doc => { activeCoupons[doc.id] = doc.data(); });
});

// ===== COUPONS =====
function getCoupons() {
    return activeCoupons;
}

function calcFinalPrice() {
    let p = BASE_PRICE;
    if (appliedCoupon) {
        const c = getCoupons()[appliedCoupon];
        if (c) {
            if (c.type === 'percent') p = Math.round(p * (1 - c.discount / 100));
            else p = Math.max(0, p - c.discount);
        }
    }

    // Wallet deduction
    const uwc = document.getElementById('useWalletCheck');
    let pointsUsed = 0;
    const wvr = document.getElementById('osWalletValRow');
    const wu = document.getElementById('osWalletUsed');

    if (uwc && uwc.checked && currentWallet > 0) {
        pointsUsed = Math.min(p, currentWallet);
        p -= pointsUsed;
        if (wvr && wu) { wvr.classList.remove('hidden'); wu.textContent = `— ₹${pointsUsed}`; }
    } else {
        if (wvr) wvr.classList.add('hidden');
    }

    return { finalPrice: p, pointsUsed };
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
    const { finalPrice, pointsUsed } = calcFinalPrice();
    const elMRP = document.getElementById('osMRP'); if (elMRP) elMRP.textContent = `₹${BASE_PRICE}`;
    const elTotal = document.getElementById('osTotal'); if (elTotal) elTotal.textContent = `₹${finalPrice}`;
    const elDisc = document.getElementById('osDiscount');
    const elDiscRow = document.getElementById('osDiscountRow');
    const elUPIAmt = document.getElementById('upiAmountDisplay');
    const elOmPrice = document.getElementById('omPriceDisplay');
    const elBuyNow = document.getElementById('buyNowPrice');
    if (appliedCoupon) {
        const c = getCoupons()[appliedCoupon];
        let disc = 0;
        if (c.type === 'percent') disc = Math.round(BASE_PRICE * (c.discount / 100));
        else disc = c.discount;
        if (elDisc) elDisc.textContent = `— ₹${Math.min(disc, BASE_PRICE)}`;
        if (elDiscRow) elDiscRow.classList.remove('hidden');
    } else { if (elDiscRow) elDiscRow.classList.add('hidden'); }
    if (elUPIAmt) elUPIAmt.textContent = `₹${finalPrice}`;
    if (elOmPrice) elOmPrice.textContent = `₹${finalPrice}`;
    if (elBuyNow) elBuyNow.textContent = `₹${finalPrice}`;
}

// ===== COUPON =====
function toggleCoupon() {
    const wrap = document.getElementById('couponInputWrap');
    const btn = document.getElementById('couponToggle');
    const isHidden = wrap.classList.contains('hidden');
    if (isHidden) { wrap.classList.remove('hidden'); btn.textContent = 'Hide'; }
    else { wrap.classList.add('hidden'); btn.textContent = 'Apply Code'; }
}
async function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim().toUpperCase();
    const msgEl = document.getElementById('couponMsg');
    if (!code) { if (msgEl) { msgEl.textContent = 'Please enter a coupon code.'; msgEl.className = 'coupon-msg error'; } return; }

    // 1. Check Standard Coupons
    const coupons = getCoupons();
    if (coupons[code]) {
        appliedCoupon = code;
        const c = coupons[code];
        if (msgEl) { msgEl.textContent = `✅ Coupon applied — ${c.label}!`; msgEl.className = 'coupon-msg success'; }
        updateOrderSummary();
        showToast(`🎟️ ${c.label} applied!`, 'success');
        return;
    }

    // 2. Check Affiliate Codes
    msgEl.textContent = 'Checking code...'; msgEl.className = 'coupon-msg';
    try {
        const snap = await db.collection('users').where('affiliateCode', '==', code).get();
        if (!snap.empty) {
            const referrerDoc = snap.docs[0];
            if (currentUser && referrerDoc.id === currentUser.uid) {
                msgEl.textContent = '❌ You cannot use your own code.'; msgEl.className = 'coupon-msg error';
                return;
            }
            appliedCoupon = code;
            activeCoupons[code] = { discount: 10, type: 'percent', label: 'Affiliate Code (10% Off)', referrerId: referrerDoc.id };
            if (msgEl) { msgEl.textContent = `✅ Friend's code applied (10% off)!`; msgEl.className = 'coupon-msg success'; }
            updateOrderSummary();
            showToast(`🎟️ Affiliate applied!`, 'success');
        } else {
            appliedCoupon = null;
            if (msgEl) { msgEl.textContent = '❌ Invalid coupon or affiliate code.'; msgEl.className = 'coupon-msg error'; }
            updateOrderSummary();
        }
    } catch (e) {
        msgEl.textContent = '❌ Database error verifying code.'; msgEl.className = 'coupon-msg error';
    }
}

// ===== PAYMENT FLOW =====
async function goToPayment() {
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

    const deliveryEmail = document.getElementById('omEmailDelivery') ? document.getElementById('omEmailDelivery').value.trim() : '';
    deliveryData = { name, phone, email: deliveryEmail, address, city, pin, state };

    const optIn = document.getElementById('createAccountCheck');
    if (optIn && optIn.checked && !currentUser) {
        const em = document.getElementById('omEmail').value.trim();
        const pwd = document.getElementById('omPwd').value;
        if (!em || pwd.length < 6) { showToast('Valid email and 6+ char password required to create account.', 'error'); return; }
        document.getElementById('omStep1').style.opacity = '0.5';
        try {
            const cred = await firebase.auth().createUserWithEmailAndPassword(em, pwd);
            const affCode = 'ECL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            await db.collection('users').doc(cred.user.uid).set({
                email: em, fullName: name, walletBalance: 0, affiliateCode: affCode, referralsCount: 0, createdAt: new Date().toISOString()
            });
            showToast('Account Created! Welcome to Eclipse.', 'success');
        } catch (e) {
            document.getElementById('omStep1').style.opacity = '1';
            if (e.code === 'auth/email-already-in-use') {
                showToast('Email already in use. Please uncheck "Create Account" or log in first.', 'error');
            } else {
                showToast(e.message, 'error');
            }
            return;
        }
        document.getElementById('omStep1').style.opacity = '1';
    }

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

// ===== PLACE ORDER + MANUAL PAYMENT =====
async function placeOrder() {
    if (!selectedPayment) { document.getElementById('paymentError').classList.remove('hidden'); return; }
    if (selectedPayment === 'online') {
        const u = document.getElementById('utrInput').value.trim();
        if (u.length < 8) { showToast('Please enter a valid UTR / Trx ID.', 'error'); return; }
    }

    document.getElementById('omStep2').style.opacity = '0.5';

    const { finalPrice, pointsUsed } = calcFinalPrice();
    const orderId = 'ECL' + Date.now().toString().slice(-8).toUpperCase();
    const utrStr = selectedPayment === 'online' ? document.getElementById('utrInput').value.trim() : '';

    let referrerId = null;
    if (appliedCoupon && activeCoupons[appliedCoupon] && activeCoupons[appliedCoupon].referrerId) {
        referrerId = activeCoupons[appliedCoupon].referrerId;
    }

    let earnedPts = 0;
    if (currentUser && selectedPayment === 'online') {
        earnedPts = 50; // Earn 50 only if pre-paid online
    }

    const order = {
        id: orderId,
        timestamp: new Date().toISOString(),
        customer: deliveryData,
        product: 'Karan Aujla Tee — 001',
        size: selectedSize,
        mrp: BASE_PRICE,
        coupon: appliedCoupon || '',
        pointsUsed: pointsUsed,
        finalPrice,
        paymentMethod: selectedPayment,
        utr: utrStr,
        status: 'Pending',
        userId: currentUser ? currentUser.uid : null,
        earnedPoints: earnedPts,
        pointsAwarded: (earnedPts > 0) // Track if wallet already credited automatically
    };

    try {
        await db.collection('orders').doc(orderId).set(order);

        // Handle Wallet Adjustments
        if (currentUser) {
            let offset = 0;
            if (pointsUsed > 0) offset -= pointsUsed;
            if (earnedPts > 0) offset += earnedPts;
            if (offset !== 0) {
                await db.collection('users').doc(currentUser.uid).update({
                    walletBalance: firebase.firestore.FieldValue.increment(offset)
                });
            }
        }

        // Handle Affiliate Bonus
        if (referrerId) {
            const refDoc = await db.collection('users').doc(referrerId).get();
            if (refDoc.exists) {
                const refData = refDoc.data();
                const newCount = (refData.referralsCount || 0) + 1;
                const updates = { referralsCount: newCount };
                if (newCount % 5 === 0) updates.walletBalance = firebase.firestore.FieldValue.increment(200);
                await db.collection('users').doc(referrerId).update(updates);
            }
        }

        document.getElementById('omStep2').style.opacity = '1';
        document.getElementById('orderId').textContent = orderId;

        let earnMsg = earnedPts > 0 ? `<br><br><span style="color:var(--gold);"><b>+50 Points</b> added to your Wallet!</span>` : (selectedPayment === 'cod' && currentUser ? `<br><br><i style="color:var(--grey);font-size:12px;">You'll earn 50 points when this order is delivered.</i>` : `<br><br><i style="color:var(--grey);font-size:12px;">Create an account next time to earn points!</i>`);

        let msg = selectedPayment === 'cod'
            ? `Your order for <strong>Karan Aujla Tee (${selectedSize})</strong> is placed! We'll call <strong>${deliveryData.phone}</strong> to confirm. COD amount: ₹${finalPrice}. ${earnMsg}`
            : `Payment confirmed! <strong>Karan Aujla Tee (${selectedSize})</strong> will be dispatched to <strong>${deliveryData.city}</strong> within 1–3 days. UTR: <strong>${utrStr}</strong>. Paid: ₹${finalPrice}. ${earnMsg}`;

        document.getElementById('successMsg').innerHTML = msg;

        // Generate WhatsApp confirmation link
        const waMsg = encodeURIComponent(`Hi! I just placed an order on ECLIPSE.\n\n*Order ID:* ${orderId}\n*Product:* Karan Aujla Tee — 001 (${selectedSize})\n*Amount:* ₹${finalPrice}\n\nPlease confirm my order!`);
        const waLink = `https://wa.me/916369142027?text=${waMsg}`;
        const waBtn = document.getElementById('waConfirmBtn');
        if (waBtn) waBtn.href = waLink;

        closeModal('orderModal'); openModal('successModal');
        cart = []; updateCartCount();
        selectedSize = null; appliedCoupon = null;
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));

    } catch (err) {
        document.getElementById('omStep2').style.opacity = '1';
        showToast('Error connecting to database. Please try again.', 'error');
        console.error(err);
    }
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

    db.collection('notify').add({ name, contact, timestamp: new Date().toISOString() })
        .then(() => {
            showToast(`🔔 ${name}, you're on the list!`, 'success');
            closeModal('notifyModal');
            document.getElementById('notifyName').value = ''; document.getElementById('notifyContact').value = '';
        });
}

// ===== CONTACT FORM =====
function submitContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const contact = document.getElementById('cfContact').value.trim();
    const msg = document.getElementById('cfMessage').value.trim();
    if (!name || !contact || !msg) return;

    db.collection('messages').add({ name, contact, message: msg, timestamp: new Date().toISOString() })
        .then(() => {
            showToast(`✅ Message sent! We'll reply soon, ${name}.`, 'success');
            document.getElementById('contactForm').reset();
        });
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


// ===== PASSWORD VISIBILITY TOGGLE =====
function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        btnEl.textContent = 'HIDE';
        btnEl.classList.add('active');
    } else {
        input.type = 'password';
        btnEl.textContent = 'SHOW';
        btnEl.classList.remove('active');
    }
}

// ===== CUSTOMER REVIEWS =====
const STAGED_REVIEWS = [
    { name: "Aman Sharma", rating: 5, text: "The quality of the 180 GSM cotton is mental. Best oversized fit I've found in India so far. 🌑✨", date: "2 days ago" },
    { name: "Sanya Malhotra", rating: 5, text: "Bought the Karan Aujla tee and the print is so premium. It doesn't fade after wash. Highly recommend! 🖤", date: "5 days ago" },
    { name: "Rohan Verma", rating: 4, text: "Love the design. The delivery was a bit late but the product is worth the wait. Proper street vibes. 🤟", date: "1 week ago" },
    { name: "Priya Patel", rating: 5, text: "The fabric is so soft yet heavy. Perfect for the 'It Was All A Dream' aesthetic. Will definitely buy again. 🔥", date: "1 week ago" },
    { name: "Ishaan Gupta", rating: 5, text: "Finally an Indian brand doing oversized right. The drop shoulder is perfect. Karan Aujla fans, don't miss this! 🎤", date: "2 weeks ago" },
    { name: "Ananya Iyer", rating: 5, text: "Exceptional quality. The packaging was also very clean. Five stars to Eclipse! ⭐🌕", date: "2 weeks ago" },
    { name: "Vikram Singh", rating: 4, text: "The fit is amazing. I suggest sizing down if you want a regular fit. Great heavyweight feel. 👍", date: "3 weeks ago" },
    { name: "Mehak Kaur", rating: 5, text: "Just received my order. The black is deep and the gold accents look so rich. Worth every rupee. 💰✨", date: "3 weeks ago" },
    { name: "Kabir Khan", rating: 5, text: "Top notch streetwear. Can't wait for Drop 002 now! Great job team. 🚀", date: "1 month ago" },
    { name: "Riya Sen", rating: 5, text: "The best birthday gift for my brother. He loves it! The quality is better than many international brands. 🎁🖤", date: "1 month ago" },
    { name: "Arjun Reddy", rating: 4, text: "Cool designs and solid fabric. A bit pricey but definitely premium quality. No complaints. 💯", date: "1 month ago" },
    { name: "Zoya Ahmed", rating: 5, text: "Obsessed with the Eclipse logo and the oversized cut. It's my new favorite tee for outings. 🌑🔥", date: "2 months ago" }
];

function renderReviews(liveReviews = []) {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    // We combine staged + live (showing most recent first)
    const allReviews = [...liveReviews, ...STAGED_REVIEWS].slice(0, 3); // Show top 3 only

    grid.innerHTML = allReviews.map(r => {
        const initial = r.name.charAt(0).toUpperCase();
        const stars = "⭐".repeat(r.rating);
        return `
            <div class="review-card">
                <div class="review-stars">${stars}</div>
                <p class="review-text">"${r.text}"</p>
                <div class="review-author">
                    <div class="author-avatar">${initial}</div>
                    <div class="author-info">
                        <strong>${r.name}</strong>
                        <span>Verified Buyer</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Fetch Real Reviews from Firestore
db.collection('reviews').orderBy('timestamp', 'desc').onSnapshot(snap => {
    const live = [];
    snap.forEach(doc => live.push(doc.data()));
    renderReviews(live);
}, err => {
    console.error("Review fetch error:", err);
    renderReviews([]);
});

async function submitReview(e) {
    e.preventDefault();
    const name = document.getElementById('revName').value.trim();
    const text = document.getElementById('revText').value.trim();
    const ratingEl = document.querySelector('input[name="rating"]:checked');

    if (!ratingEl) return showToast('Please select a star rating!', 'error');
    const rating = parseInt(ratingEl.value);

    try {
        await db.collection('reviews').add({
            name, text, rating,
            timestamp: new Date().toISOString()
        });
        showToast('Review shared! Thank you 💖', 'success');
        closeModal('reviewModal');
        document.getElementById('reviewForm').reset();
    } catch (err) {
        showToast('Error sharing review. Please try again.', 'error');
        console.error(err);
    }
}

console.log('%c ECLIPSE STORE v3 ', 'background:#c9a84c;color:#000;font-size:18px;font-weight:bold;padding:6px 16px;border-radius:4px;');
