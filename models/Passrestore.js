var mongoose = require('mongoose');
var crypto = require('crypto');

var passRestoreSchema = new mongoose.Schema({
    user:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    created_at: {
        type: Date,
        default: Date.now,
        expires: 3600
    },
    hash: String
});

passRestoreSchema.methods.setRestoreHash = function() {
    this.hash = crypto.randomBytes(16).toString('hex');
};


mongoose.model('PassRestore', passRestoreSchema);

