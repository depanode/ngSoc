app.controller('EditUserCtrl', [
    '$scope',
    'auth',
    'editUser',
    function ($scope, auth, editUser) {

        $scope.user = auth.me._id ? auth.me : auth.getMyself();
        $scope.user.date_of_birth = new Date(auth.me.date_of_birth);

        $scope.newPassword = {};

        $scope.save = save;
        $scope.savePassword = savePassword;

        function save(isValid) {
            if (!isValid) return;
            editUser.updateUser($scope.user);
        }

        function savePassword(isValid) {
            if (!isValid) return;
            editUser.changePassword($scope.newPassword);
        }

}]);