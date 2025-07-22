const mongoose = require('mongoose');

const seniorSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    branch: String,
    graduationYear: String,
    collegeIdUrl: String,
    isVerified: {type: Boolean, default: false},
    phoneNumber: String,
    isAdmin: {type: Boolean, default: false},
    DOB: {type: String},
    quote: String,
});

module.exports = mongoose.model('Senior',seniorSchema);