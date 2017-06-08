$(document).ready(function () {

    $.connection.hub.url = "http://sams.hawkbane.biz/signalr/";
    myHub = $.connection.myHub;

    // Default Hello Method
    myHub.client.hello = function () {
    };

    $.connection.hub.start()
        .done(function () {
            console.log("SignalR Server Connected Successfully");
        })
        .fail(function () {
            console.log("SignalR Server Failed to Connect");
        });
});