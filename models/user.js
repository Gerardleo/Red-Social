'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = Schema({
    name: String,
    surname: String,
    email: { type: String, lowercase: true },
    nick: { type: String, lowercase: true },
    password: String,
    role: String,
    image: String
});

UserSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('User', UserSchema);