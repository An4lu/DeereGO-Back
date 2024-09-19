const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

const quadranteSchema = new mongoose.Schema({
    Quadrante: String,
    IdSetor: {type: mongoose.Schema.Types.ObjectId, ref: 'Setor'}
})

const Quadrante = mongoose.model('Quadrante', quadranteSchema)

// Rota GET para buscar setores
router.get('/quadrante', async (req, res) => {
    try {
        const quadrante = await Quadrante.find();
        res.send(quadrante);  // Envia a resposta com sucesso
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch records' });  // Certifica-se de que a resposta de erro seja enviada uma vez
    }
});

// Rota POST para criar um novo setor
router.post('/quadrante', async (req, res) => {
    try {
        const newQuadrante = new Quadrante({
            Quadrante: req.body.Quadrante,
            IdSetor: req.body.IdSetor
        });
        await newQuadrante.save();  // Corrige o nome do modelo salvo
        res.send(newQuadrante);  // Envia a resposta com sucesso
    } catch (error) {
        res.status(400).json({ error: 'Failed to create record' });  // Envia uma única resposta de erro
    }
});

// Atualizar um quadrante
router.patch('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const updateQuadrante = await Quadrante.findByIdAndUpdate(
            id,
            {
                Quadrante: req.body.Quadrante,
                IdSetor: req.body.IdSetor
            },
            { new: true, runValidators: true } // Retorna o documento atualizado e valida
        );

        if (!updateQuadrante) {
            return res.status(404).json({ error: 'Quadrante não encontrado' });
        }

        res.json(updateQuadrante);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar o quadrante', details: error.message });
    }
});

// Deletar um quadrante
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deleteQuadrante = await Quadrante.findByIdAndDelete(id);

        if (!deleteQuadrante) {
            return res.status(404).json({ error: 'Quadrante não encontrado' });
        }

        res.json({ message: 'Quadrante removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover o quadrante', details: error.message });
    }
});


module.exports = router
