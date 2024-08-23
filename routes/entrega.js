const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const entregaSchema = new mongoose.Schema({
    IdEntrega: Number,
    IdCarrinho: Number,
    Partida: String,
    Destino: String,
    DataHora: Date,
    Status: String 
})


const Entrega = mongoose.model('Entrega', entregaSchema)

router.get('/entrega', async (req, res) => {
    try {
        const entrega = await Entrega.find();
        res.send(entrega);
      } catch {
        res.status(500).json({ error: 'Failed to fetch records' });
      }
    });

router.post('/entrega', async (req, res) => {
    try {
        const newEntrega = new Entrega({
            IdEntrega: req.body.IdEntrega,
            IdCarrinho: req.body.IdCarrinho,
            Partida: req.body.Partida,
            Destino: req.body.Destino,
            DataHora: req.body.DataHora,
            Status: req.body.Status
        });
    
        await newEntrega.save();
        res.send(newEntrega);
      } catch {
        res.status(400).json({ error: 'Failed to create record' });
      }
})

module.exports = router