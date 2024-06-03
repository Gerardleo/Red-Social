'use strict'

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Cargar rutas

const userRoutes = require('./routers/userRoutes');
const followRoutes = require('./routers/followRoutes');
const publicationRoutes = require('./routers/publicationRoutes');

// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Cors

// Rutas

app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);


// Exportar
module.exports = app;