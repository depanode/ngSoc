app.factory('users', [
    '$http',
    'auth',
    'toaster',
    function ($http, auth, toaster) {

        var o = {
            user:           {},
            getUser:        getUser,
            addFriend:      addFriend,
            declineFriend:  declineFriend,
            removeFriend:   removeFriend,
            queryUsers:     queryUsers,
            sendInvite:     sendInvite
        };

        function getUser(username) {
            return $http.get('/users/' + username).then(function(data) {
                angular.copy(data.data, o.user);
            })
        }

        function addFriend(user) {
            return $http.post('/users/' + user.username + '/friends/add', {})
                .then(function(res) {
                    auth.saveMyself();
                    o.getUser(user.username);
                    toaster.pop('info', '', res.data.msg);
                })
        }

        function declineFriend(user) {
            return $http.post('/users/' + user.username + '/friends/decline', {})
                .then(function(res) {
                    auth.saveMyself();
                    toaster.pop('info', '', res.data.msg);
                })
        }

        function removeFriend(user) {
            return $http.delete('/users/' + user.username + '/friends/remove').then(function(res) {
                toaster.pop('info', '', res.data.msg);
                auth.saveMyself();
            });
        }

        function queryUsers(query) {
            return $http.post('/users/query', query);
        }

        function sendInvite(email) {
            return $http.post('/users/invite', {to: email}).then(function(res) {
                toaster.pop('info', '', res.data.msg);
            });
        }

        return o;

}]);