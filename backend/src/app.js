const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const mongoose = require('mongoose');

const app = express();
if (process.env.NODE_ENV !== 'production') {
    app.use(cors({
        origin(origin, callback) {
            const localNetworkFrontend = /^http:\/\/(?:localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):5173$/.test(origin || '');
            if (!origin || localNetworkFrontend) return callback(null, true);
            return callback(new Error('Origin is not allowed by CORS'));
        },
        credentials: true
    }));
}
app.use(cookieParser());
app.use(express.json());
app.use('/media', express.static(path.resolve(__dirname, '../../videos')));

app.get('/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'database-unavailable' });
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

const frontendBuild = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuild));
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api/') || req.path.startsWith('/media/')) {
        return res.status(404).json({ message: 'Route not found' });
    }
    const entryFile = path.join(frontendBuild, 'index.html');
    if (!fs.existsSync(entryFile)) return res.status(404).send('Frontend build is missing. Run the frontend build first.');
    return res.sendFile(entryFile);
});

module.exports = app;
