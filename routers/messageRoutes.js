'use strict'

const express = require('express');
const MessageController = require('../controllers/messageController');
const md_auth = require('../middlewares/authenticated');
const api = express.Router();

api.post('/saveMessage',md_auth.ensureAuth, MessageController.saveMessage);
api.get('/getReceivedMessages',md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/getEmittedMessages',md_auth.ensureAuth, MessageController.getEmmitMessages);
api.get('/getUnviewedMessages',md_auth.ensureAuth, MessageController.getUnviewedMessagesCount);
api.get('/setViewedMessages',md_auth.ensureAuth, MessageController.setViewedMessages);

module.exports = api;
