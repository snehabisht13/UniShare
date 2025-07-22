const Junior = require('../models/Junior')
const Senior = require('../models/Senior');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

//signup 
module.exports.getSignUp = (req, res) => {
    res.render("users/signup");
};

//otp
const otpStore = {};
module.exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Save OTP (add expiry if needed)
    otpStore[email] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // Optional: expires in 5 minutes
    };

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.GMAIL_HOST,
            port: parseInt(process.env.GMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,  // must match verified sender in Brevo
                pass: process.env.GMAIL_PASS   // Brevo SMTP password (not Gmail App Password)
            }
        });

        const mailOptions = {
            from: `"UniShare OTP" <sneha040222@gmail.com>`,
            to: email,
            subject: "Your UniShare OTP Code",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #0056b3;">🔐 UniShare OTP Verification</h2>
                    <p>Hello,</p>
                    <p>Your one-time password (OTP) is:</p>
                    <h1 style="letter-spacing: 2px;">${otp}</h1>
                    <p>This code is valid for 5 minutes only.</p>
                    <p style="margin-top: 20px;">Thanks,<br>Team UniShare</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully!" });
    } catch (err) {
        console.error("❌ Failed to send OTP:", err.message);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

module.exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!otpStore[email]) {
        req.session.message = "OTP not valid";
        req.session.type = "error";
        res.redirect("/user/signup");
    }
    if (Date.now() > otpStore[email].expiresAt) {
        req.session.message = "OTP expired";
        req.session.type = "error";
        res.redirect("/user/signup");
    }
    if (otpStore[email].otp != otp) {
        req.session.message = "OTP not valid";
        req.session.type = "error";
        res.redirect("/user/signup");
    }
    delete otpStore[email];
    req.session.emailVerified = email;
    req.session.message = "OTP verified";
    req.session.type = "success";
    res.redirect("/user/signupJunior");
};

//sign up junior start
module.exports.getJuniorSignUp = (req, res) => {
    const emailVerified = req.session.emailVerified;
    res.render("users/signupJunior", { emailVerified });
};

module.exports.postJuniorSignUp = async (req, res) => {
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = req.session.emailVerified?.toLowerCase();

    const existSenior = await Senior.findOne({ email });
    if (existSenior) {
        req.session.message = "Already exist as Senior";
        req.session.message = "error";
        res.redirect("/user/login");
    }
    try {
        await Junior.create({
            name: req.body.name,
            email: email,
            password: hashedPassword,
            branch: req.body.branch,
            currentYear: req.body.currentYear,
            phoneNumber: req.body.phoneNumber,
            DOB: req.body.DOB,
        });
        req.session.message = `Welcome ${req.body.name} to uniShare`;
        req.session.type = "success";
        res.redirect("/home");
    }
    catch (error) {
        if (err.code == 11000) {
            res.send("Already exist");
        }
        else {
            console.log(err);
            res.send("Something went wrong");
        }
    }
};

//sign up senior 
module.exports.getSeniorSignUp = (req, res) => {
    const emailVerified = req.session.emailVerified;
    res.render("users/signupSenior", { emailVerified });
};

module.exports.postSeniorSignUp = async (req, res) => {
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = req.session.emailVerified?.toLowerCase();

    const existJunior = await Junior.findOne({ email });
    if (existJunior) {
        req.session.message = "Already exist as junior";
        req.session.message = "error";
        res.redirect("/user/signupSenior");
    }
    try {
        await Senior.create({
            name: req.body.name,
            email: email,
            password: hashedPassword,
            branch: req.body.branch,
            graduationYear: req.body.graduationYear,
            collegeIdUrl: req.body.collegeIdUrl,
            phoneNumber: req.body.phoneNumber,
            DOB: req.body.DOB
        });
        req.session.message = `Verification request sent to admin..kindly wait`;
        req.session.type = "success";
        res.redirect("/user/login");
    }
    catch (err) {
        if (err.code == 11000) {
            res.send("Already exist");
        }
        else {
            console.log(err);
            res.send("Something went wrong");
        }
    }
};

//login
module.exports.getLogin = (req, res) => {
    res.render("users/login");
};

module.exports.postLogin = async (req, res) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    try {
        let user = null;
        let role = null;
        //check for junior
        if (!user) {
            user = await Junior.findOne({ email });
            if (user) {
                role = "Junior";
            }
        };
        //check for senior
        if (!user) {
            user = await Senior.findOne({ email });
            if (user) {
                role = "Senior";
            }
        };
        //none
        if (!user) {
            req.session.message = "No user found";
            req.session.type = "error";
            return res.redirect("/user/login");
        }

        if (role === "Senior" && !user.isVerified) {
            req.session.message = "Not verified by admin yet. Kindly wait";
            req.session.type = "error";
            return res.redirect("/user/login");

        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.session.message = "Incorrect password";
            req.session.type = "error";
            return res.redirect("/user/login");
        };

        //store session
        req.session.user = {
            id: user._id,
            email: user.email,
            role: role,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            name: user.name,
            branch: user.branch,
            currentYear: user.currentYear,
            phoneNumber: user.phoneNumber,
            DOB: user.DOB,
            graduationYear: user.graduationYear,
            collegeIdUrl: user.collegeIdUrl,
            savedNotes: user.savedNotes
        };
        //  res.redirect("/home");
        const redirectTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        req.session.message = "Logged In successfully";
        req.session.type = "success";
        res.redirect(redirectTo);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internel error");
    }
};

module.exports.forgotPassword = (req, res) => {
    res.render("users/forgotPass");
};

const otpStorePass = {};
module.exports.otpPasswordReset = async (req, res) => {
    const { email, role } = req.body;
    console.log(role);
    let user;
    if (role == "Junior") {
        user = await Junior.findOne({ email: email.toLowerCase() });
    }
    else if (role == "Senior") {
        user = await Senior.findOne({ email: email.toLowerCase() });
    }
     if (!user) {
        return res.status(400).json({
            message: "User does not exist of this role or email",
            type: "error"
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    // Save OTP (add expiry if needed)
    otpStorePass[email] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // Optional: expires in 5 minutes
    };

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.GMAIL_HOST,
            port: parseInt(process.env.GMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,  // must match verified sender in Brevo
                pass: process.env.GMAIL_PASS   // Brevo SMTP password (not Gmail App Password)
            }
        });

        const mailOptions = {
            from: `"UniShare OTP" <sneha040222@gmail.com>`,
            to: email,
            subject: "Your UniShare OTP Code for password reset",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #0056b3;">🔐 UniShare OTP Verification</h2>
                    <p>Hello,</p>
                    <p>Your one-time password (OTP) is:</p>
                    <h1 style="letter-spacing: 2px;">${otp}</h1>
                    <p>This code is valid for 5 minutes only.</p>
                    <p style="margin-top: 20px;">Thanks,<br>Team UniShare</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully!" });
    } catch (err) {
        console.error("❌ Failed to send OTP:", err.message);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

module.exports.verifyPasswordOtp = async (req, res) => {
    const { email, otpSection, password, role } = req.body;
    //otp verify
    if (!otpStorePass[email]) {
        req.session.message = "OTP not valid";
        req.session.type = "error";
        return res.redirect("/user/forgot");
    }
    if (Date.now() > otpStorePass[email].expiresAt) {
        req.session.message = "OTP expired";
        req.session.type = "error";
        return res.redirect("/user/forgot");
    }
    if (otpStorePass[email].otp != otpSection) {
        req.session.message = "OTP not valid";
        req.session.type = "error";
        return res.redirect("/user/forgot");
    }
    delete otpStorePass[email];
    //save new password
    try {
        let user;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (role == "Junior") {
            user = await Junior.findOne({ email });
        }
        else if (role == "Senior") {
            user = await Senior.findOne({ email });
        }
        if (!user) {
            req.session.message = "Not a valid user";
            req.session.type = "error";
        }
        user.password = hashedPassword;
        await user.save();
        req.session.message = "Password changed succesfully";
        req.session.type = "success";
        res.redirect("/user/login");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
};

module.exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/user/login");
    });
};