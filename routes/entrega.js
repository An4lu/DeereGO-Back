const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const entregaSchema = new mongoose.Schema({
    IdCarrinho: {type: mongoose.Schema.Types.ObjectId, ref: 'Carrinho'} ,
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

router.patch('/entrega/:id', async (req, res) => {
  const id = req.params.id;

  try {
      const updatedEntrega = await Entrega.findByIdAndUpdate(
          id, 
          {
              IdCarrinho: req.body.IdCarrinho,
              Partida: req.body.Partida,
              Destino: req.body.Destino,
              DataHora: req.body.DataHora,
              Status: req.body.Status
          }, 
          { 
              new: true, // Return the updated document
              runValidators: true // Validate the update against the schema
          }
      );

      if (!updatedEntrega) {
          return res.status(404).json({ error: 'Entrega não encontrada' });
      }

      res.json(updatedEntrega);
  } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar a entrega', details: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
      const deletedEntrega = await Entrega.findByIdAndDelete(id);

      if (!deletedEntrega) {
          return res.status(404).json({ error: 'Entrega não encontrada' });
      }

      res.json({ message: 'Entrega removida com sucesso' });
  } catch (error) {
      res.status(500).json({ error: 'Erro ao remover a entrega', details: error.message });
  }
});


module.exports = router