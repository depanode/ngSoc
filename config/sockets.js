var mongoose  = require('mongoose');
var Chat      = mongoose.model('Chat');
var Message   = mongoose.model('Message');

module.exports = function (io) {

    io.on('connection', function(socket) {

        socket.on('join', function(data) {
            socket.join(data.user._id);
        });

        socket.on('message send', function(data, fn) {

            var myId     = data.from._id;
            var friendId = data.to._id;

            var query = {
                participants: {
                    $all: [myId, friendId]
                }
            };

            Chat.findOne(query, function(err, chat) {
                if (err) return next(err);

                var newMsg = new Message();
                newMsg.chat = chat._id;
                newMsg.date = Date.now();
                newMsg.author = myId;
                newMsg.body = data.msg;

                newMsg.save(function(err, msg) {
                    if (err) return next(err);

                    chat.addMessage(msg, function(err) {
                        if (err) return next(err);

                        msg.populate('author', function(err, msg) {
                            socket.to(friendId).emit('new message', msg);
                            fn(msg);
                        });
                    });
                })
            })
        });

        socket.on('disconnect', function(data) {

        });

    });
};