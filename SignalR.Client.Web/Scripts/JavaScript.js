$(document).ready(function () {

//    $.connection.hub.url = "http://server.sams.hawkbane.biz/signalr/";
    $.connection.hub.url = "http://localhost:49608/signalr/";
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