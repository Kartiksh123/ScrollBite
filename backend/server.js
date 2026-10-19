require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const seedDemo = require('./scripts/seedDemo');

const port = Number(process.env.PORT) || 3000;

async function startServer() {
    try {
        // Render's service-level start command may override render.yaml. Seed
        // production demo reels here so every supported startup path includes them.
        if (process.env.NODE_ENV === 'production') await seedDemo();
        await connectDB();
        app.listen(port, '0.0.0.0', () => {
            console.log(`ScrollBite server is listening on port ${port}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
}

startServer();
