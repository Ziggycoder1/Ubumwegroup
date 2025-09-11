const mongoose = require('mongoose');
const Lottery = require('./backend/models/Lottery');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/local', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateLotteryAmounts = async () => {
  try {
    console.log('Updating lottery amounts from 1000 to 10000 RWF...');
    
    // Find all lotteries with totalAmount less than 10000
    const lotteriesToUpdate = await Lottery.find({ 
      $or: [
        { totalAmount: { $lt: 10000 } },
        { totalAmount: { $exists: false } }
      ]
    });
    
    console.log(`Found ${lotteriesToUpdate.length} lotteries to update`);
    
    // Update each lottery
    for (const lottery of lotteriesToUpdate) {
      lottery.totalAmount = 10000;
      await lottery.save();
      console.log(`Updated lottery for ${lottery.month}/${lottery.year}`);
    }
    
    console.log('All lottery amounts updated successfully!');
    
  } catch (error) {
    console.error('Error updating lottery amounts:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the update
updateLotteryAmounts();
