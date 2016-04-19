app.factory('messages', [
    '$http',
    'socket',
    'auth',
    function($http, socket, auth){

        var o = {
            messages: {},
            getMessages: getMessages,
            sendMessage: sendMessage
        };

        function getMessages(friend) {
            return $http.get('/users/'+friend.username+'/messages').then(function(res) {
                o.messages[friend.username] = [];
                angular.copy(res.data, o.messages[friend.username]);
            })
        }

        /*function sendMessage(friend, message) {
            return $http.post('/users/'+friend.username+'/messages/send', {message: message});
                //.then(function(res) {o.messages.push(res.data);
            //})
        }*/

        function sendMessage(friend, message, callback) {
            socket.emit('message send', {
                msg: message,
                from: auth.me,
                to: friend
            }, callback);
        }

        o.messages.getLastMessageFrom = function(user) {
            var username = user.username;
            var msgQuantity = this[username] ? this[username].length : null;

            if (msgQuantity) {
                return this[username][msgQuantity-1].body;
            }
        };

        o.messages.getNewMessagesQuantity = function(user) {
            return this[user.username] ? this[user.username].quantity : null;
        };

        o.messages.zeroNewMessagesQuantity = function(user) {
            this[user.username].quantity ? this[user.username].quantity = 0 : null;
        };

        o.messages.addNewMessagesQuantity = function(user) {
            this[user.username].quantity ? this[user.username].quantity++ : this[user.username].quantity = 1;
        };

        return o;
}]);