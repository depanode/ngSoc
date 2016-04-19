app.controller('FriendsCtrl', [
    '$scope',
    'auth',
    'socket',
    'messages',
    'users',
    function ($scope, auth, socket, messages, users) {

        $scope.me = auth.me._id ? auth.me : auth.getMyself();

        auth.saveMyself().then(function() {
            $scope.currentFriend = $scope.me.friends[0] || null;
            if ($scope.currentFriend) {
                getMessages($scope.currentFriend);
            }
        });

        $scope.currentUser = auth.currentUser;
        $scope.messages = messages.messages;
        $scope.messagesLimit = 8;

        $scope.showMore = showMore;
        $scope.addToFriends = addToFriends;
        $scope.declineFriend = declineFriend;
        $scope.getMessages = getMessages;
        $scope.sendMessage = sendMessage;

        socket.on('new message', incomingMessage);

        $scope.$on('$destroy', function () {
            socket.removeListener('new message', incomingMessage);
        });

        $scope.$watch(function () {
            return auth.me
        }, function (newVal) {
            $scope.me = newVal;
        }, true);

        function showMore() {
            $scope.messagesLimit += 10;
        }

        function addToFriends(user) {
            users.addFriend(user).then(getMessages(user));
        }

        function declineFriend(user) {
            users.declineFriend(user);
        }

        function getMessages(friend) {
            $scope.currentFriend = friend;
            messages.getMessages(friend).then(function () {
                $scope.messages = messages.messages;
                messages.messages.zeroNewMessagesQuantity(friend);
            });
        }

        function sendMessage() {
            if ($scope.newMessage === '') {return;}

            messages.sendMessage($scope.currentFriend, $scope.newMessage, function (msg) {
                $scope.messages[$scope.currentFriend.username].push(msg);
            });

            $scope.newMessage = '';
        }

        function incomingMessage(msg) {
            var author = msg.author.username;

            if (author == $scope.currentFriend.username) {
                messages.messages[$scope.currentFriend.username].push(msg);
            } else {
                if (Array.isArray(messages.messages[author])) {
                    messages.messages[author].push(msg);
                    messages.messages.addNewMessagesQuantity(msg.author);
                } else {
                    messages.messages[author] = [];
                    messages.messages[author].push(msg);
                    messages.messages.addNewMessagesQuantity(msg.author);
                }
            }
        }

}]);