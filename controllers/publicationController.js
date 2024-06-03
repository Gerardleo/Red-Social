'use strict'

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Modelos
const Publication = require('../models/publication');
const User = require('../models/user');
const Follow = require('../models/follow');
const { get } = require('http');
const user = require('../models/user');

async function savePublication(req, res) {
    const params = req.body;

    if (!params.text) return res.status(200).send({ message: 'Debes enviar un texto' });

    const publication = new Publication();

    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    try {
        const publicationStored = await publication.save();
        if (!publicationStored) return res.status(404).send({ message: 'Error al guardar la publicación' });

        return res.status(200).send({ publication: publicationStored });
    } catch (err) {
        return res.status(500).send({ message: 'Error al realizar la peticion' });
    }
}

async function getPublications(req, res) {
    let userId = req.user.sub;
    let page = 1;
    if (req.body.page) 
        page = parseInt(req.body.page);

    let itemsPerPage = 10;
    if (req.body.itemsPerPage) 
        itemsPerPage = parseInt(req.body.itemsPerPage);

    try {
        // Buscar los usuarios seguidos por el userId
        const result = await Follow.find({ user: userId }).populate('followed');

        if (!result || result.length === 0) {
            return res.status(404).send({ message: 'No sigues a ningún usuario' });
        }

        let follows_clean = result.map(follow => follow.followed._id);

        let options = {
            page: page,
            limit: itemsPerPage,
            sort: { created_at: 'desc' },
            populate: 'user'
        };

        const resultPublication = await Publication.paginate({ user: { $in: follows_clean } }, options);
        
        if (!resultPublication || resultPublication.docs.length === 0) {
            return res.status(404).send({ message: 'No hay publicaciones' });
        }

        return res.status(200).send({
            totalItems: resultPublication.totalDocs,
            totalPages: resultPublication.totalPages,
            publications: resultPublication.docs,
            itemsPerPage: resultPublication.limit,
            currentPage: resultPublication.page
        });

    } catch (err) {
        return res.status(500).send({ message: 'Error en la petición' });
    }
}

async function getPublication(req, res) {
    const publicationId = req.params.id;

    try {
        const publication = await Publication.findById(publicationId);

        if (!publication) {
            return res.status(404).send({ message: 'La publicación no existe' });
        }

        return res.status(200).send({ publication });
    } catch (err) {
        return res.status(500).send({ message: 'Error en la petición' });
    }
}

async function deletePublication(req, res) {
    const publicationId = req.params.id;

    try {
        // Buscar la publicación con user y _id
        const publication = await Publication.findOne({ user: req.user.sub, _id: publicationId });

        if (!publication) {
            return res.status(404).send({ message: 'No se ha encontrado la publicación' });
        }

        // Eliminar la publicación
        await Publication.findByIdAndDelete(publicationId);

        return res.status(200).send({ message: 'Publicación eliminada', publication });
    } catch (err) {
        return res.status(500).send({ message: 'Error en la petición' });
    }
}
async function uploadImage(req, res) {
    const publicationId = req.params.id;

   
    if (req.files) {
        let file_path = req.files.image.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];

        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];

        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            

            try {

                const publication = await Publication.findOne({ user: req.user.sub, _id: publicationId });
                if (!publication) {
                    return removeFilesOfUploads(res,file_path, 'No tienes permiso para actualizar esta publicación');
                }

                
                const publicationUpdated = await Publication.findByIdAndUpdate
                (publicationId, { file: file_name }, { new: true });
                if (publicationUpdated) {
                    res.status(200).send({ publication: publicationUpdated });
                } else {
                    res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                }
            } catch (err) {
                res.status(500).send({ message: 'Error en la petición' });
            }
        } else {
            removeFilesOfUploads(res,file_path, 'Extensión no válida');
        }
    } else {
        return res.status(200).send({ message: 'No se han subido archivos' });
    }

  
    
}

function removeFilesOfUploads(res,file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(500).send({ message: message});
    });
}


function getImageFile(req, res) {
    const imageFile = req.params.imageFile;
    const path_file = `./uploads/publications/${imageFile}`;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}


module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}