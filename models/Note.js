
const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    title: String,
    description: String,
    subject: String,
    fileName: String,
    uploadedBy: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Senior'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*iO3Vw-2_STm6wZFTkgvuiw.png"
    },
    fileId: String,
    rating: {
        average: { type: Number , default: 0},
        count: {type: Number ,default: 0}
    },
    ratedBy: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Junior'
            },
            rating: Number
        }
    ]
});

module.exports = mongoose.model('Note', notesSchema);