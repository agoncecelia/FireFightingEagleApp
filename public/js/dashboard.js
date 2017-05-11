var map;

google.maps.Polygon.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    var paths = this.getPaths();
    var path;
    for (var i = 0; i < paths.getLength(); i++) {
        path = paths.getAt(i);
        for (var ii = 0; ii < path.getLength(); ii++) {
            bounds.extend(path.getAt(ii));
        }
    }
    return bounds;
}

$(document).ready(function () {
    var userLocation = JSON.parse(user.departmentLocation)
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 16.460134, lng: -12.488326},
        zoom: 2,
        minZoom: 2,
        disableDefaultUI: true,
    });

    var servingArea = JSON.parse(user.servingArea);

    var coords = [];

    for(var i = 0; i < servingArea.coordinates.length; i++){
        var row = servingArea.coordinates[i];
        coords.push({
            lat: row.latitude,
            lng: row.longitude
        })
    }

    var polygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    });

    polygon.setMap(map);

    map.fitBounds(polygon.getBounds());

    console.log(polygon)

    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
});