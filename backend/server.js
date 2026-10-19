require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

const port = Number(process.env.PORT) || 3000;

connectDB()
    .then(() => {
        app.listen(port, '0.0.0.0', () => {
            console.log(`ScrollBite server is listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    });
