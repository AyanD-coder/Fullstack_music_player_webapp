const path = require('path');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');

const app = express();
const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
]);
const frontendRoot = path.join(__dirname, '..', '..', 'Frontend_HCJ');

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('CORS origin not allowed'));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(frontendRoot, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendRoot, 'views', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendRoot, 'views', 'login.html'));
});

app.get('/register',(req,res)=>{
    res.sendFile(path.join( frontendRoot,'views','register.html'))
})
app.get('/artist', (req, res) => {
    res.sendFile(path.join(frontendRoot, 'views', 'artist.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(frontendRoot, 'views', 'home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(frontendRoot, 'views', 'about.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});


// Backend routes


app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);

app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        next(err);
        return;
    }

    res.status(500).json({
        message: err.message || 'Internal server error'
    });
});

module.exports = app;
