

//admin middleware
module.exports.isAdmin = (req, res, next)=>{
    if (req.session.user && req.session.user.isAdmin) {
        next();
    }
    else {
        res.render("users/login");
    }
};

//verified middleware to upload
module.exports.isVerified = (req, res, next) => {
    console.log(req.session.user);
    if (req.session.user && req.session.user.isVerified) {
        return next();
    }
    res.status(500).send("Access to only seniors");
};


//logged in 
 module.exports.isLoggedIn = (req, res, next)=> {
    if (req.session.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/user/login");
};

// flash middleware
module.exports.flashMiddleware = (req,res, next) =>{
    res.locals.message = req.session.message || '';
    res.locals.type = req.session.type || '';
  
    delete req.session.message;
    delete req.session.type;
    next();
};