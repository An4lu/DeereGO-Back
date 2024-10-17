// Importing dependencies
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')


// Define the schema and model for Rebocador
const rebocadorSchema = new mongoose.Schema({
    TempoTotal: Number,
    TotalCarrinhos: Number,
    StatusRebocador: String,
    IdEntrega: {type: mongoose.Schema.Types.ObjectId, ref: 'Entrega'},
    IdUser: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'},
    PosX: Number,
    PosY: Number,
    Quadrante: {type: mongoose.SChema.Types.ObjectId, ref: 'Quadrante'}
  });

const Rebocador = mongoose.model('Rebocador', rebocadorSchema);


// GET route to fetch all records
router.get('/', async (req, res) => {
  try {
      const rebocador = await Rebocador.aggregate([
          {
              $lookup: {
                  from: 'carrinhos',            // Nome da coleção de carrinhos
                  let: { rebocadorIdUser: '$IdUser' }, // Define a variável do campo 'IdUser' de Rebocador
                  pipeline: [
                      {
                          $match: {
                              $expr: {
                                  $eq: ['$$rebocadorIdUser', { $toObjectId: '$IdUser' }]  // Converte IdUser de Carrinho para ObjectId
                              }
                          }
                      }
                  ],
                  as: 'carrinhos'              // Nome do array que armazenará o resultado do join
              }
          }
      ]);

      res.send(rebocador);
  } catch (error) {
      console.error(error);
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
        IdEntrega: req.body.IdEntrega,
        IdUser: req.body.IdUser,
        PosX: req.body.PosX,
        PosY: req.body.PosY,
        Quadrante: req.body.Quadrante
      });
  
      await newRebocador.save();
      res.send(newRebocador);
    } catch {
      res.status(400).json({ error: 'Failed to create record' });
    }
  }
  );

  router.patch('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const updatedRebocador = await Rebocador.findByIdAndUpdate(
            id, 
            {
                TempoTotal: req.body.TempoTotal,
                TotalCarrinhos: req.body.TotalCarrinhos,
                StatusRebocador: req.body.StatusRebocador,
                IdEntrega: req.body.IdEntrega,
                PosX: req.body.PosX,
                PosY: req.body.PosY,
                Quadrante: req.body.Quadrante
            }, 
            { 
                new: true, // Return the updated document
                runValidators: true // Validate the update against the schema
            }
        );

        if (!updatedRebocador) {
            return res.status(404).json({ error: 'Rebocador não encontrado' });
        }

        res.json(updatedRebocador);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar o rebocador', details: error.message });
    }
});



  router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deletedRebocador = await Rebocador.findByIdAndDelete(id);

        if (!deletedRebocador) {
            return res.status(404).json({ error: 'Rebocador não encontrado' });
        }

        res.json({ message: 'Rebocador removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover o rebocador', details: error.message });
    }
});

module.exports = router;