const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    createdBy: String,
    createdFor: String,
    title: String,
    description: String,
    createdAt: Date,
});

module.exports = mongoose.model('Comments', commentSchema, 'Comments system')