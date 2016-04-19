var express   = require('express');
var router    = express.Router();
var mongoose  = require('mongoose');

var Post    = mongoose.model('Post');
var User    = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Chat    = mongoose.model('Chat');
var Message = mongoose.model('Message');
var TempUser = mongoose.model('TempUser');



router.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        if (err) {return next(err);}

        res.json(users);
    })
});

router.get('/pending/activations', function(req, res) {
    TempUser.find({}, function(err, users) {
        if (err) {return next(err);}

        res.json(users);
    })
});

router.delete('/pending/activations/:hash', function(req, res) {
    TempUser.remove({VERIFICATION_HASH: req.params.hash}, function(err) {
        if (err) {return next(err);}

        res.json({msg: 'Activation removed'});
    })
});

router.delete('/users/:userId', function (req, res, next) {

    var id = req.params.userId;

    User.remove({_id: id}, function (err) {
        if (err) {
            return next(err);
        }

        User.update({}, { //delete user from other users.friends
                $pull: {
                    'friends': id
                }
            }, {
                multi: true
            }, function () {
                res.json({msg: 'User with id: ' + id + ' was deleted'});
            }
        );
    });
});

router.post('/users/edit', function(req, res, next) {

    var user = req.body;

    User.findOne({_id: user._id}, function(err, user) {
        if (err) {return next(err);}

        user.first_name    = req.body.first_name;
        user.last_name     = req.body.last_name;
        user.date_of_birth = req.body.date_of_birth;
        user.email         = req.body.email;
        user.gender        = req.body.gender;
        user.isAdmin       = req.body.isAdmin;
        user.userimage     = req.body.userimage;

        user.save(function(err) {
            if (err) {return next(err);}

            res.json({success: true, msg: 'User details succesfully changed'});
        })

    });

});


module.exports = router;