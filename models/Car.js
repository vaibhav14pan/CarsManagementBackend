const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  images: [{ 
    type: String 
  }],
  tags: {
    carType: String,
    company: String,
    dealer: String,
    custom: [String]
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

carSchema.index({
  title: 'text',
  description: 'text',
  'tags.carType': 'text',
  'tags.company': 'text',
  'tags.dealer': 'text',
  'tags.custom': 'text'
});

module.exports = mongoose.model('Car', carSchema);