var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    gender: {
        type: String
    },
    date_of_birth: {
        type: Date
    },
    email: {
        type: String,
        unique: true
    },
    location: {
        type: [Number], // [Lon, Lat]
        index: '2dsphere',
        default: [0, 0]
    },
    userimage: {
        type: String,
        default: 'nouserimage_resized.jpg'
    },
    isAdmin: {
        type: Boolean,
        default: true
    },
    hash: String,
    salt: String,
    posts:[{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    pending_req:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], //pending requests for friend
    friends:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

//userSchema.index({location: '2dsphere'});

userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

userSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id:        this._id,
        username:   this.username,
        isAdmin:    this.isAdmin,
        exp:        parseInt(exp.getTime() / 1000)
    }, 'SECRET');

};

userSchema.methods.addFriend = function(friend_id, callback) {
    this.friends.push(friend_id);
    this.save(callback);
};

userSchema.methods.addFriendReq = function(friend_id, callback) {
    this.pending_req.push(friend_id);
    this.save(callback);
};

userSchema.methods.removeFriend = function(friend_id, callback) {
    var idx = this.friends.indexOf(friend_id);
    this.friends.splice(idx, 1);

    this.save(callback);
};

userSchema.methods.removeFriendReq = function(friend_id, callback) {
    var idx = this.pending_req.indexOf(friend_id);
    this.pending_req.splice(idx, 1);

    this.save(callback);
};

userSchema.methods.setLocation = function(lat, lon, callback) {

    this.location = [lon, lat];

    this.save(callback);
};

mongoose.model('User', userSchema);

