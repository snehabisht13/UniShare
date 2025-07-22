const Senior = require('../models/Senior');
const Junior = require('../models/Junior');
const nodemailer = require("nodemailer");
require("dotenv").config();


module.exports.pendingSeniors = async (req, res) => {
    try {
        const seniors = await Senior.find({ isVerified: false });
        res.render("adminProfile/dashboard", { seniors });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internel server error");
    }
};

module.exports.postVerifySeniors = async (req, res) => {
    const { id } = req.params;
    const senior = await Senior.findById(id);
    const action = req.query.action;
    let Verification;

    try {
        if (action == "accept") {
            await Senior.findByIdAndUpdate(id, { isVerified: true });
            Verification = "Accepted";
        }
        else if (action === "reject") {
            await Senior.findByIdAndDelete(id);
            Verification = "Rejected";
        }
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
            to: senior.email,
            subject: "Verification request",
            text: `Your verification request for unishare senior is ${Verification}`,
            html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="color: #0056b3;">UniShare Senior Verification</h2>
                            <p>Hello,</p>
                            <p>Your senior verification is:</p>
                            <h1 style="letter-spacing: 2px;">${Verification}</h1>
                            <p style="margin-top: 20px;">Thanks,<br>Team UniShare</p>
                        </div>
                    `
        };

        await transporter.sendMail(mailOptions);
        // res.status(200).json({ message: "OTP sent successfully!" });
        res.redirect("/admin/dashboard");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internel Server error");
    }
};


module.exports.listJuniors = async (req, res) => {
    const juniors = await Junior.find({});
    res.render("adminProfile/juniorList", { juniors });
};

module.exports.listSeniors = async (req, res) => {
    const seniors = await Senior.find({ isVerified: true });
    res.render("adminProfile/seniorList", { seniors });
};

module.exports.removeSeniors = async (req, res) => {
    const id = req.params.id;
    try {
        await Senior.findByIdAndUpdate(id, { isVerified: false });
        res.redirect("/admin/seniors");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internel error");
    }
};
