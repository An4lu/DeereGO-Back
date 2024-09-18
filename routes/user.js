const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Definindo o modelo de usuário
const userSchema = new mongoose.Schema({
    Nome: String,
    Senha: String, // Senha criptografada
    Email: { type: String, unique: true }, // Email único
    Role: { type: String, default: 'rebocador' }, // Campo para o papel do usuário, padrão é 'user'
    Fabrica: String,
    Telefone: String,
    Status: Boolean
});

// Criando o modelo de usuário
const User = mongoose.model('Usuario', userSchema);

// Configurações do JWT
const JWT_SECRET = 'seu_segredo_aqui'; // Substitua pelo seu segredo real


router.get('/', async (req, res) => {
    try {
        const { nome, email, role, fabrica, telefone, status } = req.query;

        const filter = {};

        // Para o campo Nome, permitindo múltiplos valores (ex: "Lucas,Ronaldo")
        if (nome) {
            const nomes = nome.split(',');  // Divide a string de nomes em um array, ex: "Lucas,Ronaldo" => ["Lucas", "Ronaldo"]
            filter.Nome = { $in: nomes.map(nome => new RegExp(nome, 'i')) };  // Aplica regex insensível a maiúsculas
        }

        if (email) filter.Email = email;
        if (role) filter.Role = role;
        if (fabrica) filter.Fabrica = fabrica;
        if (telefone) filter.Telefone = telefone;
        if (status) filter.Status = status === 'true';

        // Busca inicial de usuários com base nos filtros
        const users = await User.aggregate([
            { $match: filter },  // Aplica o filtro nos usuários
            {
                $lookup: {
                    from: 'rebocadors',
                    localField: '_id',
                    foreignField: 'IdUser',
                    as: 'rebocadores'
                }
            },
            {
                $unwind: {                   // Descompacta o array de rebocadores para fazer outro lookup
                    path: '$rebocadores',
                    preserveNullAndEmptyArrays: true  // Mantém o usuário mesmo se ele não tiver rebocador
                }
            },
            {
                $lookup: {
                    from: 'carrinhos',
                    localField: 'rebocadores.IdUser',
                    foreignField: 'IdUser',
                    as: 'rebocadores.carrinhos'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    Nome: { $first: '$Nome' },
                    Email: { $first: '$Email' },
                    Role: { $first: '$Role' },
                    Fabrica: { $first: '$Fabrica' },
                    Telefone: { $first: '$Telefone' },
                    Status: { $first: '$Status' },
                    rebocadores: { $push: '$rebocadores' }  // Mantém os rebocadores em formato de array
                }
            }
        ]);

        // Filtra o resultado para remover os arrays de rebocadores e carrinhos para usuários que não são rebocadores
        const result = users.map(user => {
            if (user.Role !== 'rebocador') {
                // Se o Role não for 'rebocador', remove os arrays de rebocadores e carrinhos
                delete user.rebocadores;
            }
            return user;
        });

        res.send(result);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});


// Rota para criar um novo usuário
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.Senha, 10);

        const newUser = new User({
            Nome: req.body.Nome,
            Senha: hashedPassword, // Senha criptografada
            Email: req.body.Email,
            Role: req.body.Role || 'rebocador', // Define o papel, com 'user' como padrão
            Fabrica: req.body.Fabrica,
            Telefone: req.body.Telefone,
            Status: req.body.Status

        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create record', details: err.message });
    }
});

// Rota para autenticação do usuário
router.post('/login', async (req, res) => {
    const { Email, Senha } = req.body;

    try {
        const user = await User.findOne({ Email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const isMatch = await bcrypt.compare(Senha, user.Senha);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { Email: user.Email, Role: user.Role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.status(200).json({ message: 'Login bem-sucedido', token,
            id: user._id, 
            role: user.Role,
            nome: user.Nome,
            senha: user.Senha,
            email: user.Email,
            fabrica: user.Fabrica,
            telefone: user.Telefone,
            status: user.Status
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor', details: err.message });
    }
});

// Middleware para verificar o token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
}

// Middleware para verificar se o usuário é administrador
function adminMiddleware(req, res, next) {
    if (req.user && req.user.Role === 'admin') {
        next(); // Se for admin, continue para a rota
    } else {
        res.status(403).json({ message: 'Acesso negado. Privilégios insuficientes.' });
    }
}

// Exemplo de rota protegida para administradores
router.get('/admin/dashboard', authenticateToken, adminMiddleware, (req, res) => {
    res.status(200).json({ message: 'Bem-vindo ao painel de administração'});
});


router.delete('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: 'Usuario não encontrado' });
        }

        res.json({ message: 'Usuario removido com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover o usuario', details: error.message });
    }
});



module.exports = router;