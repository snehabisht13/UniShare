const Junior = require('../models/Junior');
const Senior = require('../models/Senior');
const Note = require('../models/Note');
const bcrypt = require("bcrypt");

// profile
module.exports.viewProfile = async (req, res) => {
    const role = req.session.user.role;
    let user;
    if (role == "Senior") {
        user = await Senior.findById(req.session.user.id);
    }
    else if (role == "Junior") {
        user = await Junior.findById(req.session.user.id);
    }
    res.render("profile/profile", { user, role });
};

// saved notes by junior
module.exports.juniorSavesNotes = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const juniorUser = await Junior.findById(userId).populate("savedNotes");
        if (!juniorUser) {
            return res.status(400).send("User not found");
        }
        
        res.render("profile/saved", { savedNotes: juniorUser.savedNotes});
    }
    catch (err) {
        console.log(err);
        res.status(500).send("error");
    }
};

//uploaded notes by senior
module.exports.seniorUploads = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const uploadedNotes = await Note.find({ uploadedBy: userId });
        res.render("profile/uploaded", { uploadedNotes, user: req.session.user });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error");
    }
};

// junior is saving a note
module.exports.postJuniorsaved = async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await Junior.findById(req.session.user.id);
    const noteId = req.params.id;

    if (!user.savedNotes) user.savedNotes = [];
    const index = user.savedNotes.indexOf(noteId);

    if (index === -1) {
        user.savedNotes.push(noteId);
        req.session.message = "Saved note successfully";
        req.session.type = "success";
    }
    else {
        user.savedNotes.splice(index, 1);
        req.session.message = "Unsaved note sucessfully";
        req.session.type = "success";
    }
    await user.save();
    req.session.user.savedNotes = user.savedNotes;
    res.redirect(req.get("referer"));
};
//edit profile

module.exports.getEditProfile = async (req, res) => {
    try {
        const role = req.session.user.role;
        let user;
        if (role == "Senior") {
            user = await Senior.findById(req.session.user.id);
        }
        else if (role == "Junior") {
            user = await Junior.findById(req.session.user.id);
        }
        res.render("profile/editProfile", { user , role});
    }
    catch (err) {
        console.log(err);
    }
};

module.exports.postEditProfile = async (req, res) => {
    const userId = req.params.id;
    const currUser = req.session.user;

    if (currUser.role === "Junior") {
        const user = await Junior.findById(userId);
        const { name, currentYear, phoneNumber } = req.body;
        user.name = name;
        user.currentYear = currentYear || ' ';
        user.phoneNumber = phoneNumber || ' ';
        await user.save();
        req.session.user.name = name;
        req.session.user.currentYear = currentYear;
        req.session.user.phoneNumber = phoneNumber;
        req.session.message = "Profile updated";
        req.session.type = "success";
    }
    else if (currUser.role === "Senior") {
        const user = await Senior.findById(userId);
        const { name, phoneNumber, quote } = req.body;
        user.name = name;
        user.phoneNumber = phoneNumber || ' ';
        user.quote = quote || ' ';

        await user.save();
        req.session.user.name = name;
        req.session.user.phoneNumber = phoneNumber || ' ';
        req.session.user.quote = quote || ' ';
        req.session.message = "Profile updated";
        req.session.type = "success";
    }
    res.redirect("/profile");
};
//updating password
module.exports.updatePassword = (req, res) => {
    res.render("profile/updatePassword", { user: req.session.user });
};

module.exports.postUpdatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.params;

    const role = req.session.user.role;

    try {
        let user;
        if (role == "Junior") {
            user = await Junior.findById(id);
        }
        else if (role == "Senior") {
            user = await Senior.findById(id);
        }
        else {
            return res.send("no such user");
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            req.session.message = "Old password does not match";
            req.session.type = "error";
            return res.redirect("/profile/updatePassword");
        }

        if (oldPassword === newPassword) {
            req.session.message = "Password cannot be same";
            req.session.type = "error";
            return res.redirect("/profile/updatePassword");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.save();
        req.session.message = "Password changed successfully";
        req.session.type = "success";
        return res.redirect("/profile/updatePassword");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internel error");
    }
};

// myprofile of users
module.exports.getMyProfile = async (req, res) => {
    const userId = req.session.user.id;
    const user = await Senior.findById(userId);
    const notes = await Note.find({ uploadedBy: userId });
    res.render("profile/myProfile", { user, notes });
};

//senior profile visit
module.exports.seniorProfile = async (req, res) => {
    const { id } = req.params;
    const user = await Senior.findById(id);
    const currUser = req.session.user;
    const notes = await Note.find({ uploadedBy: id }).populate("uploadedBy");

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

    res.render("profile/myProfile", { user, notes:notesWithUserRating, currUser });
};
