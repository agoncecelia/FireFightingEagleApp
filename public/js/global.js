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

function request(inputs, type, route, callback) {
    $.ajax({
        type: type,
        url: 'https://ffedemo.herokuapp.com/' + route,
        data: inputs,
        error:function (xhr, ajaxOptions, thrownError){
            alert("Something went wrong!");
        },
        complete: callback,
    });
};

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
};

function refreshFires() {
    request({}, 'GET', 'refreshfires', function (response) {
        var result = response.responseJSON;
        clearMarkers();
        activeFires = [];

        if(result.response.length){
            for(var i = 0; i < result.response.length; i++){
                activeFires[i] = new google.maps.Marker({
                    map: map,
                    position: {lat: result.response[i].latitude, lng: result.response[i].longitude},
                    draggable: false,
                    icon: "/images/placeholder.png"
                });

            }
            markerCluster = new MarkerClusterer(map, activeFires,
                {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        }

        setTimeout(function () {
            refreshFires();
        }, 300000);
    });
}

function clearMarkers() {
    if(activeFires.length){
        for(var i = 0; i < activeFires.length; i++){
            activeFires[i].setMap(null);
        }

        if(reportedFire != null){
            reportedFire.setMap(null);
        }

        markerCluster.clearMarkers(null);
    }
}