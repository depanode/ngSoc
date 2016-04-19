var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    title: String,
    date: Date,
    image: {type: String, default: 'no-image.jpg'},
    upvotes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

postSchema.methods.upvote = function(author_id, cb) {
    this.upvotes.push(author_id);
    this.save(cb);
};

postSchema.methods.addComment = function(comment, cb) {
    this.comments.push(comment);
    this.save(cb);
};

mongoose.model('Post', postSchema);