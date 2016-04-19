app.controller('NavCtrl', [
    '$scope',
    'auth',
    'socket',
    '$route',
    'messages',
    function ($scope, auth, socket, $route, messages) {

        $scope.currentUser = auth.currentUser;
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.logout = auth.logout;

        $scope.events = 0;

        $scope.resetEvents = resetEvents;

        socket.on('new message', messageNotification);

        $scope.$on('$destroy', function () {
            socket.removeListener('new message', messageNotification);
        });

        function resetEvents() {
            $scope.events = 0;
        }

        /*function messageNotification() {
            if (!$route.current.friendsTab) {
                $scope.events++;
            }
        }*/

        function messageNotification(msg) {

            if (!$route.current.friendsTab) {

                $scope.events++;

                var author = msg.author.username;

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

        (function() {
            if (auth.me._id) {
                socket.emit('join', {user: auth.me});
            } else {
                var detach = $scope.$watch(function () {
                    return auth.me
                }, function (newVal) {
                    if (newVal._id) {
                        socket.emit('join', {user: auth.me});
                        detach();
                    }
                });
            }
        }())

}]);