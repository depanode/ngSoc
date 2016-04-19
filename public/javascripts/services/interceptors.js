app.factory('jwtInterceptor', ['$window', function($window) {

    return {
        request: function(config) {

            var token = $window.localStorage['ngReddit'];

            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        }
    }
}]);