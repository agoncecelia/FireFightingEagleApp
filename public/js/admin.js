var map;
var markerCluster;
var activeFires = [];

$('.pendings span').text(pendings.counter);

$('body').on('click', '.pendings', function () {
    if(pendings.counter == 0){
        return;
    }

    $('.requests-div').hide();

    request({}, 'GET', 'pendingusers', function (response) {
        var result = response.responseJSON;

        var list = '<li class="list-group-item goback-li text-center"><span class="glyphicon glyphicon-chevron-left"></span> Back</li>' +
                    '<li class="divider"></li>';
        $.each(result, function (key, val) {
            pendings.list[val._id] = val;

            list += '<li class="list-group-item pending-li" data-pending="' + val._id +'">' + val.departmentName + '<span class="glyphicon glyphicon-map-marker locate-span"></span></li>' +
                    '<li class="divider"></li>';
        });

        pendings.getCounter();

        $('.pendings-list').html(list);
        $('.pendings-div').fadeIn('slow')
    });
});

$('body').on('click', '.pending-li', function () {
    $('#mapModal').modal('show');

    var pId = $(this).data('pending');
    var pengingData = pendings.list[pId];

    $('#btnApprove').data('pending', pId);

    var dMap = new google.maps.Map(document.getElementById('dMap'), {
        center: {lat: 16.460134, lng: -12.488326},
        zoom: 2,
        minZoom: 2
    });

    try {
        var servingArea = pengingData.servingArea.coordinates;
        var location = pengingData.departmentLocation.coordinates;

        var marker = new google.maps.Marker({
            map: dMap,
            draggable: false,
            position: {lat: location[0], lng: location[1]}
        });

        var coords = [];

        for(var i = 0; i < servingArea[0].length; i++){
            var row = servingArea[0][i];
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

        setTimeout(function () {
            google.maps.event.trigger(dMap, "resize");

            dMap.setCenter(marker.getPosition());
            dMap.setZoom(10);

            polygon.setMap(dMap);
        }, 200);

    }catch (err){
        console.log(err)
    }
});

$('body').on('click', '#btnApprove', function () {
    var pId = $('#btnApprove').data('pending');
    request({id: pId}, 'POST', 'approveuser', function (response) {
        var result = response.responseJSON;
        alert(result.msg);
        if(result.success){
            // $('#mapModal').modal('hide');
            // $('.pendings-div').hide();
            // $('.requests-div').fadeIn('slow')
            $('.goback-li').click();

            delete pendings.list[pId];
            pendings.getCounter();
        }
    })
});

$('body').on('click', '.goback-li', function () {
    $('#mapModal').modal('hide');
    $('.pendings-div').hide();
    $('.requests-div').fadeIn('slow')
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 16.460134, lng: -12.488326},
        zoom: 2,
        minZoom: 2
    });
}

initMap();

refreshFires();