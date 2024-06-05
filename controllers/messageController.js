'use strict'

const Message = require('../models/message');
const User = require('../models/user');
const Follow = require('../models/follow');

const moment = require('moment');

async function saveMessage(req, res) {
    const params = req.body;
    if (!params.text || !params.receiver) 
        return res.status(200).send({ message: 'Envia los datos necesarios' });

    const message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = false;

    try {
        const messageStored = await message.save();
        if (messageStored) return res.status(200).send({ message: messageStored });

        res.status(404).send({ message: 'No se ha podido enviar el mensaje' });
    } catch (err) {
        res.status(500).send({ message: 'Error en la petición' });
    }
}

async function getReceivedMessages(req, res) {
    let page = 1;
    let itemsPerPage = 10;
    const userId = req.user.sub;

    if (req.body.page) 
        page = req.body.page;
    if (req.body.itemsPerPage)
        itemsPerPage = req.body.itemsPerPage;

    try {
        let options = {
            page: page,
            limit: itemsPerPage,
            sort: { created_at: 'desc' },
            populate: [
                { path: 'emitter', select: 'name image' },  // Selecciona solo el campo 'name' del emisor
                { path: 'receiver', select: 'name image' }  // Selecciona solo el campo 'name' del receptor
            ]
        };
        const messages = await Message.paginate({ receiver: userId }, options)
        if (messages.docs.length > 0) {
            return res.status(200).send({ messages });
        }
        res.status(404).send({ message: 'No hay mensajes' });
    }
    catch (err) {
        res.status(500).send({ message: 'Error en la petición' });
    }
}

async function getEmmitMessages(req, res) {
    let page = 1;
    let itemsPerPage = 10;
    const userId = req.user.sub;

    if (req.body.page) 
        page = req.body.page;
    if (req.body.itemsPerPage)
        itemsPerPage = req.body.itemsPerPage;

    try {
        let options = {
            page: page,
            limit: itemsPerPage,
            sort: { created_at: 'desc' },
            populate: [
                { path: 'emitter', select: 'name image' },  // Selecciona solo el campo 'name' del emisor
                { path: 'receiver', select: 'name image' }  // Selecciona solo el campo 'name' del receptor
            ]
        };
        const messages = await Message.paginate({ emitter: userId }, options)
        if (messages.docs.length > 0) {
            return res.status(200).send({ messages });
        }
        res.status(404).send({ message: 'No hay mensajes' });
    }
    catch (err) {
        res.status(500).send({ message: 'Error en la petición' });
    }
}

async function getUnviewedMessagesCount(req, res) {
    const userId = req.user.sub;
    try {
        const count = await Message.countDocuments({ receiver: userId, viewed: false });
        if (!count) 
            return res.status(404).send({ message: 'No hay mensajes no leidos' });
        return res.status(200).send({ 'unviewed': count });
    }
    catch (err) {
        res.status(500).send({ message: 'Error en la petición' });
    }
}

async function setViewedMessages(req, res) {
    const userId = req.user.sub;
    try {
        const messages = await Message.updateMany({ receiver: userId, viewed: true }, { viewed: false });
        if (!messages.modifiedCount > 0) 
            return res.status(404).send({ message: 'No hay mensajes no leidos' });
        return res.status(200).send({ messages });


    }
    catch (err) {
        res.status(500).send({ message: 'Error en la petición' });
    }
}

module.exports = {
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessagesCount,
    setViewedMessages
}
