// Importing dependencies
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')

// Middleware to parse JSON bodies
const app = express()
app.use(express.json())
dotenv.config()

// Get url and port info from .ENV
const port = process.env.PORT
const url = process.env.MONGODB_URL


// Connect to MongoDB
mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));


// Rota rebocador
const rebocadorRoute = require('./rebocador');
app.use('/rebocador', rebocadorRoute)


// Rota login
const loginRoute = require('./login')
app.use('/login', loginRoute)





// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
