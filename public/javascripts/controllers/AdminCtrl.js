app.controller('AdminCtrl', [
    '$scope',
    'admin',
    'auth',
    'posts',
    function($scope, admin, auth, posts) {

        $scope.message = 'Hello Admin';

        $scope.getAllUsers = getAllUsers;
        $scope.removeUser = removeUser;
        $scope.getPendingActivations = getPendingActivations;
        $scope.activateEmail = activateEmail;
        $scope.editUser = editUser;
        $scope.activateEmailDecline = activateEmailDecline;
        $scope.getPosts = getPosts;
        $scope.deletePost = deletePost;

        function getAllUsers() {
            admin.getAllUsers().then(function(res) {
                $scope.users = res.data;
            })
        }

        function removeUser(user) {
            admin.removeUser(user).then($scope.getAllUsers);
        }

        function getPendingActivations() {
            admin.getPendingActivations().then(function(res) {
                $scope.activations = res.data;
            })
        }

        function activateEmail(VERIFICATION_HASH) {
            auth.activate(VERIFICATION_HASH).then($scope.getPendingActivations);
        }

        function activateEmailDecline(VERIFICATION_HASH) {
            admin.activateEmailDecline(VERIFICATION_HASH).then($scope.getPendingActivations);
        }

        function editUser(user) {
            admin.editUser(user);
        }

        function getPosts(user) {
            posts.getPostsByAuthor(user.username).then(function() {
                $scope.posts = posts.posts;
            });
        }

        function deletePost(post) {
            posts.deletePost(post).then(function() {
                $scope.posts = posts.posts;
            })
        }

}]);