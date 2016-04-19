var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    body: String,
    date: Date,
    upvotes:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

commentSchema.methods.upvote = function (author_id, cb) {
    this.upvotes.push(author_id);
    this.save(cb);
};

mongoose.model('Comment', commentSchema);