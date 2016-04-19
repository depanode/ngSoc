var app = angular.module('ngReddit', [
    'geolocation',
    'ngMessages',
    'ngRoute',
    'btford.socket-io',
    'toaster'
]);

app.config(['$routeProvider', function($routeProvider) {

    $routeProvider
        .otherwise('/login')

        .when('/users/:username', {
            templateUrl: 'views/home.html',
            controller: 'MainCtrl',
            resolve: {
                postPromise: ['posts', '$route', function (posts, $route) {
                    return posts.getPostsByAuthor($route.current.params.username);
                }],
                userPromise: ['users', '$route', function (users, $route) {
                    return users.getUser($route.current.params.username);
                }]
            }
        })

        .when('/users/:username/friends', {
            templateUrl: 'views/friends.html',
            controller: 'FriendsCtrl',
            /*resolve: {
                friendPromise: ['messages', 'auth', function (messages, auth) {
                    var firstFriend = auth.getMyself().friends[0];

                    if (firstFriend) {
                        return messages.getMessages(firstFriend);
                    }
                }]
            },*/
            friendsTab: true
        })

        .when('/users/:username/locations', {
            templateUrl: 'views/locations.html',
            controller: 'LocationsCtrl'
        })

        .when('/users/:username/edit', {
            templateUrl: 'views/edit.user.html',
            controller: 'EditUserCtrl'
        })

        .when('/posts/:id', {
            templateUrl: 'views/posts.html',
            controller: 'PostsCtrl',
            resolve: {
                post: ['posts', '$route', function (posts, $route) {
                    return posts.getPost($route.current.params.id);
                }]}
        })

        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'AuthCtrl',
            isLogin: true
        })

        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'AuthCtrl',
            isLogin: true
        })

        .when('/register/:invitation', {
            templateUrl: 'views/register.html',
            controller: 'AuthCtrl',
            resolve: {
                invitation: ['$route', 'auth', function ($route, auth) {
                    return auth.getInvitation($route.current.params.invitation);
                }]},
            isLogin: true
        })

        .when('/activate/:hash', {
            templateUrl: 'views/login.html',
            controller: 'AuthCtrl',
            resolve: {
                activate: ['$route', 'auth', function ($route, auth) {
                    return auth.activate($route.current.params.hash);
                }]},
            isLogin: true
        })

        .when('/restore', {
            templateUrl: 'views/reset.email.html',
            controller: 'ResetCtrl',
            isLogin: true
        })

        .when('/restore/:hash', {
            templateUrl: 'views/reset.password.html',
            controller: 'ResetCtrl',
            isLogin: true
        })

        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminCtrl',
            forAdmin: true

        });

}]);

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('jwtInterceptor');
}]);

app.run(function($rootScope, auth, $location) {
    $rootScope.$on('$routeChangeStart', function(event, next) { //todo $routeChangeError handler
        var isLogged = auth.isLoggedIn();
        var isAdmin;

        if (isLogged) {
            auth.saveMyself();
            isAdmin = auth.me ? auth.me.isAdmin : null;
        }

        if (!isLogged && !next.isLogin) {
            $location.path('/login');
        }

        if (isLogged && next.isLogin) {
            $location.path('/users/' + auth.currentUser().username);
        }

        if (!isAdmin && next.forAdmin) {
            $location.path('/users/' + auth.currentUser().username);
        }

    });
});
