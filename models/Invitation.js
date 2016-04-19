var mongoose = require('mongoose');
var crypto = require('crypto');

var invitationSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    to: String, //email
    INVITATION_HASH: String
});



invitationSchema.methods.setINVITATION_HASH = function() {
    this.INVITATION_HASH = crypto.randomBytes(16).toString('hex');
};



mongoose.model('Invitation', invitationSchema);

