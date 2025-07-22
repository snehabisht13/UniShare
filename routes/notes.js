const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');
const {isVerified, isLoggedIn} = require("../middlewares");

//notes
router.get("/",isLoggedIn, notesController.listAllNotes);

//upload a new note
router.get("/upload", isVerified, isLoggedIn ,notesController.uploadNewNote);

router.post("/upload", isVerified, isLoggedIn,notesController.upload ,notesController.postuploadNewNote);

//download
router.get("/file/download/:id", isLoggedIn, notesController.downloadNote);

//preview
router.get("/file/preview/:id",isLoggedIn, notesController.previewNote);

//rating
router.post("/rate-note", isLoggedIn, notesController.ratingNotes);

module.exports = router;