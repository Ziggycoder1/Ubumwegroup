require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());

const allowedOrigins = [
  'https://ubumwegroup-1.onrender.com',
  'https://ubumwegroup.onrender.com',
  'http://localhost:5174' // optional for dev
];

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.log('CORS blocked for origin:', origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use MONGO_URI1 (MongoDB Atlas) if available, otherwise fall back to MONGO_URI (local)
    const mongoUri = process.env.MONGO_URI1 || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('No MongoDB connection string found in environment variables');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB connected to: ${mongoUri.includes('@') ? 'MongoDB Atlas' : 'local database'}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('Group MIS API running');
});

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const contributionRoutes = require('./routes/contributions');
const loanRoutes = require('./routes/loans');
const lotteryRoutes = require('./routes/lottery');
const penaltiesRoutes = require('./routes/penalties');

app.use('/api/contributions', contributionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/lottery', lotteryRoutes);
app.use('/api/penalties', penaltiesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
