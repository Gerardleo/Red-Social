'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Cargar rutas

const userRoutes = require('./routers/userRoutes');
const followRoutes = require('./routers/followRoutes');
const publicationRoutes = require('./routers/publicationRoutes');
const messageRoutes = require('./routers/messageRoutes');

// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Cors
const corsOptions = {
    origin: '*',
    methods: 'GET,POST,OPTIONS,PUT,DELETE',
    allowedHeaders: 'Authorization, X-Requested-With, Content-Type, Accept',
    optionsSuccessStatus: 204 // para navegadores antiguos
  };
  
  app.use(cors(corsOptions));
  
  app.use((req, res, next) => {
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
  });
// Rutas

app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);


// Exportar
module.exports = app;