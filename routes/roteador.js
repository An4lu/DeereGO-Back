const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const rotedaorSchema = new mongoose.Schema({
    ssid: String,
    rssid: Number,
    IdQuadrante: { type: mongoose.Schema.Types.ObjectId, ref: 'Quadrante' },
})

const Roteador = mongoose.model('Roteador', rotedaorSchema)

router.get('/', async (req, res) => {
    try {
        const roteador = await Roteador.find()
        res.send(roteador)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch records' })
    }
})

router.post('/', async (req, res) => {
    try {
        const newRoteador = new Roteador({
            ssid: req.body.ssid,
            rssid: req.body.rssid,
            IdQuadrante: req.body.IdQuadrante
        })
        await newRoteador.save()
        res.send(newRoteador)
    } catch (error) {
        res.status(400).json({ error: 'Failed to create record' })
    }
})


// Atualizar um roteador
router.patch('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const updateRoteador = await Roteador.findByIdAndUpdate(
            id,
            {
                ssid: req.body.ssid,
                rssid: req.body.rssid,
                IdQuadrante: req.body.IdQuadrante
            },
            { new: true, runValidators: true } // Opções para retornar o documento atualizado e validar
        );

        if (!updateRoteador) {
            return res.status(404).json({ error: 'Roteador não encontrado' });
        }

        res.json(updateRoteador);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar o roteador', details: error.message });
    }
});

// Deletar um roteador
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deleteRoteador = await Roteador.findByIdAndDelete(id);

        if (!deleteRoteador) {
            return res.status(404).json({ error: 'Roteador não encontrado' });
        }

        res.json({ message: 'Roteador removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover o roteador', details: error.message });
    }
});




module.exports = router