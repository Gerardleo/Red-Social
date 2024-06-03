'use strict'

const express = require('express');
const UserController = require('../controllers/userController');
const md_auth = require('../middlewares/authenticated');
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: './uploads/users' });
const api = express.Router();

// Rutas de USER
api.post('/saveUser',md_auth.ensureAuth, UserController.saveUser);
api.post('/login', UserController.login);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/', md_auth.ensureAuth, UserController.getUsers);
api.put('/updateUser/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth,md_upload], UserController.uploadImage);
api.get('/get-image-file/:imageFile', UserController.getImageFile);
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);

module.exports = api;
