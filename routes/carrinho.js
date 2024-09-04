const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

const carrinhoSchema = new mongoose.Schema({
    Peças: String,
    PosX: Number,
    PosY: Number,
    Local: String,
    StatusManutenção: String,
    NomeCarrinho: String,
    StatusCapacidade: String
})

const Carrinho = mongoose.model('Carrinho', carrinhoSchema)

router.get('/carrinho', async (req, res) => {
    try {
        const carrinho = await Carrinho.find()
        res.send(carrinho)
    } catch {
        res.send(500).json({ error: 'Failed to fetch records' })
    }
})

router.post('/carrinho', async (req, res) => {
    try {
        const newCarrinho = new Carrinho({
            Peças: req.body.Peças,
            PosX: req.body.PosX,
            PosY: req.body.PosY,
            Local: req.body.Local,
            StatusManutenção: req.body.StatusManutenção,
            NomeCarrinho: req.body.NomeCarrinho,
            StatusCapacidade: req.body.StatusCapacidade
        })
        await newCarrinho.save();
        res.send(newCarrinho);
    } catch {
        res.send(400).json({ error: 'Failed to create record' })
    }
})

router.patch("/carrinho/:id", async (req, res) => {
    const id = req.params.id;
    const { PosX, PosY, Local } = req.body

    if (PosX == undefined || PosY == undefined || Local == undefined) {
        return res.status(400).json({ error: "PosX e PosY são necessários para atualização" })
    }

    try {
        const updateCarrinho = await Carrinho.findByIdAndUpdate(id, { PosX, PosY, Local }, {
            new: true,
            runValidators: true
        })

        if (!updateCarrinho) {
            return res.status(400).json({ error: "Carrinho não encontrado" })
        }

        res.json(updateCarrinho);
    } catch (error) {
        res.status(400).json({ error: "Erro ao atualizar o documento", details: error.message })
    }

})



module.exports = router
