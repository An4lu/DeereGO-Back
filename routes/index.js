// Importing dependencies
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')

// Middleware to parse JSON bodies
const app = express()
app.use(express.json())
dotenv.config()
app.use(cors())
app.use(bodyParser.json())

// Get url and port info from .ENV
const port = process.env.PORT
const url = process.env.MONGODB_URL
const api = process.env.API_URL



// Connect to MongoDB
mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));


// Rota rebocador
const rebocadorRoute = require('./rebocador');
app.use('/rebocador', rebocadorRoute)


// Rota entrega
const entregaRoute = require('./entrega')
app.use('/rebocador', entregaRoute)


//Rota carrinho
const carrinhoRoute = require('./carrinho')
app.use('/rebocador/entrega', carrinhoRoute)


// Rota user
const userRoute = require('./user')
app.use('/user', userRoute)


const setorRoute = require('./setor')
app.use('/', setorRoute)

const quadranteRoute = require('./quadrante')
app.use('/', quadranteRoute)


const roteadorRoute = require('./roteador')
app.use('/roteador', roteadorRoute)


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const keepAlive = () => {
  axios.get(api)
    .then(() => console.log('Pinged API to keep it alive'))
    .catch((error) => console.error('Erro ao pingar a API:', error));
};

// Envia um ping a cada 13 minutos para manter a API ativa
setInterval(keepAlive, 7 * 60 * 1000);