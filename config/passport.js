var passport        = require('passport');
var localStrategy   = require('passport-local').Strategy;
var mongoose        = require('mongoose');
var User            = mongoose.model('User');

passport.use(new localStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { msg: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { msg: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

