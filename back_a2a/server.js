
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb+srv://arasansk54:Packi272004@cluster-1.iybuu.mongodb.net/aerotwoastro';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const pilotSchema = new mongoose.Schema({
  name: String,
  coordinates: [Number],
  experience: Number,
  location: String,
  profileImage: String
});

const Pilot = mongoose.model('Pilot', pilotSchema);

app.get('/api/pilots', async (req, res) => {
  try {
    const pilots = await Pilot.find();
    res.json(pilots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
