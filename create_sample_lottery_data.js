const mongoose = require('mongoose');
const Lottery = require('./backend/models/Lottery');
const User = require('./backend/models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function createSampleData() {
  try {
    // Find a sample user
    const sampleUser = await User.findOne({ role: 'Member' });
    if (!sampleUser) {
      console.log('No member user found. Please create a member user first.');
      process.exit(1);
    }

    console.log('Using user:', sampleUser.username);

    // Create sample lottery data for the past few months
    const sampleLotteries = [
      {
        month: 1, // January
        year: 2025,
        status: 'bought',
        boughtBy: sampleUser._id,
        buyoutDate: new Date('2025-01-15'),
        totalAmount: 10000
      },
      {
        month: 2, // February
        year: 2025,
        status: 'bought',
        boughtBy: sampleUser._id,
        buyoutDate: new Date('2025-02-15'),
        totalAmount: 10000
      },
      {
        month: 3, // March
        year: 2025,
        status: 'active',
        winner: sampleUser._id,
        drawDate: new Date('2025-03-15'),
        totalAmount: 0
      },
      {
        month: 4, // April
        year: 2025,
        status: 'bought',
        boughtBy: sampleUser._id,
        buyoutDate: new Date('2025-04-15'),
        totalAmount: 10000
      },
      {
        month: 5, // May
        year: 2025,
        status: 'bought',
        boughtBy: sampleUser._id,
        buyoutDate: new Date('2025-05-15'),
        totalAmount: 10000
      }
    ];

    // Clear existing lottery data for 2025
    await Lottery.deleteMany({ year: 2025 });
    console.log('Cleared existing lottery data for 2025');

    // Insert sample data
    const insertedLotteries = await Lottery.insertMany(sampleLotteries);
    console.log(`Created ${insertedLotteries.length} sample lottery records`);

    // Calculate total fund
    const totalFund = insertedLotteries.reduce((sum, lottery) => sum + (lottery.totalAmount || 0), 0);
    console.log(`Total lottery fund: ${totalFund} RWF`);

    console.log('Sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData();
