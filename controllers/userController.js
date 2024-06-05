'use strict'

const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');

// Modelos
const user = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication');

async function saveUser(req, res) {
    let user = new User();
    let params = req.body;

    if (params.name && params.surname && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nickname.toLowerCase();
        user.email = params.email.toLowerCase();
        user.role = 'USER';
        user.image = null;
        

        try {
            // verificar si el usuario ya existe
            const users = await User.find({
                $or: [
                    { email: user.email },
                    { nick: user.nick }
                ]
            });

            if (users && users.length >= 1) 
                return res.status(200).send({ message: 'El usuario que intentas registrar ya existe' });
            
            // cifrar contraseña y guardar datos
            const hash = await bcrypt.hashSync(params.password);
            user.password = hash;

            const userStored = await user.save();
            if (userStored) {
                res.status(200).send({ user: userStored });
            } else {
                res.status(404).send({ message: 'No se ha registrado el usuario' });
            }
        } catch (err) {
            res.status(500).send({ message: 'Error al guardar el usuario' });
        }
        
    }else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }

}

//Login 
async function login(req, res) {
    const params = req.body;
    // se puede loguear con email o nick
    let email_nickname = params.email_nickname.toLowerCase();
    let password = params.password;

    try {
        
        const user = await User.findOne({$or :[{ email: email_nickname},{nick: email_nickname}]});
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        // generar y devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }
                    user.password = undefined;
                    res.status(200).send({ user });
                } else {
                    res.status(401).send({ message: 'No se ha podido iniciar sesión. Asegúrate de que tu usuario o correo y contraseña sean correctos.' });
                }
            });
        } else {
            res.status(404).send({ message: 'El usuario no se ha podido loguear!!' });
        }


        
    } catch (err) { 
        res.status(500).send({ message: 'Error al Iniciar Sesion' });
    }
}

// Conseguir datos de un usuario
async function getUser(req, res) {
    const params = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (user) {
            
            getUserData(req.user.sub, userId).then((followBoolean) => {
                user.password = undefined;
                return res.status(200).send({ 
                    user,
                    followBoolean
            });
            });
        } else {
            res.status(404).send({ message: 'El usuario no existe' });
        }

    } catch (err) {
        res.status(500).send({ message: 'Error en la petición' });
    }
}

// devolver datos de un listado usuarios paginados

async function getUsers(req, res) {
    const params = req.body;
    let page = parseInt(params.page) || 1;
    let itemsPerPage = parseInt(params.itemsPerPage) || 10;

    try {
        const options = {
            page: page,
            limit: itemsPerPage,
            sort: '_id'
        };

        const result = await User.paginate({}, options);

        if (!result.docs || result.docs.length === 0) {
            return res.status(404).send({ message: 'No hay usuarios disponibles' });
        }

        followUserIds(req.user.sub).then((value) => {

            return res.status(200).send({
                users: result.docs,
                total: result.totalDocs,
                pages: result.totalPages,
                following: value.following,
                followed: value.followed
                
            });
        });
    }catch (err) {
        return res.status(500).send({ message: 'Error en la petición' });
    }
}

// Edicion de datos de usuario

async function updateUser(req, res) {
    const userId = req.params.id;
    const update = req.body;

    // borrar propiedad password
    delete update.password;
    delete update.userId;

    if (userId !== req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
    }

    try {
        const userUpdated = await User.findByIdAndUpdate(userId, update, { new: true });
        if (userUpdated) {
            res.status(200).send({ user: userUpdated });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
        }
    } catch (err) {
        res.status(500).send({ message: 'Error en la petición' });
    }
}

async function uploadImage(req, res) {
    const userId = req.params.id;

   
    if (req.files) {
        let file_path = req.files.image.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];

        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];
        if (userId !== req.user.sub) {
            return removeFilesOfUploads(res,file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            

            try {
                const userUpdated = await User.findByIdAndUpdate
                (userId, { image: file_name }, { new: true });
                if (userUpdated) {
                    res.status(200).send({ user: userUpdated });
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
    const path_file = `./uploads/users/${imageFile}`;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}

// Funciones auxiliares
// function cleanDataUser(user){
//     user.password = undefined;
//     user.__v = undefined;
//     user.role = undefined;
//     user.email = undefined;
//     return user;
// }

async function getUserData(identity_user_id, user_id) {
    try {
        // Realizar ambas consultas en paralelo
        const [following, followed] = await Promise.all([
            Follow.findOne({ user: identity_user_id, followed: user_id }),
            Follow.findOne({ user: user_id, followed: identity_user_id })
        ]);

        return {
            following: !!following, // true si `following` no es null, false de lo contrario
            followed: !!followed    // true si `followed` no es null, false de lo contrario
        };
    } catch (err) {
        return handleError(err);
    }
}

async function followUserIds(user_id) {
    try {
        let following = await Follow.find({ user: user_id }).select({ _id: 0, __v: 0, user: 0 });
        var following_clean = following.map((follow) => follow.followed);

        let followed = await Follow.find({ followed: user_id }).select({ _id: 0, __v: 0, followed: 0 });
        var followed_clean = followed.map((follow) => follow.user);
        return {
            following: following_clean,
            followed: followed_clean
        };
    } catch (err) {
        return handleError(err);
    }
}


async function getCountFollow(userId) {
    let following = await Follow.countDocuments({ user: userId });
    let followed = await Follow.countDocuments({ followed: userId });
    let publications = await Publication.countDocuments({ user: userId });
    //let publications = await Publication.countDocuments({ user: userId });

    return {
        following: following,
        followed: followed,
        publications: publications
    };
}

async function getCounters(req, res) {
    let userId = req.user.sub;

    if (req.params.id) {
        userId = req.params.id;
    }

    let getCount = await getCountFollow(userId);
    return res.status(200).send(getCount);
}

module.exports = {
    saveUser,
    login,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    getCounters
};
