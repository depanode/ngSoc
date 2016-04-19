app.controller('AuthCtrl', [
    '$scope',
    'auth',
    'geo',
    function($scope, auth, geo) {

        $scope.user = {};

        $scope.register = register;
        $scope.logIn = logIn;

        if (auth.invitation.to) {
            $scope.user.email = auth.invitation.to;
            $scope.user.invitedBy = auth.invitation.from;
            $scope.isInvited = true;
        }

        geo.getLocation().then(
            function(data) {
                $scope.user.lat = data.coords.latitude;
                $scope.user.lon = data.coords.longitude;
            },
            function() {
                $scope.user.lat = '';
                $scope.user.lon = '';
            });

        function register(isValid) {
            if (isValid) {
                var user = $scope.user;

                if (typeof user.date_of_birth !== "object") {             //if <input type="date"> not supported
                    user.date_of_birth = new Date(user.date_of_birth);
                }

                auth.register(user);
            }
        }

        function logIn() {
            auth.login($scope.user);
        }

}]);