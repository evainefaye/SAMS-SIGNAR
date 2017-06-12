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

    // Add row to SASHA Users Information
    myHub.client.addSASHAConnection = function (connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, nodeName, nodeStartTime) {


        // Begin add tab code here
        if ($('ul#skillgroupsTab li#' + skillGroup).length == 0) {
            // Skill Group tab did not exist so we need to add one
            row = '<li id="' + skillGroup + '"><a class="nav-link"  data-toggle="tab" href=#skillgroupsContent_' + skillGroup + '>' + skillGroup + '</a></li>';
            $('ul#skillgroupsTab').append(row);
            row = '<div id=skillgroupsContent_' + skillGroup + ' class=tab-pane>' +
                '<table class="center">' +
                '<thead>' +
                '<tr>' +
                '<th class="text-center">ATT UID</th>' +
                '<th class="text-center">Agent Name</th>' +
                '<th class="text-center">Session<BR />Start Time</th>' +
                '<th class="text-center">Session Duration</th>' +
                '<th class="text-center">Flow<BR />Node Name</th>' +
                '<th class="text-center">Node<BR />Start Time</th>' +
                '<th class="text-center">Node<BR />Step Duration</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody >' +
                '</tbody>' +
                '</table>' +
                '</div>';
            $('div#skillgroupsContent').append(row);
        }

        // End Add tab code

        if ($('div#skillgroupsContent_' + skillGroup).find('table tbody tr#' + connectionId).length == 0) {
            sessionStartTimestamp = new Date(sessionStartTime);
            sessionStartTime = toLocalTime(sessionStartTime);
            nodeStartTimestamp = new Date(nodeStartTime);
            nodeStartTime = toLocalTime(nodeStartTime);
            row = '<tr id=' + connectionId + '>'
                + '<td class="text-center">' + attUID + '</td>'
                + '<td class="text-left">' + agentName + '</td>'
                + '<td class="text-center">' + sessionStartTime + '</td>'
                + '<td class="text-right"><div id="sessionDuration_' + connectionId + '"></div></td>'
                + '<td class="text-left" id="nodeName_' + connectionId + '">' + nodeName + '</td>'
                + '<td class="text-center" id="nodeStartTime_' + connectionId + '">' + nodeStartTime + '</td>'
                + '<td class="text-right"><div id="stepDuration_' + connectionId + '"></div></td>'
                + '</tr>';
            $('div#skillgroupsContent_' + skillGroup + ' table ').find('tbody:last').append(row);
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
            if ($('#skillgroupsTab.active').length == 0) {
                $('#skillgroupsTab a:first').click();
            }
        }
    };

    myHub.client.removeSASHAConnection = function (connectionId, skillGroup) {
        $('div#sessionDuration_' + connectionId).countdown('destroy');
        $('div#stepDuration_' + connectionId).countdown('destroy');
        $('div#skillgroupsContent_' + skillGroup).find('table tbody tr#' + connectionId).remove();
//        if ($('table#sashaConnections_' + skillGroup + ' tbody tr').length == 0) {
//            $('#skillgroupsTab li#' + skillGroup).remove();
//            $('#skillgroupsContent_' + skillGroup).remove();
//        }
    };

    myHub.client.updateNodeInfo = function (connectionId, nodeName, nodeStartTime)
    {
        nodeStartTimestamp = new Date(nodeStartTime);
        nodeStartTime = toLocalTime(nodeStartTime);
        $('div#stepDuration_' + connectionId).countdown('destroy');
        $('td#nodeName_' + connectionId).html(nodeName);
        $('td#nodeStartTime_' + connectionId).html(nodeStartTime);
        $('div#stepDuration_' + connectionId).countdown({
            since: nodeStartTimestamp,
            compact: true,
            layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
            format: 'yowdhMS'
        });
    }

    myHub.client.resetActiveTab = function (active) {
//        setTimeout(function () {
            $('li#' + active + ' a:first').click();
//            $('div.initializationScreen').hide();
//            $('div.mainScreen').show();
//            console.log('li#' + active + ' a:first');
//        }, 3000);
    };

    $.connection.hub.start()
        .done(setTimeout(showMainScreen, 2000));

    $.connection.hub.disconnected(function () {
        if (!disconnectNotified) {
            $('div.initializationScreen').html('CONNECTION LOST.  ATTEMPTING RECONNECT...');
            $('div.initializationScreen').show();
            $('div.mainScreen').hide();
            disconnectNotified = true;
        }
        setTimeout(function () {
            $.connection.hub.start()
                .done(function () {
                    showMainScreen();
                    disconnectNotified = false;
                });
        }, 5000); // Restart connection after 5 seconds.
    });

    // Page Specific JS Begins Here 

    // Refresh SASHA Connections Display
    $('button#RefreshSASHAConnections').off('click').on('click', function () {
//        $('div.initializationScreen').html('REFRESHING CONNECTION INFORMATION...');
//        $('div.initializationScreen').show();
//        $('div.mainScreen').hide();
        active = $('li.active').attr('id')
        $('.is-countdown').countdown('destroy');
        $('ul#skillgroupsTab').empty();
        $('div#skillgroupsContent').empty();
        myHub.server.refreshSASHAConnections(active);
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

showMainScreen = function () {
    myHub.server.refreshSASHAConnections("");
    $('div.initializationScreen').hide();
    $('div.mainScreen').show();
};