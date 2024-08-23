// Importing dependencies
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')


// Define the schema and model for Rebocador
const rebocadorSchema = new mongoose.Schema({
    TempoTotal: Number,
    TotalCarrinhos: Number,
    StatusRebocador: String,
    IdEntrega: String
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
        TempoTotal: req.body.TempoTotal,
        TotalCarrinhos: req.body.TotalCarrinhos,
        StatusRebocador: req.body.StatusRebocador,
        IdEntrega: req.body.IdEntrega
      });
  
      await newRebocador.save();
      res.send(newRebocador);
    } catch {
      res.status(400).json({ error: 'Failed to create record' });
    }
  }
  );

  module.exports = router;