// 6. Lenis Smooth Scroll
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// 7. Flashlight Tracker
const root = document.documentElement;
document.addEventListener('mousemove', e => {
    root.style.setProperty('--cursor-x', e.clientX + 'px');
    root.style.setProperty('--cursor-y', e.clientY + 'px');
});

// 8. Scroll-Linked Cinematic Hero Text
const hTitle = document.querySelector('.hero-title');
if (hTitle) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / 600, 1);
        
        hTitle.style.letterSpacing = `${2 + (progress * 15)}px`;
        hTitle.style.transform = `translateY(${scrollY * 0.4}px) scale(${1 + progress * 0.05})`;
        hTitle.style.opacity = `${1 - progress}`;
    });
}

// 9. Order Tracking Logic
async function trackOrder() {
    const tid = document.getElementById('trackIdInput').value.trim().toUpperCase();
    const res = document.getElementById('trackResult');
    if(!tid) { showToast('Enter an Order ID', 'error'); return; }
    res.classList.remove('hidden');
    res.innerHTML = '<div style="text-align:center; color:var(--grey);"><div class="pulse-dot" style="display:inline-block;"></div> Locating package...</div>';
    
    try {
        const doc = await db.collection('orders').doc(tid).get();
        if(!doc.exists) {
            res.innerHTML = '<div style="color:var(--red); text-align:center;">Order not found. Check the ID and try again.</div>';
            return;
        }
        const data = doc.data();
        const status = data.status || 'Pending';
        const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
        let currentIndex = steps.findIndex(s => s.toLowerCase() === status.toLowerCase());
        if(currentIndex === -1) currentIndex = 0; 
        
        let html = `<div style="margin-bottom:15px; font-weight:700;">Order: <span style="color:var(--gold);">${tid}</span></div>`;
        html += `<div class="track-timeline">`;
        
        steps.forEach((step, idx) => {
            const isDone = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            html += `
                <div class="timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
                    <div class="ts-icon">${isDone ? '✓' : '•'}</div>
                    <div class="ts-text">${step}</div>
                </div>
            `;
        });
        html += `</div>`;
        if (data.trackingLink && status.toLowerCase() === 'shipped') {
             html += `<div style="margin-top: 20px;"><a href="${data.trackingLink}" target="_blank" class="btn btn-primary full-width">View Live Tracking</a></div>`;
        }
        res.innerHTML = html;
    } catch(e) {
        res.innerHTML = '<div style="color:var(--red); text-align:center;">Error connecting to logistics network.</div>';
    }
}

// 10. Truck Animation Override
window.placeOrder = async function() {
    if (!selectedPayment) { document.getElementById('paymentError').classList.remove('hidden'); return; }
    if (selectedPayment === 'online') {
        const u = document.getElementById('utrInput').value.trim();
        if (u.length < 8) { showToast('Please enter a valid UTR / Trx ID.', 'error'); return; }
    }

    document.getElementById('omStep2').style.opacity = '0.5';

    const { finalPrice, pointsUsed } = calcFinalPrice();
    const orderId = 'ECL' + Date.now().toString().slice(-8).toUpperCase();
    const utrStr = selectedPayment === 'online' ? document.getElementById('utrInput').value.trim() : '';

    let referrerId = deliveryData.referrerId || null;
    const referralCode = deliveryData.referredBy || null;

    let earnedPts = 0;
    if (currentUser && selectedPayment === 'online') {
        earnedPts = 50;
    }

    const order = {
        id: orderId,
        timestamp: new Date().toISOString(),
        customer: deliveryData,
        product: 'Karan Aujla Tee — 001',
        size: selectedSize,
        mrp: BASE_PRICE,
        coupon: appliedCoupon || '',
        referredBy: referralCode,
        referrerId: referrerId,
        pointsUsed: pointsUsed,
        finalPrice,
        paymentMethod: selectedPayment,
        utr: utrStr,
        status: 'Pending',
        userId: currentUser ? currentUser.uid : null,
        earnedPoints: earnedPts,
        pointsAwarded: (earnedPts > 0)
    };

    try {
        await db.collection('orders').doc(orderId).set(order);

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

        const waMsg = encodeURIComponent(`Hi! I just placed an order on ECLIPSE.\n\n*Order ID:* ${orderId}\n*Product:* Karan Aujla Tee — 001 (${selectedSize})\n*Amount:* ₹${finalPrice}\n\nPlease confirm my order!`);
        const waLink = `https://wa.me/916369142027?text=${waMsg}`;
        const waBtn = document.getElementById('waConfirmBtn');
        if (waBtn) waBtn.href = waLink;

        // ANIMATION SEQUENCE
        closeModal('orderModal'); 
        openModal('truckAnimModal');
        
        const trackS = document.getElementById('truckSprite');
        const packS = document.getElementById('packageSprite');
        const tMsg = document.getElementById('truckMsg');
        
        trackS.classList.remove('drive');
        packS.classList.remove('drop');
        tMsg.classList.add('hidden');
        
        void trackS.offsetWidth; // reflow
        
        trackS.classList.add('drive');
        setTimeout(() => packS.classList.add('drop'), 1400); 
        setTimeout(() => tMsg.classList.remove('hidden'), 2200); 
        
        setTimeout(() => {
            closeModal('truckAnimModal'); 
            openModal('successModal');
        }, 4500); 
        // END ANIMATION

        if (currentLeadId) {
            db.collection('leads').doc(currentLeadId).delete().catch(e => console.error("Lead cleanup failed:", e));
            currentLeadId = null;
        }

        cart = []; updateCartCount();
        selectedSize = null; appliedCoupon = null;
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));

    } catch (err) {
        document.getElementById('omStep2').style.opacity = '1';
        showToast('Error connecting to database. Please try again.', 'error');
        console.error(err);
    }
}

// 11. Modal Scrolling Fix for Lenis
document.addEventListener('wheel', (e) => {
    // If scrolling inside a modal overlay, tell Lenis to ignore it
    const modal = e.target.closest('.modal-overlay');
    if (modal) {
        modal.setAttribute('data-lenis-prevent', 'true');
    }
}, { passive: true });
document.addEventListener('touchstart', (e) => {
    const modal = e.target.closest('.modal-overlay');
    if (modal) {
        modal.setAttribute('data-lenis-prevent', 'true');
    }
}, { passive: true });

// 12. Cart Multiplication Logic Fix
window.addToCart = function() {
    if (!selectedSize) { 
        const se = document.getElementById('sizeError'); 
        if (se) se.classList.add('visible'); 
        showToast('Please select a size first!', 'error'); 
        return; 
    }
    let existing = cart.find(i => i.size === selectedSize);
    if (existing) {
        existing.qty = (existing.qty || 1) + 1;
        showToast(`✅ Added another Size ${selectedSize}!`, 'success');
    } else {
        cart.push({ id: Date.now(), name: 'Karan Aujla Tee — 001', size: selectedSize, price: BASE_PRICE, qty: 1, img: 'karan-front.jpg' });
        showToast(`✅ Size ${selectedSize} added!`, 'success');
    }
    updateCartCount(); 
    renderCart();
};

window.updateCartCount = function() { 
    const cc = document.getElementById('cartCount'); 
    if (cc) cc.textContent = cart.reduce((sum, item) => sum + (item.qty || 1), 0); 
};

window.getCartTotal = function() {
    return cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
};

window.renderCart = function() {
    const ie = document.getElementById('cartItems');
    const ee = document.getElementById('cartEmpty');
    const fe = document.getElementById('cartFooter');
    if (!ie) return;
    ie.innerHTML = '';
    if (cart.length === 0) { if (ee) ee.classList.remove('hidden'); if (fe) fe.classList.add('hidden'); return; }
    if (ee) ee.classList.add('hidden'); if (fe) fe.classList.remove('hidden');
    let total = getCartTotal();
    cart.forEach(item => {
        const q = item.qty || 1;
        const div = document.createElement('div'); div.className = 'cart-item';
        div.innerHTML = `<img src="${item.img}" alt="${item.name}" class="cart-item-img" /><div class="cart-item-info"><div class="cart-item-name">${item.name} (x${q})</div><div class="cart-item-meta">Size: ${item.size}</div></div><div class="cart-item-price">₹${item.price * q}</div><button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>`;
        ie.appendChild(div);
    });
    const ct = document.getElementById('cartTotal'); if (ct) ct.textContent = `₹${total}`;
};

window.calcFinalPrice = function() {
    let final = getCartTotal();
    let pts = 0;
    if (appliedCoupon) {
        const c = getCoupons()[appliedCoupon];
        if (c.type === 'percent') final -= Math.round(final * (c.discount / 100));
        else final -= c.discount;
    }
    if (document.getElementById('useWalletPoints') && document.getElementById('useWalletPoints').checked && currentUser) {
        pts = Math.min(currentUserData.walletBalance || 0, final - 100);
        if (pts > 0) final -= pts;
    }
    return { finalPrice: Math.max(final, 0), pointsUsed: pts };
};

// Override updateOrderSummary heavily to fix "x 1" text issue and dynamically map cart contents in UI
window.updateOrderSummary = function() {
    const { finalPrice, pointsUsed } = calcFinalPrice();
    const cartTotalItems = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const cartTotalPrice = getCartTotal();
    
    // 1. Render all cart items efficiently in Checkout Modal
    const omHeader = document.querySelector('.om-header');
    if (omHeader) {
        let summaryContainer = omHeader.querySelector('.om-product-summary-container');
        if (!summaryContainer) {
            const oldSummary = omHeader.querySelector('.om-product-summary');
            if (oldSummary) oldSummary.remove();
            summaryContainer = document.createElement('div');
            summaryContainer.className = 'om-product-summary-container';
            omHeader.appendChild(summaryContainer);
        }
        
        let html = '';
        if (cart.length === 0) {
            html += `<div class="om-product-summary" style="margin-top:10px;">
                        <img src="karan-front.jpg" class="om-thumb" alt="Karan Aujla Tee"/>
                        <div>
                            <div class="om-pname">Karan Aujla Tee — 001</div>
                            <div class="om-pdetail">Size: ${selectedSize || '—'} | ₹${BASE_PRICE}</div>
                        </div>
                     </div>`;
        } else {
            cart.forEach(item => {
                const q = item.qty || 1;
                html += `<div class="om-product-summary" style="margin-top:10px;">
                            <img src="${item.img}" class="om-thumb" alt="${item.name}"/>
                            <div>
                                <div class="om-pname">${item.name} (x${q})</div>
                                <div class="om-pdetail">Size: <strong>${item.size}</strong> &nbsp;|&nbsp; <span>₹${item.price * q}</span></div>
                            </div>
                         </div>`;
            });
        }
        summaryContainer.innerHTML = html;
    }

    // 2. Adjust standard Checkout totals inside os-summary row mapping
    const osSummaryRow = document.querySelector('.os-summary .os-row span');
    if(osSummaryRow) {
        osSummaryRow.innerText = cartTotalItems > 0 ? `Cart Items × ${cartTotalItems}` : `Karan Aujla Tee × 1`;
        document.getElementById('osMRP').textContent = `₹${cartTotalPrice || BASE_PRICE}`;
    }

    const elTotal = document.getElementById('osTotal'); if (elTotal) elTotal.textContent = `₹${finalPrice}`;
    const elDisc = document.getElementById('osDiscount');
    const elDiscRow = document.getElementById('osDiscountRow');
    const elUPIAmt = document.getElementById('upiAmountDisplay');
    const elBuyNow = document.getElementById('buyNowPrice');

    if (appliedCoupon) {
        const c = getCoupons()[appliedCoupon];
        let disc = 0;
        if (c.type === 'percent') disc = Math.round(cartTotalPrice * (c.discount / 100));
        else disc = c.discount;
        if (elDisc) elDisc.textContent = `— ₹${disc}`;
        if (elDiscRow) elDiscRow.classList.remove('hidden');
    } else { if (elDiscRow) elDiscRow.classList.add('hidden'); }
    
    if (elUPIAmt) elUPIAmt.textContent = `₹${finalPrice}`;
    
    // Fix: The Product Modal's Buy Now button should always show the item's base price, not the cart total.
    if (elBuyNow) elBuyNow.textContent = `₹${BASE_PRICE}`;
};
