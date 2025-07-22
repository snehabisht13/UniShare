const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const {isAdmin} = require('../middlewares');


//pending request
router.get("/dashboard", isAdmin, adminController.pendingSeniors);

//verify or reject request
router.post("/verify/:id", isAdmin, adminController.postVerifySeniors);

//List of juniors
router.get("/juniors", isAdmin, adminController.listJuniors);

//List of seniors
router.get("/seniors", isAdmin, adminController.listSeniors);

//remove seniors
router.post("/senior/remove/:id", isAdmin, adminController.removeSeniors);

module.exports = router;

