var mongoose = require('mongoose');

var chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
});

chatSchema.methods.addMessage = function(message, cb) {
    this.messages.push(message._id);
    this.save(cb);
};

mongoose.model('Chat', chatSchema);