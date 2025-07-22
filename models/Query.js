const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Senior',
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    repliedAt: {
        type: Date,
        default: Date.now
    }
});

const querySchema = new mongoose.Schema({
    askedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Junior',
        required: true
    },
    question: { type: String, required: true },
    createdAt: {type: Date,  default: Date.now},
    replies: [replySchema]
});

const queryRoom = new mongoose.Schema({
    senior: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Senior',
        required: true,
        unique: true
    },
    queries: [querySchema]
});

module.exports = mongoose.model('QueryRoom', queryRoom);