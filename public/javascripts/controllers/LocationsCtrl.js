app.controller('LocationsCtrl', [
    '$scope',
    'googleservice',
    'geo',
    'auth',
    'users',
    'toaster',
    function ($scope, googleservice, geo, auth, users, toaster) {

        $scope.longitude = auth.getMyself().location[0];
        $scope.latitude = auth.getMyself().location[1];

        googleservice.refresh($scope.latitude, $scope.longitude);

        $scope.refreshLocation = refreshLocation;
        $scope.queryUsers = queryUsers;

        function refreshLocation() {

            geo.getLocation().then(
                function (data) {

                    var coords = {lat: data.coords.latitude, lon: data.coords.longitude};

                    $scope.longitude = parseFloat(coords.lon).toFixed(3);
                    $scope.latitude = parseFloat(coords.lat).toFixed(3);

                    $scope.htmlverified = "Yep (Thanks for giving us real data!)";

                    googleservice.refresh($scope.latitude, $scope.longitude);
                    geo.setLocation(coords).then(function (res) {
                        auth.saveMyself();
                        toaster.pop('info', '', res.data.msg);
                    });
                },
                function () {
                    $scope.htmlverified = "Can't get geolocation data in your browser";
                }
            )
        }

        function queryUsers() {

            var query = {
                latitude: $scope.latitude,
                longitude: $scope.longitude,
                distance: $scope.distance,
                friendsOnly: $scope.friendsOnly
            };

            users.queryUsers(query).then(function (res) {
                googleservice.refresh(query.latitude, query.longitude, res.data);
                $scope.queryCount = res.data.length;
            })
        }

}]);