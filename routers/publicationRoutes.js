'use strict'

const express = require('express');
const PublicationController = require('../controllers/publicationController');
// middleware
const md_auth = require('../middlewares/authenticated');

// datos de la imagen
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/publications' });
const api = express.Router();

// Rutas de PUBLICACION
api.post('/savePublication',md_auth.ensureAuth, PublicationController.savePublication);
api.get('/getPublications', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/getPublication/:id', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/deletePublication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth,md_upload], PublicationController.uploadImage);
api.get('/get-image-pub/:imageFile', PublicationController.getImageFile);

module.exports = api;

