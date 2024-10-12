const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const userRoutes = require('./src/routes/userRoutes');
const businessRoutes = require('./src/routes/businessRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch(err => {
    console.log("Failed to connect MongoDB:", err);
  });

app.get('/', (req, res) => {
  res.send('Crowdsourced Local Business Reviews API');
});

app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});