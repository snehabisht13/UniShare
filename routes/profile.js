const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');
const {isLoggedIn, isVerified} = require('../middlewares');

//view profile
router.get("/", isLoggedIn, profileController.viewProfile);

//junior saves a note
router.post("/notes/save/:id", isLoggedIn, profileController.postJuniorsaved);

//junior access saved notes
router.get("/junior/saved", isLoggedIn, profileController.juniorSavesNotes);

//senior access uploaded notes
router.get("/senior/uploads", isLoggedIn,isVerified, profileController.seniorUploads);

// edit profile
router.get("/editProfile", isLoggedIn, profileController.getEditProfile);

//save edit profile
router.post("/editProfile/:id", isLoggedIn,profileController.postEditProfile);

//update password
router.get("/updatePassword", isLoggedIn, profileController.updatePassword);
router.post("/updatePassword/:id", isLoggedIn, profileController.postUpdatePassword);

//my personal profile
router.get("/myProfile", isLoggedIn, isVerified ,profileController.getMyProfile);

//senior profile
router.get("/senior/:id",isLoggedIn, profileController.seniorProfile);


module.exports = router;