var map;
var marker = null;

$('body').on('click', '#btnNext', function () {
    $('.register-container').hide();
    $('.register-map').show();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 16.460134, lng: -12.488326},
        zoom: 2,
        minZoom: 2,
        disableDefaultUI: true,
    });

    autoComplete();
});

$('body').on('click', '#btnNextPolygon', function () {
    clearMap();

    initPolygon()
});

function clearMap() {
    marker.setMap(null);

    marker = null;

    $("#btnNextPolygon").remove();
    $("#pac-input").remove();
}

function initPolygon() {
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
        },
        polygonOptions: {
            draggable: true,
        }
    });

    drawingManager.setMap(map);
}

function autoComplete() {
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        google.maps.event.trigger(map, "resize");
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        if(marker != null){
            marker.setMap(null);
        }

        marker = null;

        var place = places[0];

        var bounds = new google.maps.LatLngBounds();


        if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
        }

        var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
        };

        marker = new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            draggable: true,
        });


        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }

        map.setCenter(place.geometry.location);

        map.setZoom(12)

        var button = '<button class="btn" id="btnNextPolygon">Next <span class="glyphicon glyphicon-chevron-right"></span></button>';

        $('.register-map').append(button)
    });
}