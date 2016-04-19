app.factory('geo', ['geolocation', '$http', 'auth', function(geolocation, $http, auth) {

    var o = {
        getLocation: getLocation,
        setLocation: setLocation
    };

    function getLocation() {
        return geolocation.getLocation();
    }

    function setLocation(data) {
        return $http.post('/users/' + auth.currentUser().username + '/location/set', data);
    }

    return o;

}]);