function initSocket() {
    var socket = new WebSocket("ws://192.168.100.14:3000");
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