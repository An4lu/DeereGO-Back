const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

const setorSchema = new mongoose.Schema({
    Setor: String
})

const Setor = mongoose.model('Setor', setorSchema)


router.get('/setor', async (req, res) => {
    const { setor, quadrante } = req.query;

    const filter = {}

    // Filtro por setor (caso seja passado)
    if (setor) {
        const setores = setor.split(',');
        filter.Setor = { $in: setores.map(setor => new RegExp(setor, 'i')) }
    }

    try {
        const setores = await Setor.aggregate([
            // Filtro por setor
            { $match: filter },
            // Primeiro lookup: busca os quadrantes associados ao setor
            {
                $lookup: {
                    from: 'quadrantes',  // Coleção de quadrantes
                    localField: '_id',
                    foreignField: 'IdSetor',
                    as: 'quadrantes'
                }
            },
            // Desfaz o array de quadrantes para aplicar o filtro de quadrantes
            {
                $unwind: {
                    path: '$quadrantes',
                    preserveNullAndEmptyArrays: true  // Mantém o setor, mesmo sem quadrantes
                }
            },
            // Filtro por quadrante (caso seja passado)
            ...(quadrante
                ? [{
                    $match: {
                        'quadrantes.Quadrante': {
                            $in: quadrante.split(',').map(q => new RegExp(q, 'i'))
                        }
                    }
                }]
                : []),
            // Segundo lookup: busca os roteadores associados ao quadrante
            {
                $lookup: {
                    from: 'roteadors',  // Coleção de roteadores
                    localField: 'quadrantes._id',
                    foreignField: 'IdQuadrante',
                    as: 'roteadores'
                }
            },
            // Recoloca os roteadores dentro de cada quadrante
            {
                $group: {
                    _id: '$_id',  // Agrupando por setor
                    Setor: { $first: '$Setor' },  // Mantém o nome do setor
                    quadrantes: {
                        $push: {
                            _id: '$quadrantes._id',
                            Quadrante: '$quadrantes.Quadrante',
                            roteadores: '$roteadores'  // Inclui roteadores relacionados
                        }
                    }
                }
            },
            // Opcional: para remover quadrantes vazios (se não houver quadrantes em algum setor)
            {
                $addFields: {
                    quadrantes: {
                        $filter: {
                            input: '$quadrantes',
                            as: 'quadrante',
                            cond: { $ne: ['$$quadrante._id', null] }  // Remove quadrantes nulos
                        }
                    }
                }
            }
        ]);

        res.send(setores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});



// Rota POST para criar um novo setor
router.post('/setor', async (req, res) => {
    try {
        const newSetor = new Setor({
            Setor: req.body.Setor
        });
        await newSetor.save();  // Corrige o nome do modelo salvo
        res.send(newSetor);  // Envia a resposta com sucesso
    } catch (error) {
        res.status(400).json({ error: 'Failed to create record' });  // Envia uma única resposta de erro
    }
});

router.patch('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const updatedSetor = await Setor.findByIdAndUpdate(
            id,
            {
                Setor: req.body.Setor
            },
            { new: true, runValidators: true } // Retorna o documento atualizado e valida
        );

        if (!updatedSetor) {
            return res.status(404).json({ error: 'Setor não encontrado' });
        }

        res.json(updatedSetor);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar o setor', details: error.message });
    }
});

// Deletar um setor
router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deleteSetor = await Setor.findByIdAndDelete(id);

        if (!deleteSetor) {
            return res.status(404).json({ error: 'Setor não encontrado' });
        }

        res.json({ message: 'Setor removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover setor', details: error.message });
    }
});

module.exports = router
