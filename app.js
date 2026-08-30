if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const Note = require('./models/Note');
const {isLoggedIn, flashMiddleware} = require("./middlewares");

//routers
const adminRouter = require('./routes/admin');
const notesRouter = require('./routes/notes');
const userRouter = require('./routes/users');
const profileRouter = require('./routes/profile');
const chatRouter = require('./routes/chat');

const app = express();

const dbUrl = process.env.ATLASDB_URL;
async function startServer() {
  try {
    await mongoose.connect(dbUrl);

    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 1000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is listening on port ${PORT}`);
    });

  } catch (err) {
    console.error("Cannot connect to MongoDB:", err);
    process.exit(1);
  }
}

app.set("view engine", "ejs"); // for ejs files
app.use(express.urlencoded({ extended: true })); //json format
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },  
    touchAfter: 24*3600,
});

store.on("error",(err)=>{
    console.log("Error in mongo session: ", err);
});

app.use(session({ //recording session of user
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


 
app.use(flashMiddleware);
app.use((req, res, next) => {
    res.locals.currUser = req.session.user;
    next();
});

app.use((req, res, next) => {
  res.locals.toast = req.session.toast || null;
  delete req.session.toast;
  next();
});

app.get("/", async (req, res) => {
    try {
        const message = req.session.message || ' ';
        const type = req.session.type || ' ';
        const notes = await Note.find({}).sort({ uploadedAt: -1 }).populate('uploadedBy').limit(1);
        res.render("home", { notes, message, type});
    }
    catch (err) {
        console.log(err);
        res.status(500).send("server error");
    }
});

app.get("/home", async (req, res) => {
    try {
        const message = req.session.message || ' ';
        const type = req.session.type || ' ';
        const notes = await Note.find({}).sort({ uploadedAt: -1 }).populate('uploadedBy').limit(1);
        res.render("home", { notes, message, type});
    }
    catch (err) {
        console.log(err);
        res.status(500).send("server error");
    }
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/contact", isLoggedIn, (req, res) => {
    res.render("contact");
});

//routes
app.use("/admin", adminRouter);
app.use("/notes",notesRouter);
app.use("/user",userRouter);
app.use("/profile", profileRouter);
app.use("/chat", chatRouter);




// app.get("/file/edit/:id", async (req,res)=>{
//     const fileId = req.params.id;
//     const note = await Note.findOne({fileId});
//     res.render("editNote", {note});
// });

// app.post("/file/edit/:id", async(req,res)=>{
//     const fileId = req.params.id;
//     console.log(fileId);
//     const note = await Note.findById(fileId);
//      console.log(note);
//     const year = req.body.notesYear;

//     if(!note.notesYear){
//         note.notesYear = year;
//         await note.save();
//         console.log(note.notesYear);
//     };
//     console.log(note);
//     res.redirect("/notes");
// })

app.use((req, res) => {
    res.status(404).send("Page not found");
});

startServer();

