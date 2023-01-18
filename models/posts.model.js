const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    createdBy: String,
    title: String,
    description: String,
    createdAt: Date,
    comments: Array,
    likes: Number,
});

module.exports = mongoose.model('Posts', postSchema, 'User follow system')