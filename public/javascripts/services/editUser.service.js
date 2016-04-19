app.factory('editUser', [
    '$http',
    '$location',
    'toaster',
    'auth',
    function($http, $location, toaster, auth){

        var edit = {
            updateUser: updateUser,
            changePassword: changePassword
        };

        function updateUser(user) {

            var fd = new FormData();

            for (var key in user) {
                fd.append(key, user[key]);
            }

            return $http.post('/users/' + user.username + '/edit', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(
                function(res) {
                    if (res.data.success) {
                        toaster.pop('info', '', res.data.msg);
                        $location.path('/users/' + auth.me.username);
                    }
                },
                function(err) {
                    if ( Array.isArray(err.data) ) {
                        err.data.forEach(function(error) {
                            toaster.pop('error', '', error.msg);
                        })
                    } else {
                        toaster.pop('error', '', err.data.msg);
                    }
                }
            )
        }

        function changePassword(passObj) {
            $http.post('/users/' + auth.me.username + '/edit/password', passObj)
                .then(function(res) {
                    $location.path('/users/' + auth.me.username);
                    toaster.pop('info', '', res.data.msg);
                })
                .catch(function(err) {
                    toaster.pop('error', '', err.data.msg);
                })
        }

        return edit;

}]);