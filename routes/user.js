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
    Id: Number,
    Role: { type: String, default: 'user' } // Campo para o papel do usuário, padrão é 'user'
});

// Criando o modelo de usuário
const User = mongoose.model('Usuario', userSchema);

// Configurações do JWT
const JWT_SECRET = 'seu_segredo_aqui'; // Substitua pelo seu segredo real

// Rota para criar um novo usuário
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.Senha, 10);

        const newUser = new User({
            Nome: req.body.Nome,
            Senha: hashedPassword, // Senha criptografada
            Email: req.body.Email,
            Id: req.body.Id,
            Role: req.body.Role || 'user' // Define o papel, com 'user' como padrão
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
            { Id: user.Id, Email: user.Email, Role: user.Role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.status(200).json({ message: 'Login bem-sucedido', token });
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
    res.json({ message: 'Bem-vindo ao painel de administrador!' });
});

module.exports = router;