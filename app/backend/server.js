const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./src/db/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5500;

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`server is running on ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
