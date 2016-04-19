app.factory('admin', [
    '$http',
    'toaster',
    function($http, toaster) {

        var admin = {
            getAllUsers: getAllUsers,
            getPendingActivations: getPendingActivations,
            removeUser: removeUser,
            editUser: editUser,
            activateEmailDecline: activateEmailDecline
        };

        function getAllUsers() {
            return $http.get('/admin/users');
        }

        function getPendingActivations() {
            return $http.get('/admin/pending/activations');
        }

        function removeUser(user) {
            return $http.delete('/admin/users/' + user._id);
        }

        function editUser(user) {
            return $http.post('/admin/users/edit', user)
                .then(function(res) {
                    toaster.pop('info', '', res.data.msg);
                })
                .catch(function(err) {
                    toaster.pop('error', '', err.data.msg);
                })
        }

        function activateEmailDecline(hash) {
            return $http.delete('/admin/pending/activations/' + hash)
                .then(function(res) {
                    toaster.pop('info', '', res.data.msg);
                })
                .catch(function(err) {
                    toaster.pop('error', '', err.data.msg);
                })
        }

        return admin;

}]);