const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const twilio = require('twilio');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Rate Limiting
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 OTP requests per hour
    message: { error: 'Too many attempts. Please wait before requesting another OTP.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 verification attempts per 15 min
    message: { error: 'Too many verification attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const isMock = process.env.OTP_PROVIDER_MODE !== 'production';

let twilioClient = null;
if (!isMock) {
    if (!process.env.OTP_PROVIDER_API_KEY || !process.env.OTP_PROVIDER_AUTH_TOKEN || !process.env.OTP_PROVIDER_SERVICE_ID) {
        console.error("Missing Twilio credentials in production mode! SMS will fail.");
    } else {
        twilioClient = twilio(process.env.OTP_PROVIDER_API_KEY, process.env.OTP_PROVIDER_AUTH_TOKEN);
    }
}

// In-memory store for mock mode
const mockOtps = {};

app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
    try {
        let { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Please enter a valid mobile number.' });
        
        // Normalize: if 10 digits, add +91
        phone = phone.replace(/\s+/g, '');
        if (/^\d{10}$/.test(phone)) {
            phone = '+91' + phone;
        }

        if (isMock) {
            console.log(`[MOCK MODE] Sending OTP 123456 to ${phone}`);
            // Mock OTP expires in 5 minutes
            mockOtps[phone] = { code: '123456', expires: Date.now() + 5 * 60 * 1000 };
            return res.json({ success: true, message: 'Mock OTP sent successfully' });
        } else {
            if (!twilioClient) return res.status(500).json({ error: 'We couldn\'t send the OTP right now. SMS provider not configured.' });
            
            // Twilio Verify automatically handles generation and SMS delivery
            const verification = await twilioClient.verify.v2.services(process.env.OTP_PROVIDER_SERVICE_ID)
                .verifications
                .create({ to: phone, channel: 'sms' });
                
            return res.json({ success: true, status: verification.status });
        }
    } catch (err) {
        console.error('OTP Send Error:', err);
        return res.status(500).json({ error: 'We couldn\'t send the OTP right now. Please try again.' });
    }
});

app.post('/api/auth/verify-otp', verifyLimiter, async (req, res) => {
    try {
        let { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required.' });

        phone = phone.replace(/\s+/g, '');
        if (/^\d{10}$/.test(phone)) {
            phone = '+91' + phone;
        }

        if (isMock) {
            const record = mockOtps[phone];
            if (!record) return res.status(400).json({ error: 'OTP expired or not found. Please request a new code.' });
            if (Date.now() > record.expires) {
                delete mockOtps[phone];
                return res.status(400).json({ error: 'This OTP has expired. Please request a new OTP.' });
            }
            if (record.code !== otp) return res.status(400).json({ error: 'Incorrect OTP. Please check the code and try again.' });
            
            delete mockOtps[phone]; // prevent reuse
            return res.json({ success: true, message: 'Verified successfully' });
        } else {
            if (!twilioClient) return res.status(500).json({ error: 'SMS Provider not configured.' });
            
            const verificationCheck = await twilioClient.verify.v2.services(process.env.OTP_PROVIDER_SERVICE_ID)
                .verificationChecks
                .create({ to: phone, code: otp });
                
            if (verificationCheck.status === 'approved') {
                return res.json({ success: true, message: 'Verified successfully' });
            } else {
                return res.status(400).json({ error: 'Incorrect OTP. Please check the code and try again.' });
            }
        }
    } catch (err) {
        console.error('OTP Verify Error:', err);
        if (err.status === 404) {
            return res.status(400).json({ error: 'This OTP has expired. Please request a new OTP.' });
        }
        return res.status(500).json({ error: 'Server error during verification. Please try again.' });
    }
});

// Fallback to index.html for SPA if needed
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Mode: ${isMock ? 'MOCK (Development)' : 'PRODUCTION (Twilio Verify)'}`);
});
