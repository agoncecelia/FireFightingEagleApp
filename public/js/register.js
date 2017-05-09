var map;
var marker = null;
var drawingManager;
var polygon;

var register = {
    departmentName: null,
    servingArea: {
        type: 'Polygon',
        coordinates: null,
    },
    deparmentLocation: {
        coordinates: null
    },
    email: null,
    username: null,
    password: null
}

$('body').on('keyup', '.inputs', function () {
    $(this).css('border-color', '#ccc');
});

$('body').on('click', '#btnNext', function () {
    if(validateInputs('inputs')) {
        if($("input[name=password").val() !== $("input[name=retypePassword").val()){
            alert('Password did not match!');
            $("input[name=retypePassword").css('border-color', 'red');
            return;
        }

        $('.register-container').hide();
        $('.register-map').show();

        register.departmentName = $("input[name=name").val();

        register.email = $("input[name=email").val();

        register.username = $("input[name=username").val();

        register.password = $("input[name=password").val();


        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 16.460134, lng: -12.488326},
            zoom: 2,
            minZoom: 2,
            disableDefaultUI: true,
        });

        autoComplete();
    }
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateInputs(inputClass) {
    var inputs = $('.' + inputClass);
    var isInvalid = false;

    for(var i = 0; i < inputs.length; i++){
        if($(inputs[i]).val() == ''){
            isInvalid = true;

            $(inputs[i]).css('border-color', 'red');
        }

        if($(inputs[i]).attr('type') == 'email'){
            if(!validateEmail($(inputs[i]).val())){
                isInvalid = true;

                $(inputs[i]).css('border-color', 'red');
            }
        }
    }

    if(isInvalid){
        return false
    }else{
        return true;
    }
}

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
var enabledPolygon = {
    drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon']
    }
}
var disabledPolygon = {
    drawingControlOptions:{
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: []
    }
}

function initPolygon() {
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
        },
        polygonOptions: {
            draggable: true,
            editable: true
        }
    });

    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        polygon = event;

        convertCoords(event.overlay);

        var button = '<button class="btn" id="btnFinishPolygon">Finish</button>';

        $('.register-map').append(button)

        drawingManager.setOptions(disabledPolygon);

        google.maps.event.addListener(polygon.overlay.getPath(), 'insert_at', function() {
            convertCoords(polygon.overlay)
        });

        google.maps.event.addListener(polygon.overlay.getPath(), 'remove_at', function() {
            convertCoords(polygon.overlay)
        });

        google.maps.event.addListener(polygon.overlay.getPath(), 'set_at', function() {
            convertCoords(polygon.overlay)
        });
    });
}

function convertCoords(overlay) {
    var positions = overlay.getPath().getArray();
    var coords = [];

    for(var i = 0; i < positions.length; i++){
        var row = positions[i];
        coords.push({
            latitude: row.lat(),
            longitude: row.lng()
        })
    }

    register.servingArea.coordinates = coords;
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

        register.deparmentLocation.coordinates = {
            latitude: marker.getPosition().lat(),
            longitude: marker.getPosition().lng()
        };

        marker.addListener('dragend', function (event) {
            register.deparmentLocation.coordinates = {
                latitude: event.latLng.lat(),
                longitude: event.latLng.lng()
            }
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