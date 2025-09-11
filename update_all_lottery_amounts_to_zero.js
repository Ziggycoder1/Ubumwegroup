const mongoose = require('mongoose');
const Lottery = require('./backend/models/Lottery');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/local', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const updateLotteryAmounts = async () => {
  try {
    console.log('Starting to update all lottery amounts to 0 RWF...');
    
    // Find all lottery records
    const lotteries = await Lottery.find({});
    console.log(`Found ${lotteries.length} lottery records to update`);
    
    let updateCount = 0;
    
    // Update each lottery record
    for (const lottery of lotteries) {
      if (lottery.totalAmount !== 0) {
        lottery.totalAmount = 0;
        await lottery.save();
        updateCount++;
        console.log(`Updated lottery for ${lottery.month}/${lottery.year} - Status: ${lottery.status}`);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updateCount} lottery records to 0 RWF`);
    console.log('All lottery amounts are now set to 0 RWF for needy people only');
    
  } catch (error) {
    console.error('Error updating lottery amounts:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the update
updateLotteryAmounts();
