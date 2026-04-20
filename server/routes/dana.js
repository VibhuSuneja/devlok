// server/routes/dana.js
import express from 'express';
import crypto from 'crypto';
import Dana from '../models/Dana.js';
import User from '../models/User.js';
import { protect, syncUserToClerk } from '../middleware/auth.js';

const router = express.Router();

// Razorpay config
const getRazorpay = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error('Razorpay credentials missing.');
    return { keyId, keySecret };
};

async function razorpayRequest(path, body, { keyId, keySecret }) {
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.description || `Razorpay error: ${res.status}`);
    return data;
}

const calculateTier = (total) => {
    if (total >= 50000) return 'Vajra';
    if (total >= 10000) return 'Bhamashah';
    if (total >= 1000) return 'Anudata';
    return 'none';
};

// Create Dana Order
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, message } = req.body; // amount in INR
        if (!amount || amount < 1) return res.status(400).json({ message: 'Invalid amount' });

        const rzp = getRazorpay();
        const order = await razorpayRequest('/orders', {
            amount: amount * 100, // paise
            currency: 'INR',
            receipt: `dana_${Date.now()}_${req.user._id.toString().slice(-6)}`,
            notes: {
                userId: req.user._id.toString(),
                userEmail: req.user.email,
                type: 'dana_contribution',
                message: message || ''
            },
        }, rzp);

        // Store pending record
        await Dana.create({
            userId: req.user._id,
            amount,
            orderId: order.id,
            status: 'pending',
            message: message || null
        });

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: rzp.keyId,
            userName: req.user.name,
            userEmail: req.user.email,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify Dana Payment
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const { keySecret } = getRazorpay();

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            await Dana.findOneAndUpdate({ orderId: razorpay_order_id }, { status: 'failed' });
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const contribution = await Dana.findOneAndUpdate(
            { orderId: razorpay_order_id },
            { status: 'completed', paymentId: razorpay_payment_id },
            { new: true }
        );

        if (!contribution) return res.status(404).json({ message: 'Order not found' });

        // Update User
        const user = await User.findById(req.user._id);
        user.totalDana += contribution.amount;
        user.shraddha += Math.floor(contribution.amount / 10); // 1 Shraddha per ₹10 donated
        user.danaTier = calculateTier(user.totalDana);
        await user.save();

        await syncUserToClerk(user);

        res.json({
            success: true,
            totalDana: user.totalDana,
            tier: user.danaTier,
            shraddha: user.shraddha
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
