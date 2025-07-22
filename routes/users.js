const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

//sign up
router.get("/signup", userController.getSignUp);

//otp
router.post("/send-otp", userController.sendOTP);
router.post("/verify-otp", userController.verifyOTP);
//sign up as junior
router.get("/signupJunior", userController.getJuniorSignUp);

router.post("/signupJunior", userController.postJuniorSignUp);


//sign up as senior
router.get("/signupSenior", userController.getSeniorSignUp);

router.post("/signupSenior", userController.postSeniorSignUp);

//login
router.get("/login", userController.getLogin);

router.post("/login", userController.postLogin);

//forgot password
router.get("/forgot", userController.forgotPassword);
router.post("/send-otp-reset", userController.otpPasswordReset);
router.post("/verify-otp-reset", userController.verifyPasswordOtp);
//log out
router.get("/logout", userController.logout);

module.exports = router;