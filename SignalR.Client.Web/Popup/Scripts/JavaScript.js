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
        case "popup.sams.hawkbane.biz":
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

    // Retrieves the client information
    myHub.client.setClientDetail = function (connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime) {
        sessionStartTimestamp = new Date(sessionStartTime);
        sessionStartTime = toLocalTime(sessionStartTime);
        nodeStartTimestamp = new Date(nodeStartTime);
        nodeStartTime = toLocalTime(nodeStartTime);
        if (skillGroup === null || skillGroup == "null" || skillGroup == "") {
            skillGroup = "UNKNOWN";
        }
        row = "<table class='noborder center'>" +
            "<tbody>" +
            "<tr><td class='head text-right'>Agent Name: </td><td class='data'>" + agentName + " (" + attUID + ")</td>" +
            "<td class='head text-right'>Skill Group: </td><td class='data'>" + skillGroup + "</td></tr>" +
            "<tr><td class='head text-right'>SMP Session Id: </td><td class='data'>" + smpSessionId + "</td></tr>" +
            "<tr><td class='head text-right'>Session Start Time: </td><td class='data'>" + sessionStartTime + "</td>" +
            "<td class='head text-right'>Session Duration: </td><td class='data'><div id='sessionDuration_" + connectionId + "'></div></td></tr>" +
            "<tr><td class='head text-right'>Flow Name: </td><td id='flowName_" + connectionId + "' class='data'>" + flowName + "</td>" +
            "<td class='head text-right'>Step Name: </td><td id='nodeName_" + connectionId + "' class='data'>" + nodeName + "</td></tr>" +
            "<tr><td class='head text-right'>Step Start Time: </td><td id='stepStartTime_" + connectionId + "' class='data'>" + nodeStartTime + "</td>" +
            "<td class='head text-right'>Step Duration: </td><td class='data'><div id='stepDuration_" + connectionId + "'></div></td></tr>" +
            "</tbody>" +
            "</table>";
        $('div#header').append(row);

        $('div#sessionDuration_' + connectionId).countdown({
            since: sessionStartTimestamp,
            compact: true,
            layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
            format: 'yowdhMS'
        });
        $('div#stepDuration_' + connectionId).countdown({
            since: nodeStartTimestamp,
            compact: true,
            layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
            format: 'yowdhMS'
        });
        document.title = "SAMS - " + agentName + " (" + attUID + ")";
        myHub.server.pullSASHAScreenshot(connectionId);
    };

    // Close the window
    myHub.client.closeWindow = function () {
        window.close();
    };

    // Display SASHA screenshot
    myHub.client.pushSASHAScreenshot = function (img) {
        $('img#SASHAScreenshot').attr('src', img);
        $('img#SASHAScreenshot').show();
        screenshotTime = new Date().toString();
        screenshotTime = toLocalTime(screenshotTime);
        $('div#screenshotInfo').html("SCREENSHOT TAKEN: " + screenshotTime);
        setTimeout(function () {
            myHub.server.pullSASHAScreenshot(window.SASHAClientId);
        }, 20000);
    };

    myHub.client.updateNodeInfo = function (connectionId, flowName, nodeName, nodeStartTime) {
        if (connectionId === window.SASHAClientId) {
            nodeStartTimestamp = new Date(nodeStartTime);
            nodeStartTime = toLocalTime(nodeStartTime);
            $('div#stepDuration_' + connectionId).countdown('destroy');
            $('td#flowName_' + connectionId).html(flowName);
            $('td#nodeName_' + connectionId).html(nodeName);
            $('td#stepStartTime_' + connectionId).html(nodeStartTime);
            $('div#stepDuration_' + connectionId).countdown({
                since: nodeStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS'
            });
        }
    };


    $.connection.hub.start()
        .done(function () {
            vars = getURLVars();
            connectionId = vars.id;
            window.SASHAClientId = connectionId;
            myHub.server.requestClientDetail(connectionId);
        });

    $.connection.hub.disconnected(function () {
        setTimeout(function () {
            $.connection.hub.start()
                .done(function () {
                    disconnectNotified = false;
                });
        }, 5000); // Restart connection after 5 seconds.
    });
});

toLocalTime = function (timestamp) {
    if (timestamp !== null) {
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

// Read a page's GET URL variables and return them as an associative array.
getURLVars = function () {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
};