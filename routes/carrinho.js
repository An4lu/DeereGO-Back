const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const carrinhoSchema = new mongoose.Schema({
    IdCarrinho: Number,
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
            IdCarrinho: req.body.IdCarrinho,
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


module.exports = router
