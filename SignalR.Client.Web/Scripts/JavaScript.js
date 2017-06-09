$(document).ready(function () {

    // Set the location of the HUB based on URL
    switch (window.location.hostname.toLowerCase()) {
        case "laptop":
            $.connection.hub.url = "http://laptop/server/signalr/";
            break;
        case "localhost":
            $.connection.hub.url = "http://localhost:49608/signalr/";
            break;
        case "client.sams.hawkbane.biz":
            $.connection.hub.url = "http://server.sams.hawkbane.biz/signalr/";
            break;
    }

    myHub = $.connection.myHub;

    // Default Client Echo Method
    myHub.client.echo = function (text) {
        console.log(text);
    };

    $.connection.hub.start()
        .done(function () {
            console.log("SignalR Server Connected Successfully");
        })
        .fail(function () {
            console.log("SignalR Server Failed to Connect");
        });
});