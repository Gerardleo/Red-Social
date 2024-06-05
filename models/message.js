'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const MessageSchema = Schema({
    text: String,
    viewed: Boolean,
    created_at: String,
    emitter: { type: Schema.ObjectId, ref: 'User' },
    receiver: { type: Schema.ObjectId, ref: 'User' }
});

MessageSchema.plugin(mongoosePaginate);	

module.exports = mongoose.model('Message', MessageSchema);