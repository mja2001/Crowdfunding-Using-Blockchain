const express = require('express');
const cors = require('cors');
const http = require('http');
const productRoutes = require('./routers/productRoutes');
const authRoutes = require('./routers/authRoutes');

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
