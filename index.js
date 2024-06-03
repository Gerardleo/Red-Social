'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3800;

mongoose.Promise = global.promise;
mongoose.connect('mongodb://localhost:27017/Red_social')
        .then(() => {
        console.log('Conexión a la base de datos establecida con éxito...');

        //Crear servidor y ponerme a escuchar peticiones HTTP
        app.listen(port, () => {
            console.log('Servidor corriendo en http://localhost:'+port);
        });
    })
    .catch(err => console.log(err));