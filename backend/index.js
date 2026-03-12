import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
import auth from './routes/auth.js';
import batches from './routes/batches.js';
import shelflife from './routes/shelflife.js';

app.use('/api/auth', auth);
app.use('/api/batches', batches);
app.use('/api/shelflife', shelflife);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to FarmTrace API' });
});

// Connect to DB and Start Server
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    });
