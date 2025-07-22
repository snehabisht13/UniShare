const mongoose = require('mongoose');

const juniorSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    branch: String,
    currentYear: Number,
    phoneNumber: Number,
    isAdmin: {type: Boolean, default: false},
    DOB: {type: String},
    savedNotes: [{type: mongoose.Schema.Types.ObjectId , ref: 'Note', default: []}],
});

module.exports = mongoose.model('Junior', juniorSchema);