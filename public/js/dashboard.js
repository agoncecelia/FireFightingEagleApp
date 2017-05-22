var map;
var markerCluster;
var activeFires = [];
var reportedFire = null;

$(document).ready(function () {
    var userLocation = user.departmentLocation;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 16.460134, lng: -12.488326},
        zoom: 2,
        minZoom: 2,
        disableDefaultUI: true,
    });

    var servingArea = user.servingArea;

    var coords = [];

    // servingArea.coordinates[0].splice(servingArea.coordinates[0].length - 1, 1);

    for(var i = 0; i < servingArea.coordinates[0].length; i++){
        var row = servingArea.coordinates[0][i];
        coords.push({
            lat: row[0],
            lng: row[1]
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

    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
});

function initFires(data){
    try{
        var fire = JSON.parse(data);
        var lat = fire.payload[0];
        var lng = fire.payload[1];

        reportedFire = new google.maps.Marker({
            map: map,
            position: {lat: lat, lng: lng},
            draggable: false,
            icon: "/images/placeholder.png"
        });
    }catch (err){
        console.log(err);
    }
}

refreshFires();