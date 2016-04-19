app.controller('ResetCtrl', [
    '$scope',
    'auth',
    '$routeParams',
    '$location',
    'toaster',
    function ($scope, auth, $routeParams, $location, toaster) {

        $scope.user = {};

        var hash = $routeParams.hash || null;

        $scope.sendResetEmail = sendResetEmail;
        $scope.setNewPassword = setNewPassword;

        function sendResetEmail() {
            auth.sendResetEmail($scope.user.email)
                .then(function (res) {
                    toaster.pop('info', '', res.data.msg);
                    $location.path('/login');
                })
                .catch(function(err) {
                    toaster.pop('error', '', err.data.msg);
                })
        }

        function setNewPassword() {
            auth.resetPasswordReq(hash, $scope.user.password)
                .then(function (res) {
                    toaster.pop('info', '', res.data.msg);
                    $location.path('/login');
                })
                .catch(function(err) {
                    toaster.pop('error', '', err.data.msg);
                })
        }

    }]);