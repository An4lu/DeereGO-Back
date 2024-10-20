const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

const carrinhoSchema = new mongoose.Schema({
    Peças: String,
    PosX: Number,
    PosY: Number,
    Local: String,
    Bloco: String,
    StatusManutenção: String,
    NomeCarrinho: String,
    StatusCapacidade: String,
    IdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        default: null,
        required: false,
        validate: {
            validator: function (v) {
                // Aceita strings vazias ou ObjectId válidos
                return v === "" || v === null || mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} não é um ObjectId válido!`
        }
    }
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
        const idUser = req.body.IdUser ? new mongoose.Types.ObjectId(req.body.IdUser) : null; // Converte para ObjectId ou null
        const newCarrinho = new Carrinho({
            Peças: req.body.Peças,
            PosX: req.body.PosX,
            PosY: req.body.PosY,
            Local: req.body.Local,
            Bloco: req.body.Bloco,
            StatusManutenção: req.body.StatusManutenção,
            NomeCarrinho: req.body.NomeCarrinho,
            StatusCapacidade: req.body.StatusCapacidade,
            IdUser: idUser
        });

        await newCarrinho.save();
        // Envia a resposta de sucesso
        return res.status(201).json(newCarrinho);  // Usando status 201 para criação bem-sucedida
    } catch (error) {
        console.error(error);
        // Envia a resposta de erro corretamente
        return res.status(500).json({ error: 'Failed to create record', details: error.message });  // Use status 500 e .json() diretamente
    }
});

router.patch('/carrinho/:id', async (req, res) => {
    const id = req.params.id;
    let idUser = req.body.IdUser ? new mongoose.Types.ObjectId(req.body.IdUser) : null;  // Use 'new' para criar o ObjectId
    const { PosX, PosY, Local, StatusCapacidade } = req.body;

    try {
        const updateCarrinho = await Carrinho.findByIdAndUpdate(
            id,
            { PosX, PosY, Local, StatusCapacidade, IdUser: idUser },  // Inclui IdUser na atualização
            { new: true, runValidators: true }
        );

        if (!updateCarrinho) {
            return res.status(404).json({ error: "Carrinho não encontrado" });
        }

        res.json(updateCarrinho);
    } catch (error) {
        res.status(400).json({ error: "Erro ao atualizar o carrinho", details: error.message });
    }
});


/*router.patch("/carrinho/user/:id", async (req, res) => {
    const id = req.params.id;
    let { IdUser } = req.body

    if (IdUser == "") {
        IdUser = null;
    }

    try {
        const updateCarrinho = await Carrinho.findByIdAndUpdate(id, { IdUser }, {
            new: true,
            runValidators: true
        })

        if (!updateCarrinho) {
            return res.status(404).json({ error: "Carrinho não encontrado" })
        }

        res.json(updateCarrinho);
    } catch (error) {
        res.status(400).json({ error: "Erro ao atualizar o documento", details: error.message })
    }

})*/

router.delete('/carrinho/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deletedCarrinho = await Carrinho.findByIdAndDelete(id);

        if (!deletedCarrinho) {
            return res.status(404).json({ error: 'Carrinho não encontrado' });
        }

        res.json({ message: 'Carrinho removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover o carrinho', details: error.message });
    }
});



module.exports = router
