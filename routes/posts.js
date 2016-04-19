var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var multer = require('multer');
var Jimp = require('jimp');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.param('post', function(req, res, next, id) {
    Post.findById(id, function(err, post) {
        if (err) return next(err);

        req.post = post;
        return next();
    })
});

router.param('comment', function(req, res, next, id) {
    Comment.findById(id, function(err, comment) {
        if (err) return next(err);

        req.comment = comment;
        return next();
    })
});

router.get('/', function(req, res, next) {
    Post.find().populate('author').exec(function(err, posts) {
        if (err) return next(err);

        res.json(posts);
    })
});

router.post('/', multer({dest: 'public/images/fullsize_postimages'}).single('image'), function(req, res, next) {

    var post = new Post();

    post.title = req.body.title;
    post.author = req.payload._id;
    post.date = Date.now();

    console.log(post);

    var file = req.file;

    if (file) {

        if (file.mimetype !== 'image/png' &&
            file.mimetype !== 'image/bmp' &&
            file.mimetype !== 'image/jpeg') {
            return res.status(415).json({msg: 'Unsupported file format, only PNG, JPEG or BMP supported'});
        }

        var filename = file.filename + '.' + file.originalname.split('.')[1];

        Jimp.read("public/images/fullsize_postimages/" + file.filename, function (err, file) {
            if (err) throw err;
            file.resize(170, 170).quality(60).write('public/images/postimages/' + filename, function (err) {
                if (err) {
                    console.log(err);
                }
                post.image = filename;

                savePost();

            });
        });

    } else {

        savePost();

    }

    function savePost() {
        post.save(function(err, post) {
            if (err) return next(err);

            res.json(post);
        })
    }

});

router.delete('/:postid', function(req, res, next) {
    var id = req.params.postid;
    var query = {_id: id};

    Post.remove(query, function(err) {
        if (err) {
            return next(err);
        } else {
            Comment.remove({post: id}, function(err) { //remove all post's comments
                if (err) {return next(err);}

                res.json({msg: 'Post deleted'});
            });
        }
    })
});

router.get('/:post', function(req, res, next) {
    req.post.populate('comments', function(err, post) {
        if (err) return next(err);
        res.json(req.post);
    });
});

router.put('/:post/upvote', function(req, res, next) {
    var author = req.payload._id;

    if (req.post.upvotes.indexOf(author) != -1) return next();

    req.post.upvote(req.payload._id, function(err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.post('/:post/comments', function(req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;
    comment.author = req.payload._id;
    comment.date = Date.now();

    comment.save(function(err, comment) {
        if (err) return next(err);

        req.post.comments.push(comment);
        req.post.save(function(err, post) {
            if (err) return next(err);

            res.json(comment);
        })
    });

});

router.put('/:post/comments/:comment/upvote', function(req, res, next) {
    req.comment.upvote(function(err, comment) {
        if (err) return next(err);
        res.json(comment);
    })
});

module.exports = router;