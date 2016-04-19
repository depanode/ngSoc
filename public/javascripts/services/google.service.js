app.factory('googleservice', ['$http', 'auth', function($http, auth) {
    var googleMapService = {};

    var locations = [];

    var selectedLat = auth.getMyself().location[1];
    var selectedLong = auth.getMyself().location[0];

    googleMapService.refresh = function(latitude, longitude, searchResults){

        locations = [];

        if (searchResults){

            locations = convertToMapPoints(searchResults);

            initialize(latitude, longitude, true);
        } else {

            var friends = auth.getMyself().friends;

            locations = convertToMapPoints(friends);

            initialize(latitude, longitude, false);
        }
    };

    var convertToMapPoints = function(friends){

        var locations = [];

        for(var i= 0; i < friends.length; i++) {
            var user = friends[i];

            var  contentString =
                '<p><b>Username</b>: ' + user.username +
                '<br><b>Name</b>: ' + user.first_name +' '+ user.last_name +
                '<br><b>Gender</b>: ' + user.gender +
                '</p>';

            locations.push({
                latlon: new google.maps.LatLng(user.location[1], user.location[0]),
                message: new google.maps.InfoWindow({
                    content: contentString,
                    maxWidth: 320
                }),
                username: user.username,
                gender: user.gender
            });
        }
        return locations;
    };

var initialize = function(latitude, longitude, filter) {

        var icon;

        var myLatLng = {lat: selectedLat, lng: selectedLong};

        if (!map){
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 3,
                center: myLatLng
            });
        }

    if (filter) {
        icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    } else {
        icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    }

        locations.forEach(function(n, i){

            var marker = new google.maps.Marker({
                position: n.latlon,
                map: map,
                title: "Big Map",
                icon: icon
            });

            google.maps.event.addListener(marker, 'click', function(e){

                currentSelectedMarker = n;
                n.message.open(map, marker);
            });
        });

        var initialLocation = new google.maps.LatLng(latitude, longitude);

        var marker = new google.maps.Marker({
            position: initialLocation,
            animation: google.maps.Animation.BOUNCE,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        lastMarker = marker;

    };

google.maps.event.addDomListener(window, 'load', googleMapService.refresh(selectedLat, selectedLong));

    return googleMapService;

}]);