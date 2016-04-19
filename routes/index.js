var express     = require('express');
var router      = express.Router();
var mongoose    = require('mongoose');
var passport    = require('passport');
var multer      = require('multer');
var Jimp        = require('jimp');

var mailer      = require('../config/mailer');

var User        = mongoose.model('User');
var TempUser    = mongoose.model('TempUser');
var Invitation  = mongoose.model('Invitation');
var PassRestore = mongoose.model('PassRestore');


router.get('/', function (req, res) {
    res.render('index', {});
});

router.post('/register', multer({dest: 'public/images/fullsize_userimages'}).single('avatar'), function (req, res, next) {

    req.checkBody('username', 'Incorrect username').notEmpty().matches(/^[a-zA-Z0-9]*$/, "i").isLength({min: 2, max: 15});
    req.checkBody('first_name', 'First name is incorrect').notEmpty().isLength({min: 2, max: 15});
    req.checkBody('last_name', 'Last name is incorrect').notEmpty().isLength({min: 2, max: 15});
    req.checkBody('gender', 'Gender is required').notEmpty();
    req.checkBody('date_of_birth', 'Date of birth is required').notEmpty().isDate();
    req.checkBody('email', 'Email not valid').isEmail();
    req.checkBody('password', 'password is required').notEmpty().isLength({min: 6, max: 30});
    req.checkBody('password1', 'Password do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.status(401).json({msg: errors});
        return;
    }

    var user = new TempUser();

    user.username       = req.body.username;
    user.first_name     = req.body.first_name;
    user.last_name      = req.body.last_name;
    user.gender         = req.body.gender;
    user.date_of_birth  = req.body.date_of_birth;
    user.email          = req.body.email;

    user.location[0] = Number(req.body.lon);
    user.location[1] = Number(req.body.lat);

    user.setPassword(req.body.password);
    user.setVERIFICATION_HASH();

    var file = req.file;

    if (file) {//TODO check file type - PNG, JPEG or BMP only supported

        if (file.mimetype !== 'image/png' &&
            file.mimetype !== 'image/bmp' &&
            file.mimetype !== 'image/jpeg') {
            return res.status(415).json({msg: 'Unsupported file format, only PNG, JPEG or BMP supported'});
        }

        var filename = file.filename + '.' + file.originalname.split('.')[1];

        Jimp.read("public/images/fullsize_userimages/" + file.filename, function (err, file) {
            if (err) throw err;
            file.resize(256, 256).quality(60).write('public/images/userimages/' + filename, function (err) {
                if (err) {
                    console.log(err);
                }
                user.userimage = filename;

                saveUser();

            });
        });

    } else {

        saveUser();

    }

    function saveUser() {
        user.save(function (err, user) {

            if (err && err.code === 11000) {
                return res.status(401).json({msg: 'User with this username already exists'});
            }

            if (err) {
                return next(err);
            }

            var origin = req.headers.referer;
            var subject = "Account registration confirmation";
            var text = user.VERIFICATION_HASH;
            var html = "To activate your account please follow this link: " +
                "<b><a href=\"" + origin + "#/activate/" + user.VERIFICATION_HASH + "\">" +
                origin + "#/activate/" + user.VERIFICATION_HASH + "</b>";

            mailer(user.email, subject, text, html);

            res.json({success: true, msg: 'Check your e-mail for activation link'});

        });
    }

});

router.get('/register/invitation/:INVITATION_HASH', function (req, res, next) {
    var hash = req.params.INVITATION_HASH;

    Invitation.findOne({INVITATION_HASH: hash}, function (err, invite) {
        if (err) {
            return next(err);
        }

        if (!invite) {
            res.status(405).json({msg: 'Invalid invitation code'});
        } else {
            res.json(invite);
        }
    })
});

router.get('/register/:VERIFICATION_HASH', function (req, res, next) {
    var hash = req.params.VERIFICATION_HASH;

    TempUser.findOne({VERIFICATION_HASH: hash}, function (err, tempUser) {
        if (err) {
            return next(err);
        }

        if (!tempUser) {
            res.json({msg: 'Invalid activation code'});
        } else {

            var newUser = new User();

            newUser.username        = tempUser.username;
            newUser.first_name      = tempUser.first_name;
            newUser.last_name       = tempUser.last_name;
            newUser.gender          = tempUser.gender;
            newUser.date_of_birth   = tempUser.date_of_birth;
            newUser.email           = tempUser.email;
            newUser.location        = tempUser.location;
            newUser.userimage       = tempUser.userimage;
            newUser.hash            = tempUser.hash;
            newUser.salt            = tempUser.salt;

            newUser.save(function (err, user) {
                if (err) {
                    return next(err);
                }

                TempUser.findById(tempUser._id).remove(function (err) {
                    if (err) console.log(err);

                    res.json({msg: 'Activation successful!'});

                });
            })
        }
    })
});

router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill both fields'});
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);

});

router.post('/reset', function (req, res, next) {
    User.findOne({email: req.body.email}, function(err, user) {
        if (err) {return next(err);}

        if (!user) {
            return res.status(404).json({msg: "User with this email doesn't exist"});
        }

        var restore = new PassRestore();
        restore.user = user._id;
        restore.setRestoreHash();

        restore.save(function(err, restore) {
            if (err) {return next(err);}

            var origin = req.headers.referer;
            var subject = origin + "password reset";
            var text = restore.hash;
            var html = "To change your account password please follow this link: " +
                "<b><a href=\"" + origin + "#/restore/" + restore.hash + "\">" +
                origin + "#/restore/" + restore.hash + "</b>";

            mailer(user.email, subject, text, html);

            res.json({msg: 'Check your email for link'});

        });
    })
});

router.post('/reset/:hash', function (req, res, next) {
    PassRestore.findOne({hash: req.params.hash}, function(err, restore) {
        if (err) {return next(err);}

        if (!restore) {
            return res.json({msg: 'Invalid restoration hash'});
        } else {
            User.findById(restore.user, function(err, user) {
                if (err) {return next(err);}

                if (!user) {
                    return res.json({msg: 'Unknown user'});
                } else {
                    user.setPassword(req.body.password);

                    user.save(function(err, user) {
                        if (err) {return next(err);}

                        res.json({msg: 'Password was changed'});
                    })
                }
            })
        }
    })
});

module.exports = router;
