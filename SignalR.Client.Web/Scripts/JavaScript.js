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

    disconnectNotified = false;
    myHub = $.connection.myHub;

    // Default Client showActivity Method
    myHub.client.showActivity = function (timestamp, text) {
        text = toDisplayTimestamp(timestamp) + text;
        $('<li>' + text + '</li>').hide().prependTo('ul#activity').slideDown('slow');
    };

    // Put UserName in userName span
    myHub.client.updateUserName = function (userName) {
        $('span#CurrentUserName').html(userName);
        $('input#NewUserName').val(userName);
    };

    // Add row to SASHA Users Information
    myHub.client.addSASHAConnection = function (connectionId, userName, motiveSessionId, flowStartTime, nodeName, nodeStartTime) {
        flowStartTime = toLocalTime(flowStartTime);
        nodeStartTime = toLocalTime(nodeStartTime);
        row = '<tr id=' + connectionId + '>'
            + '<td>' + connectionId + '</td>'
            + '<td>' + userName + '</td>'
            + '<td>' + motiveSessionId + '</td>'
            + '<td>' + flowStartTime + '</td>'
            + '<td>' + nodeName + '</td>'
            + '<td>' + nodeStartTime + '</td>'
            + '</tr>';
        $('#sashaConnections').find('tbody:last').append(row);
    };

    myHub.client.removeSASHAConnection = function (connectionId) {
        $('table#sashaConnections').find('tbody tr#' + connectionId).remove();
    };

    $.connection.hub.start()
        .done(showMainScreen())

    $.connection.hub.disconnected(function () {
        if (!disconnectNotified) {
            $('table#sashaConnections').hide();
            myHub.client.showActivity((new Date()).toUTCString(), "You were disconnected. Attempting to reconnect...");
            disconnectNotified = true;
        }
        setTimeout(function () {
            $.connection.hub.start()
                .done(function () {
                    $('table#sashaConnections').show();
                    myHub.client.showActivity((new Date()).toUTCString(), "Reconnected.");
                    disconnectNotified == false;
                });
        }, 5000); // Restart connection after 5 seconds.
    });

    // Page Specific JS Begins Here 

    // When Update User Name Button is Clicked, submit the value of the UserName 
    $('button#UpdateUserName').off('click').on('click', function () {
        myHub.server.setUserName($('input#NewUserName').val());
    });

    // Emulate Start of SASHA Session when button clicked
    $('button#EmulateStartSASHA').off('click').on('click', function () {
        $('button#EmulateStartSASHA').remove();
        myHub.client.showActivity((new Date()).toUTCString(), "Marked SASHA Start");
        myHub.server.startSASHASession();
    });

    // Refresh SASHA Connections Dictionary
    $('button#RefreshSASHAConnections').off('click').on('click', function () {
        $('table#sashaConnections').find('tbody tr').remove();
        myHub.server.refreshSASHAConnections();
    });

});

toLocalTime = function (timestamp) {
    if (timestamp != null) {
        timestamp = new Date(timestamp);
        hours = "0" + timestamp.getHours();
        hours = hours.slice(-2);
        minutes = "0" + timestamp.getMinutes();
        minutes = minutes.slice(-2);
        seconds = "0" + timestamp.getSeconds();
        seconds = seconds.slice(-2);
        return hours + ":" + minutes + ":" + seconds;
    }
};

toDisplayTimestamp = function (timestamp) {
    timestamp = toLocalTime(timestamp);
    return "[ " + timestamp + " ] ";
};

showMainScreen = function () {
    $('div.initializationScreen').hide();
    $('div.mainScreen').show();
};