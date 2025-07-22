const express = require('express');
const router = express.Router();
const {isVerified, isLoggedIn} = require("../middlewares");
const queryController = require("../controllers/chat");


router.get("/senior/:id",isLoggedIn, queryController.getQueryPage);

router.post("/:id/queryPost", isLoggedIn, queryController.postQuery);

router.post("/:id/reply", isLoggedIn,isVerified, queryController.postReply);

module.exports = router;