const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
// Note: URI is left empty as per instructions
mongoose.connect('mongodb+srv://jamil:dibsi@cluster0.3kvswrn.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Import routes
const apiRoutes = require('./routes/api');

// Use routes
app.use('/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Foodbook API is running');
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
