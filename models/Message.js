var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    chat: {type: mongoose.Schema.Types.ObjectId, ref: 'Chat'},
    date: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String,
    readed: {
        type: Boolean,
        default: false
    }
});

messageSchema.methods.makeReaded = function(message, cb) {
    this.readed = true;
    this.save(cb);
};

mongoose.model('Message', messageSchema);