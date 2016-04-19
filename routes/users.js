var express   = require('express');
var router    = express.Router();
var mongoose  = require('mongoose');
var multer    = require('multer');
var mailer    = require('../config/mailer');
var Jimp      = require('jimp');

var Post       = mongoose.model('Post');
var User       = mongoose.model('User');
var Comment    = mongoose.model('Comment');
var Chat       = mongoose.model('Chat');
var Message    = mongoose.model('Message');
var Invitation = mongoose.model('Invitation');

/*function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}*/

router.param('user', function(req, res, next, username) {
    var query = {username: username};
    User.findOne(query, function(err, user) {
        if (err) return next(err);

        req.user = user;
        return next();
    })
});

router.get('/:user', function(req, res, next) {
    User.findOne({_id: req.user._id}, {hash: 0, salt: 0})
        .populate('friends', {hash: 0, salt: 0})
        .populate('pending_req', {hash: 0, salt: 0})
        .exec(function(err, user) {
            if (err) return next(err);

            if (!user) {
                return res.json({msg: "Can't find user"});
            }

            res.json(user);
        });
});

router.get('/:user/posts', function(req, res, next) {
    User.findOne({username: req.params.user}, function(err, user) { //TODO check this
        if (err) return next(err);

        if (!user) {
            res.status(404).json({message: req.params.user + ' not found'});
            return;
        }

        Post.find({author: user._id})
            .populate('author')
            .populate({
                path: 'comments',
                populate: {path: 'author'}
            })
            .exec(function(err, posts) {
                if (err) return next(err);

                res.json(posts);
            });
    });
});

router.get('/:user/messages', function(req, res, next) { //get user's messages

    var myId = req.payload._id;
    var friendId = req.user._id;

    var query = {
        participants: {
            $all: [myId, friendId]
        }
    };

    Chat.findOne(query, function(err, chat) {

        var finded = chat;

        if (!finded) {
            var newChat = new Chat();
            newChat.participants.push(myId);
            newChat.participants.push(friendId);

            newChat.save(function(err, chat) {
                if (err) return next(err);
                finded = chat;
                console.log('Chat created');

                getMessages(finded);
            })
        } else {
            getMessages(finded);
        }
    });

    var getMessages = function(finded) {
        Message.find({chat: finded._id}).populate('author').exec(function(err, messages) {
            if (err) return next(err);

            res.json(messages);
        })
    };

});

router.post('/:user/friends/add', function(req, res, next) {

    var friend = req.user;

    User.findById(req.payload._id, function(err, me) {
        if (err) return next(err);

        if (me.pending_req.indexOf(friend._id) !== -1 &&
            me.friends.indexOf(friend._id) === -1) { //if user already in my pending friend requests

            me.addFriend(friend._id, function(err, me) { //add to friend
                if (err) return next(err);

                friend.addFriend(me._id, function(err, friend) { //add to friend
                    if (err) return next(err);

                    me.removeFriendReq(friend._id, function(err, friend) {
                        if (err) return next(err);

                        return res.json({msg: 'Friend added'});

                    });
                })
            })

        } else {

            if (friend.pending_req.indexOf(me._id) !== -1) {
                return res.json({msg: 'You already send request'});
            }

            friend.addFriendReq(me._id, function(err, friend) { //else add to pending requests
                if (err) return next(err);

                return res.json({msg: 'Request sent'});
            })
        }
    })
});

router.post('/:user/friends/decline', function(req, res, next) {

    var friend = req.user;

    User.findById(req.payload._id, function(err, me) {
        if (err) return next(err);

        var idx = me.pending_req.indexOf(friend._id);

        me.pending_req.splice(idx, 1);

        me.save(function(err, me) {
            if (err) return next(err);

            res.json({msg: 'Request deleted'});
        })
    })
});

router.delete('/:user/friends/remove', function(req, res, next) {

    User.findById(req.payload._id, function(err, user) {
        if (err) return next(err);

        user.removeFriend(req.user._id, function(err, user) {
            if (err) return next(err);

            req.user.removeFriend(req.payload._id, function() {
                if (err) return next(err);

                res.json({msg: 'Friend removed'});
            });
        })
    })

});

router.post('/:user/location/set', function(req, res, next) {

    var lat = req.body.lat;
    var lon = req.body.lon;

    if (!lat || !lon) {return;}

    User.findById(req.payload._id, function(err, user) {
        if (err) return next(err);

        user.setLocation(lat, lon, function(err, user) {
            if (err) return next(err);

            res.json({msg: 'Location updated'});
        })
    })
});

router.post('/:user/edit', multer({dest: 'public/images/fullsize_userimages'}).single('avatar'), function(req, res, next) {

    if (req.user._id != req.payload._id) {
        return res.status(401).json({msg: 'Access denied'});
    }

    req.checkBody('first_name', 'First name is incorrect').notEmpty().isLength({min: 2, max: 15});
    req.checkBody('last_name', 'Last name is incorrect').notEmpty().isLength({min: 2, max: 15});
    req.checkBody('date_of_birth', 'Date of birth is required').notEmpty().isDate();
    req.checkBody('email', 'Email not valid').isEmail();


    var errors = req.validationErrors();
    if (errors) {
        res.status(401).json({msg: errors});
        return;
    }

    var user = req.user;

    user.first_name    = req.body.first_name;
    user.last_name     = req.body.last_name;
    user.date_of_birth = req.body.date_of_birth;
    user.email         = req.body.email;

    var file = req.file;

    if (file) {

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
        user.save(function(err, user) {
            if (err) {return next(err);}

            res.json({success: true, msg: 'User details succesfully changed'});
        })
    }

});

router.post('/:user/edit/password', function(req, res, next) {

    var user            = req.user;
    var currentPassword = req.body.currentPassword;
    var newPassword     = req.body.password;

    if (user._id != req.payload._id) {
        return res.status(401).json({msg: 'Access denied'});
    }

    if (!user.validPassword(currentPassword)) {
        return res.status(401).json({msg: 'Incorrect current password'});
    }

    req.checkBody('password', 'password is required').notEmpty().isLength({min: 6, max: 30});
    req.checkBody('password1', 'Password do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(401).json(errors);
    }

    user.setPassword(newPassword);
    user.save(function(err, user) {
        if (err) {return next(err);}

        res.json({msg: 'Password succesfully changed'})
    })

});

router.post('/query', function(req, res, next) {

    var lat         = req.body.latitude;
    var long        = req.body.longitude;
    var distance    = req.body.distance;
    var friendsOnly = req.body.friendsOnly;

    var query = User.find({_id: {$ne: req.payload._id}}, {hash: 0, salt: 0});

    if(distance){

        query = query.where('location').near({
            center: {
                type: 'Point',
                coordinates: [long, lat]
            },
            maxDistance: distance * 1000,
            spherical: true
        });
    }

    if(friendsOnly){
        query = query.find({friends: req.payload._id});
    }

    query.exec(function(err, users){
        if(err) {return next(err);}

        res.json(users);
    });
});

router.post('/invite', function(req, res, next) {

    req.checkBody('to', 'Email not valid').isEmail();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(401).json(errors);
    }

    User.findOne({email: req.body.to}, function(err, user) {
        if (err) {return next(err);}

        if (user) {
            return res.json({msg: 'User with this email already registered'});
        } else {

            var newInvite = new Invitation();
            newInvite.to = req.body.to;
            newInvite.from = req.payload._id;
            newInvite.setINVITATION_HASH();

            newInvite.save(function(err, invite) {
                if (err) {return next(err);}

                var origin = req.headers.referer;
                var subject = "You got new invitation";
                var text = invite.INVITATION_HASH;
                var html = "To activate your invitation please follow this link: " +
                    "<b><a href=\"" + origin + "#/register/" + invite.INVITATION_HASH + "\">" +
                    origin + "#/register/" + invite.INVITATION_HASH + "</b>";

                mailer(invite.to, subject, text, html);

                res.json({success: true, msg: 'Invite succesfully sent'});

            });
        }
    });
});


module.exports = router;