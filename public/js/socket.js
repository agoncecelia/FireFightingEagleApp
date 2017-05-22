function initSocket() {
    var socket = new WebSocket("ws://firefightingeagle.herokuapp.com");
    socket.onopen = function() {
        this.send(JSON.stringify({
            "id": user.id,
            "type" : "init"
        }));
    };

    socket.onmessage = function(message) {
        initFires(message.data);
    };

    socket.onclose = function() {
        setTimeout(function () {
            initSocket();
        }, 2000);
    };
}

initSocket();