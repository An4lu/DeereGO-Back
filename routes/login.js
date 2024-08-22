const express = require('express');

const routes = express.Router();
const users = [{
    id: 1,
    name: 'Lucas',
    email: 'admin@fiap.com.br',
    password: 'fiap123'
}];

routes.post('/', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email && user.password === password);
    if (user)
    {
        return res.status(200).json(user);
    }

    return res.status(401).json({ message: 'Credenciais inválidas' });
});

routes.get('/', (req,res) => {
    res.send('Hello World');
})

module.exports = routes;