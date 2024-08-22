// Importing dependencies
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const app = express()
app.use(express.json())

// Define the schema and model for Rebocador
const rebocadorSchema = new mongoose.Schema({
    id: String,
    lat: Number,
    long: Number,
    OpStatus: Boolean
  });

const Rebocador = mongoose.model('Rebocador', rebocadorSchema);


// GET route to fetch all records
router.get('/', async (req, res) => {
    try {
      const rebocadores = await Rebocador.find();
      res.send(rebocadores);
    } catch {
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  });

// POST route to add a new record
router.post("/", async (req, res) => {
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

  module.exports = router;