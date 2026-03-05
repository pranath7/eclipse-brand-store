const Razorpay = require('razorpay');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { amount } = req.body; // Amount should be passed in INR (rupees)

        // Initialize Razorpay
        // The user will need to set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel settings,
        // OR they can temporarily paste their test keys directly here for local testing.
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_TEST_KEY_ID',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_TEST_KEY_SECRET'
        });

        const options = {
            amount: amount * 100, // Amount is in currency subunits (paise)
            currency: 'INR',
            receipt: 'receipt_' + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ error: error.message || 'Something went wrong. Have you added your Razorpay keys?' });
    }
};
