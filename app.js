const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors({
  origin: ['http://3.17.187.102', 'http://localhost:3000'], // Agrega los dominios permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

