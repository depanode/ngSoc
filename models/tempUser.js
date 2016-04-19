var mongoose = require('mongoose');
var crypto = require('crypto');

var tempUserSchema = new mongoose.Schema({
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
    hash: String,
    salt: String,
    VERIFICATION_HASH: String
});

tempUserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

tempUserSchema.methods.setVERIFICATION_HASH = function() {
    this.VERIFICATION_HASH = crypto.randomBytes(16).toString('hex');
};

tempUserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

mongoose.model('TempUser', tempUserSchema);

