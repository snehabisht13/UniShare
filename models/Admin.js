const mongoose = require('mongoose');
const Senior = require('./Senior');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.ATLASDB_URL);
async function CreateAdmin() {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
    await Senior.create({
        name: "Admin Sneha",
        email: "snehabisht115@gmail.com",
        password: hashedPassword,
        branch: "CSE",
        graduationYear: 2025,
        collegeIdUrl: "img",
        isVerified: true,
        phoneNumber: 9354432477,
        isAdmin: true,
        DOB: "13 oct 2024"
    });
    console.log("admin created");
    mongoose.disconnect();
};

CreateAdmin();