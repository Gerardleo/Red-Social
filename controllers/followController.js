'use strict'

const path = require('path');
const fs = require('fs');

// Modelos
const Follow = require('../models/follow');
const User = require('../models/user');
const follow = require('../models/follow');

// Método para guardar un seguimiento
async function saveFollow(req, res) {
    const params = req.body;
    const follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed;

    try {
        if (!params.followed) {
            return res.status(404).send({ message: 'Debes de seguir a un usuario' });
        }

        if (follow.user.toString() === follow.followed.toString()) {
            return res.status(404).send({ message: 'No te puedes seguir a ti mismo' });
        }

        //verificar si ya existe el seguimiento o si el usuario se quiere seguir a si mismo
        const followExist = await Follow.findOne({ 'user': follow.user, 'followed': follow.followed });
        if (followExist) {
            return res.status(200).send({ message: 'El seguimiento ya existe' });
        }
        

        const followStored = await follow.save();
        if (!followStored) return res.status(404).send({ message: 'El seguimiento no se ha guardado' });

        return res.status(200).send({ follow: followStored });
    } catch (err) {
        return res.status(500).send({ message: 'Error al guardar el seguimiento' });
    }
}

async function deleteFollow(req, res) {
    const userId = req.user.sub;
    const followId = req.params.id;

    try {


        const result = await Follow.deleteOne({ 'user': userId, 'followed': followId });
        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'El seguimiento no se ha eliminado' });
        }

        return res.status(200).send({ message: 'El seguimiento se ha eliminado' });
    } catch (err) {
        return res.status(500).send({ message: 'Error al eliminar el seguimiento' });
    }
}

async function getFollowingUsers(req, res) {
    let userId = req.user.sub;
    let itemsPerPage = parseInt(req.body.itemsPerPage)|| 5;
    let page = parseInt(req.body.page)|| 1;  
    
    if (req.params.id) {
        userId = req.params.id;
    }

    try {
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: { path: 'followed' }
        };

        const result = await Follow.paginate({user: userId }, options);

        if (!result.docs || result.docs.length === 0) {
            return res.status(404).send({ message: 'No hay usuarios disponibles' });
        }

        return res.status(200).send({
            users: result.docs,
            total: result.totalDocs,
            pages: result.totalPages
        });
        
    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function getFollowedUsers(req, res) {
    let userId = req.user.sub;
    let itemsPerPage = parseInt(req.body.itemsPerPage)|| 5;
    let page = parseInt(req.body.page)|| 1;  
    
    if (req.params.id) {
        userId = req.params.id;
    }

    try {
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: { path: 'user' }
        };

        const result = await Follow.paginate({followed: userId }, options);

        if (!result.docs || result.docs.length === 0) {
            return res.status(404).send({ message: 'No te sigue ningun usuario' });
        }

        return res.status(200).send({
            users: result.docs,
            total: result.totalDocs,
            pages: result.totalPages
        });
        
    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

//listado de usuarios sin paginacion

async function getMyFollowers(req, res) {
    let userId = req.user.sub;

    try {
        const result = await Follow.find({ followed: userId }).populate('user');
        
        if (!result || result.length === 0) {
            return res.status(404).send({ message: 'No te sigue ningun usuario' });
        }

        return res.status(200).send({ 
            users: result,
            total: result.length
         });

    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

async function getMyFollowings(req, res) {
    let userId = req.user.sub;

    try {
        const result = await Follow.find({ user: userId }).populate('followed');

        if (!result || result.length === 0) {
            return res.status(404).send({ message: 'No sigues a ningun usuario' });
        }
        
        return res.status(200).send({ 
            users: result,
            total: result.length
        });

    } catch (err) {
        return res.status(500).send({ message: 'Error en el servidor' });
    }
}

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollowers,
    getMyFollowings
};