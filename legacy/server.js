const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const twilio = require('twilio');
const path = require('path');
const fs = require('fs');

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
}

const CATEGORIES = {
    'terracotta-clay': {
        name: 'Terracotta & Clay Items',
        subcategories: ['pots', 'planters', 'diyas', 'jewelry', 'cookware', 'wall-murals', 'figurines', 'tableware', 'water-bottles', 'wind-chimes', 'cups', 'piggy-banks', 'vases']
    },
    'embroidered-clothes': {
        name: 'Embroidered & Hand-Stitched Clothes',
        subcategories: ['kurtis', 'dupattas', 'sarees', 'lehengas', 'quilts', 'shawls', 'blouses', 'handkerchiefs', 'frocks', 'jackets', 'gowns', 'scarves']
    },
    'other-handicrafts': {
        name: 'Other Handicrafts',
        subcategories: ['jute-bags', 'wooden-toys', 'bamboo-baskets', 'brass-idols', 'macrame-hangings', 'leather-puppets', 'papier-mache-boxes', 'marble-coasters', 'rugs', 'dhurries', 'wind-chimes']
    }
};

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

// --- Product Endpoints ---

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(data);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read products' });
    }
});

// Get a single product
app.get('/api/products/:id', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(data);
        const product = products.find(p => p.id === req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read product' });
    }
});

// Create a new product
app.post('/api/products', (req, res) => {
    try {
        const { name, description, price, categoryId, subcategoryId, stock, image, originalPrice, status } = req.body;
        
        if (!name || !price || !categoryId || !subcategoryId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        const products = JSON.parse(data);

        const newProduct = {
            id: 'prod_' + Date.now().toString(),
            name,
            description: description || '',
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : null,
            categoryId,
            subcategoryId,
            categoryName: CATEGORIES[categoryId] ? CATEGORIES[categoryId].name : categoryId,
            subcategoryName: subcategoryId,
            stock: Number(stock) || 1,
            image: image || null,
            status: status || 'published',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        products.push(newProduct);
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

        res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save product' });
    }
});

// Update a product
app.put('/api/products/:id', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        let products = JSON.parse(data);
        
        const index = products.findIndex(p => p.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Product not found' });

        const updatedProduct = {
            ...products[index],
            ...req.body,
            updatedAt: Date.now()
        };

        if (req.body.categoryId && CATEGORIES[req.body.categoryId]) {
            updatedProduct.categoryName = CATEGORIES[req.body.categoryId].name;
        }

        products[index] = updatedProduct;
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        let products = JSON.parse(data);
        
        const initialLength = products.length;
        products = products.filter(p => p.id !== req.params.id);
        
        if (products.length === initialLength) {
            return res.status(404).json({ error: 'Product not found' });
        }

        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Get Categories Config
app.get('/api/categories', (req, res) => {
    res.json(CATEGORIES);
});

// Fallback to index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Mode: ${isMock ? 'MOCK (Development)' : 'PRODUCTION (Twilio Verify)'}`);
});
