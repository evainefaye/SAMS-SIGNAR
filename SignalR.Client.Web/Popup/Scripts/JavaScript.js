$(document).ready(function () {


    // Set the location of the HUB based on URL
    switch (window.location.hostname.toLowerCase()) {
        case "fde.client.sams.hawkbane.biz":
            $.connection.hub.url = "http://fde.server.sams.hawkbane.biz/signalr/";
            break;
        case "fde.hawkbane.biz":
            $.connection.hub.url = "http://fde.server.sams.hawkbane.biz/signalr/";
            break;
        case "beta.client.sams.hawkbane.biz":
            $.connection.hub.url = "http://beta.server.sams.hawkbane.biz/signalr/";
            break;
        case "beta.hawkbane.biz":
            $.connection.hub.url = "http://beta.server.sams.hawkbane.biz/signalr/";
            break;
        case "prod.client.sams.hawkbane.biz":
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
            break;
        case "prod.hawkbane.biz":
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
            break;
        default:
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
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
            "<tr><td class='head text-right'>AGENT NAME:</td><td class='data text-left'>" + agentName + " (" + attUID + ")</td>" +
            "<td class='head text-right'>SKILL GROUP:</td><td class='data text-left'>" + skillGroup + "</td></tr>" +
            "<tr><td class='head text-right'>SMP SESSION ID:</td><td class='data text-left'>" + smpSessionId + "</td></tr>" +
            "<tr><td class='head text-right'>SESSION START TIME:</td><td class='data text-left'>" + sessionStartTime + "</td>" +
            "<td class='head text-right'>SESSION DURATION:</td><td class='data text-left'><div id='sessionDuration_" + connectionId + "'></div></td></tr>" +
            "<tr><td class='head text-right'>STEP START TIME:</td><td id='stepStartTime_" + connectionId + "' class='data text-left'>" + nodeStartTime + "</td>" +
            "<td class='head text-right'>STEP DURATION:</td><td class='data text-left'><div id='stepDuration_" + connectionId + "'></div></td></tr>" +
            "<tr><td class='head text-right'>FLOW NAME:</td><td id='flowName_" + connectionId + "' class='data text-left'>" + flowName + "</td>" +
            "<td class='head text-right'>STEP NAME:</td><td id='nodeName_" + connectionId + "' class='data text-left'>" + nodeName + "</td></tr>" +
            "</tbody>" +
            "</table>";
        $('div.header').html(row);

        $('div#sessionDuration_' + connectionId).countdown({
            since: sessionStartTimestamp,
            compact: true,
            layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
            format: 'yowdhMS',
            onTick: checkTimerStyling
        });
        $('div#stepDuration_' + connectionId).countdown({
            since: nodeStartTimestamp,
            compact: true,
            layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
            format: 'yowdhMS',
            onTick: checkTimerStyling
        });
        document.title = "SAMS - " + agentName + " (" + attUID + ")";
        myHub.server.pullSASHAScreenshot(connectionId);
        myHub.server.pullSASHADictionary(connectionId);
    };

    // Close the window
    myHub.client.closeWindow = function () {
        window.close();
    };

    // Display SASHA screenshot
    myHub.client.pushSASHAScreenshot = function (img) {
        $('img#SASHAScreenshot').attr('src', img).show();
        $('img#SASHAScreenshot').parent().css('background-image', 'none');
        screenshotTime = new Date().toString();
        screenshotTime = toLocalTime(screenshotTime);
        $('div.screenshotInfo').html(screenshotTime).removeClass('hidden');
        $('div.screenshot').removeClass('pending');
        setTimeout(function () {
            myHub.server.pullSASHAScreenshot(window.SASHAClientId);
        }, 20000);
    };

    // Display SASHA Dictionary
    myHub.client.pushSASHADictionary = function (dictionary) {
        $('ul#dict').html(dictionary);
        var dictionaryTree = $('ul#dict').treeview({
            collapsed: true,
            control: "#sidetreecontrol"
        });
        $('div#SASHADictionary').parent().css('background-image', 'none');
        dictionaryTime = new Date().toString();
        dictionaryTime = toLocalTime(dictionaryTime);
        $('div.dictionaryInfo').html(dictionaryTime).removeClass('hidden');
        $('div.dictionary').removeClass('pending hidden');
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
                format: 'yowdhMS',
                onTick: checkTimerStyling
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

// Add Styling on Timer if over threshold
checkTimerStyling = function (periods) {
    if ($.countdown.periodsToSeconds(periods) > 300) {
        $(this).addClass('highlightDuration');
    } else {
        $(this).removeClass('highlightDuration');
    }
};

reloadDictionary = function () {
    $("ul#dict").empty();
    $('div#SASHADictionary').parent().css('background-image', 'url(Stylesheets/Images/loading.gif)');
    $('div.dictionaryInfo').html(dictionaryTime).addClass('hidden');
    $('div.dictionary').addClass('pending hidden');
    myHub.server.pullSASHADictionary(window.SASHAClientId);
};