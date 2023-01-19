const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    following: Array,
    followedBy: Array,
    posts: Array,
    comments: Array,
    likedPosts: Array,
});

module.exports = mongoose.model('Users', userSchema, 'User follow system')