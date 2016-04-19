app.factory('auth', [
    '$http',
    '$window',
    '$location',
    'toaster',
    function($http, $window, $location, toaster){

        var auth = {
            me:               {},
            invitation:       {},
            saveToken:        saveToken,
            getToken:         getToken,
            saveMyself:       saveMyself,
            getMyself:        getMyself,
            isLoggedIn:       isLoggedIn,
            currentUser:      currentUser,
            register:         register,
            activate:         activate,
            getInvitation:    getInvitation,
            login:            login,
            sendResetEmail:   sendResetEmail,
            resetPasswordReq: resetPasswordReq,
            logout:           logout
        };

        //auth.me = angular.fromJson($window.localStorage['me']);

        function saveToken(token) {
            $window.localStorage['ngReddit'] = token;
        }

        function getToken() {
            return $window.localStorage['ngReddit'];
        }

        function saveMyself() {
            return $http.get('/users/' + auth.currentUser().username).then(function(res) {
                var userData = angular.toJson(res.data);
                $window.localStorage['me'] = userData;
                auth.me = res.data;
            })
        }

        function getMyself() {
                return angular.fromJson($window.localStorage['me']);
        }

        function isLoggedIn() {
            var token = auth.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        }

        function currentUser() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                return JSON.parse($window.atob(token.split('.')[1])); //todo careful this
            }
        }

        function register(user) {

            var fd = new FormData();

            for (var key in user) {
                fd.append(key, user[key]);
            }

            return $http.post('/register', fd, {
                transformRequest: angular.identity,
                headers: {
                'Content-Type': undefined
            }
            }).then(
                function(res) {
                    if (res.data.success) {
                        toaster.pop('info', '', res.data.msg);
                        $location.path('/login');
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

        function activate(hash) {
            return $http.get('/register/' + hash).then(function(res) {
                toaster.pop('info', '', res.data.msg);
                $location.path('/login');
            }).catch(function(data) {
                console.log(data);
            })
        }

        function getInvitation(hash) {
            return $http.get('/register/invitation/' + hash).then(
                    function (res) {
                        angular.copy(res.data, auth.invitation);
                    },
                    function (err) {
                        toaster.pop('error', '', err.data.msg);
                    }
            );
        }

        function login(user) {
            return $http.post('/login', user)
                .then(function(res) {
                    auth.saveToken(res.data.token);
                    auth.saveMyself();
                    $location.path('/users/' + auth.currentUser().username);
                })
                .catch(function(err) {
                    toaster.pop('error', '', err.data.msg);
                })
        }

        function sendResetEmail(email) {
            return $http.post('/reset', {email: email});
        }

        function resetPasswordReq(hash, password) {
            return $http.post('/reset/' + hash, {password: password});
        }

        function logout() {
            $window.localStorage.removeItem('ngReddit');
            $window.localStorage.removeItem('me');
            $location.path('/login');
        }

        return auth;

}]);