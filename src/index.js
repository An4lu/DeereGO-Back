// Importing dependencies
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'

// Middleware to parse JSON bodies
const app = express()
app.use(express.json())
dotenv.config()

// Get url and port info from .ENV
const port = process.env.PORT
const url = process.env.MONGODB_URL

// Define the schema and model for Rebocador
const rebocadorSchema = new mongoose.Schema({
  id: String,
  lat: Number,
  long: Number,
  OpStatus: Boolean
});

const Rebocador = mongoose.model('Rebocador', rebocadorSchema);


// Connect to MongoDB
mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));


// GET route to fetch all records
app.get('/rebocador', async (req, res) => {
  try {
    const rebocadores = await Rebocador.find();
    res.send(rebocadores);
  } catch {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// POST route to add a new record
app.post("/rebocador", async (req, res) => {
  try {
    const newRebocador = new Rebocador({
      id: req.body.id,
      lat: req.body.lat,
      long: req.body.long,
      OpStatus: req.body.OpStatus
    });

    await newRebocador.save();
    res.send(newRebocador);
  } catch {
    res.status(400).json({ error: 'Failed to create record' });
  }
}
);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
