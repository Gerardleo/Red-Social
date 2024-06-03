'use strict'

const express = require('express');
const api = express.Router();
const bodyParser = require('body-parser');
const md_auth = require('../middlewares/authenticated');
const mongoosePaginate = require('mongoose-pagination');

//Controller 
const FollowController = require('../controllers/followController');


// cargar rutas

//middlewares
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());

//cors

//rutas
api.post('/savefollowed',md_auth.ensureAuth,FollowController.saveFollow);
api.get('/unfollow/:id',md_auth.ensureAuth,FollowController.deleteFollow);
api.get('/following/:id?',md_auth.ensureAuth,FollowController.getFollowingUsers);
api.get('/followed/:id?',md_auth.ensureAuth,FollowController.getFollowedUsers);
api.get('/getMyFollowers',md_auth.ensureAuth,FollowController.getMyFollowers);
api.get('/getMyFollowings',md_auth.ensureAuth,FollowController.getMyFollowings);

//exportar
module.exports = api;