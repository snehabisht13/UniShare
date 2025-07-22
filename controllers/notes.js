const Note = require('../models/Note');
const mongoose = require('mongoose');
const multer = require('multer');
const { conn } = require('../config/gridfs');
const { GridFSBucket } = require('mongodb');
const {cloudStorage, cloudinary} = require("../cloudConfig");
const cloudUpload = multer({cloudStorage});

// Set up multer (memory storage, since we'll pipe it to GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage });


module.exports.uploadNewNote = (req, res) => {
    res.render("notes/upload");
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Function to upload thumbnail to Cloudinary
const uploadThumbnailToCloudinary = (filebuffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'image', // Specify that it's an image
                folder: 'Unishare_DEV', // Optional: specify folder in Cloudinary
            },
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result); // Return Cloudinary URL
            }
        ).end(filebuffer); // Upload the image buffer
    });
};

const uploadhandler = async (req, res) => {
    // Debugging the uploaded files
    console.log('Uploaded files:', req.files);

    // Check if files are in the request
    if (!req.files || !req.files['newfile']) {
        return res.status(400).send('❌ No note file uploaded.');
    }

    const noteFile = req.files['newfile'][0]; // The file uploaded for notes
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null; // The thumbnail, if provided

    // Check if the note file is too large
    if (noteFile.size > MAX_FILE_SIZE) {
        return res.status(400).send('❌ File too large. Max allowed size is 5 MB.');
    }

    const bucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });

    // Upload note to GridFS
    const uploadStream = bucket.openUploadStream(noteFile.originalname, {
        contentType: noteFile.mimetype,
    });
    uploadStream.end(noteFile.buffer);

    uploadStream.on('finish', async (file) => {
        try {
            let thumbnailUrl = '';

            // Upload thumbnail to Cloudinary if present
            if (thumbnailFile) {
                try {
                    const thumbnailResult = await uploadThumbnailToCloudinary(thumbnailFile.buffer);
                    thumbnailUrl = thumbnailResult.secure_url;  // Store Cloudinary URL
                } catch (error) {
                    console.error('❌ Error uploading thumbnail to Cloudinary:', error);
                    return res.status(500).send('Error uploading thumbnail');
                }
            }

            const newNote = new Note({
                title: req.body.title,
                description: req.body.description,
                subject: req.body.subject,
                fileName: noteFile.originalname, // From GridFS
                uploadedBy: req.session.user.id,
                fileId: uploadStream.id, // Store GridFS file ID
                image: thumbnailUrl, // Store Cloudinary URL for thumbnail
                notesYear: req.body.notesYear,
            });

            console.log("Note created");
            console.log(thumbnailUrl); // Debug thumbnail URL

            await newNote.save();
            return res.redirect('/notes');
        } catch (err) {
            console.error('❌ Error saving note metadata:', err);
            return res.status(500).send('Internal server error');
        }
    });

    uploadStream.on('error', (err) => {
        console.error('❌ GridFS Upload Error:', err);
        res.status(500).send('Upload error');
    });
};


module.exports.listAllNotes = async (req, res) => {
    const searchQuery = req.query.q?.trim();
    const year = req.query.year;
    const branch = req.query.branch;

    try {
        const query = {};

        // Year filter (from Note schema)
        if (year) {
            query.notesYear = parseInt(year);
        }

        // Get all notes based on search + year
        let notes = await Note.find(query).sort({ uploadedAt: -1 })
        .populate('uploadedBy').populate('ratedBy.user');

        // Branch filter (from uploadedBy.branch)
        if (branch) {
            notes = notes.filter(note => note.uploadedBy && note.uploadedBy.branch === branch);
        }

         // Text search
        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            notes = notes.filter(note =>
                regex.test(note.title) ||
                regex.test(note.description) ||
                regex.test(note.subject) ||
                (note.uploadedBy && regex.test(note.uploadedBy.name))
            );
        }

       

        const userId = req.session.user.id.toString();
        // Add userRating to each note
        const notesWithUserRating = notes.map(note => {
            const ratingEntry = note.ratedBy.find(r => r.user._id.toString() === userId);
            const userRating = ratingEntry ? ratingEntry.rating : 0;
            return {
                ...note.toObject(),
                userRating
            };
        });

        res.render('notes/notes', {
            currUser: req.session.user,
            notes: notesWithUserRating,
            query: searchQuery || '',
            selectedYear: year || '',
            selectedBranch: branch || ''
        });
    } catch (err) {
        console.error('Error loading notes:', err);
        res.status(500).send('Internal Server Error');
    }
};


module.exports.downloadNote = async (req, res) => {
    const bucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await conn.db.collection('uploads.files').findOne({ _id: fileId });

    if (!file) return res.status(404).send('File not found');

    res.set({
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.filename}"`
    });

    const stream = bucket.openDownloadStream(fileId);
    stream.pipe(res);
};

module.exports.previewNote = async (req, res) => {
    const bucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await conn.db.collection('uploads.files').findOne({ _id: fileId });

    if (!file) return res.status(404).send('File not found');

    res.set({
        'Content-Type': file.contentType,
        'Content-Disposition': `inline; filename="${file.filename}"`
    });

    const stream = bucket.openDownloadStream(fileId);
    stream.pipe(res);
};

module.exports.ratingNotes = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const rating = Number(req.body.rating);
        const noteId = req.body.noteId;

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note not found", type: "error" });
        }
        //if user already rated
      const alreadyRated = note.ratedBy.some(entry => entry.user.toString() === userId.toString());

        if (alreadyRated) {
            return res.status(200).json({ message: "You have already rated this note.", type: "error" });
        }
        //calculate average and count
        const prevAvg = note.rating.average;
        const prevCount = note.rating.count;

        const newCount = prevCount + 1;
        const newAvg = ((prevAvg * prevCount) + rating) / newCount;
        note.rating.average = newAvg;
        note.rating.count = newCount;
        note.ratedBy.push({user: userId, rating});
        await note.save();
        console.log(userId);
        console.log(req.session.user.id);

        return res.status(200).json({ message: `Rated ${rating} stars successfully!`, type: "success", average: newAvg.toFixed(1), count: newCount });
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Internel error");
    }
};

module.exports.upload = upload.fields([
    { name: 'newfile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

module.exports.postuploadNewNote = uploadhandler;