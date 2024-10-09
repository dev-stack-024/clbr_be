const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const userRoutes = require('../server/routes/userRoutes');
const businessRoutes = require('../server/routes/businessRoutes');


dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch(err => {
  console.log("Failed to connect MongoDB:", err);
});

// Routes
app.get('/', (req, res) => {
  res.send('Crowdsourced Local Business Reviews API');
});

app.use('/api/users', userRoutes);
app.use('/api/business', businessRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
