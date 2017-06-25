$(document).ready(function () {

    windowManager = new Object();

    hostname = window.location.hostname.split(".")[0];
    // Set the location of the SignalR HUB based on URL
    switch (window.location.hostname.toLowerCase().split(".")[0]) {
        case "fde":
            $.connection.hub.url = "http://fde.server.sams.hawkbane.biz/signalr/";
            version = "FDE (FLOW DEVELOPMENT ENVIRONMENT)";
            break;
        case "beta":
            $.connection.hub.url = "http://beta.server.sams.hawkbane.biz/signalr/";
            version = "BETA (PRE-PROD)";
            break;
        case "prod":
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
            version = "PRODUCTION";
            break;
        default:
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
            version = "PRODUCTION";
            break;
    }

    document.title = "SAMS - " + version + " SASHA ACTIVE MONITORING SYSTEM";

    // Set the Version Type
    $('span#version').html(version);

    // Initialize variables
    disconnectNotified = false;
    myHub = $.connection.myHub;
    
    // If you close this window, then use the window manager to locate and close and detail windows opened by this application
    $(window).on('unload', function () {
        $.each(windowManager, function (key) {
            windowManager[key].close();
            delete windowManager[key];
        });
    });

    // Add a new SASHA connection to relevant table(s)
    myHub.client.addSASHAConnection = function (connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime) {
        // If skillGroup is not set, then set it as UNKNOWN
        if (skillGroup === null || skillGroup === "null" || skillGroup === "") {
            skillGroup = "UNKNOWN";
        }

        // If there is no tab for the skillGroup your about to work with, then add it
        if (!$('ul#Tabs li[tabId="' + skillGroup + '"]').length) {
            row = '<li tabId="' + skillGroup + '">' +
                '<a class="nav-link" data-toggle="tab" skillGroup="' + skillGroup + '" href="#' + skillGroup + '">' + skillGroup + ' (<span>0</span>)</a>' +
                '</li>';
            $('ul#Tabs').append(row);
            row = '<div id="' + skillGroup + '" class="tab-pane">' +
                '<div class="buttonrow">' +
                '<span class="buttons">' +
                'GROUP BY: ' +
                '<input type="radio" name="' + skillGroup + '" class="groupOption" value="none" checked="checked">NONE' +
                '<input type="radio" name="' + skillGroup + '" class="groupOption" value="agentname">AGENT NAME' +
                '</span>' + 
                '</div> ' +
                '<table class="center hover-highlight serviceline ' + skillGroup + '" >' +
                '<thead>' +
                '<tr>' +
                '<th class="text-center attUID">ATT<br />UID</th>' +
                '<th class="text-center agentName group-text">AGENT NAME</th>' +
                '<th class="text-center sessionStartTime" >SESSION<br />START TIME</th>' +
                '<th class="text-center sessionDuration sorter-false">SESSION<br />DURATION</th>' +
                '<th class="text-center nodeStartTime sorter-false">NODE<br />START<br />TIME</th>' +
                '<th class="text-center nodeDuration sorter-false">NODE<br />DURATION</th>' +
                '<th class="text-center flowName sorter-false">FLOW NAME</th>' +
                '<th class="text-center nodeName sorter-false">NODE NAME</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody >' +
                '</tbody>' +
                '</table>' +
                '</div>';
            $('div#Contents').append(row);
            // Sort Tabs in Alphabetical order
            sortTabs('ul#Tabs');
            //  Make the added table sortable
            $('table.' + skillGroup).tablesorter({
                theme: "custom",
                sortList: [[3,1]],
                sortReset: true,
                widgets: ["zebra"]
            });
            // Create event or changing the group option button
            $('.groupOption').off('change.groupOption').on('change.groupOption', function () {
                value = $(this).val();
                name = $(this).attr('name');
                if (value == "none") {
                    $('table.' + name).trigger('removeWidget', 'group');
                }
                if (value == "agentname") {
                    $('table.' + name).trigger('removeWidget', 'group');
                    $('table.' + name).data('tablesorter').widgets = ['group'];
                    $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [1];
                    $('table.' + name).data('tablesorter').widgetOptions.group_saveGroups = false;
                    $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
                    $('table.' + name).trigger('applyWidgets');
                }
                if (value == "skillgroup") {
                    $('table.' + name).trigger('removeWidget', 'group');
                    $('table.' + name).data('tablesorter').widgets = ['group'];
                    $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [6];
                    $('table.' + name).data('tablesorter').widgetOptions.group_saveGroups = false;
                    $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
                    $('table.' + name).trigger('applyWidgets');
                }
            });
            // Resort the table anytime its tab is clicked
            $('a[data-toggle="tab"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function(e) { 
                var target = $(e.target).attr('skillGroup');
                $('table.' + target).trigger('update');
            });
        }

        // If there is no row matching the row your about to add, then go ahead and add it
        if (!$('table.' + skillGroup + ' tbody tr[connectionId="' + connectionId + '"]').length) {
            sessionStartTimestamp = new Date(sessionStartTime);
            sessionStartTime = toLocalTime(sessionStartTime);
            nodeStartTimestamp = new Date(nodeStartTime);
            nodeStartTime = toLocalTime(nodeStartTime);
            row = '<tr connectionId="' + connectionId + '">'
                + '<td class="text-centers">' + attUID + '</td>'
                + '<td class="text-left">' + agentName + '</td>'
                + '<td class="text-center">' + sessionStartTime + '</td>'
                + '<td class="text-right"><div sessionDurationId="sessionDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center" nodeStartTimeId="nodeStartTime_' + connectionId + '">' + nodeStartTime + '</td>'
                + '<td class="text-right"><div nodeDurationId="nodeDuration_' + connectionId + '"></div></td>'
                + '<td class="text-left" flowNameId="flowName_' + connectionId + '">' + flowName + '</td>'
                + '<td class="text-left" nodeNameId="nodeName_' + connectionId + '"><span class="nodeInfo">' + nodeName + '</span></td>'
                + '</tr>';
            $('table.' + skillGroup + ' tbody:last').append(row);
            $('table.' + skillGroup).trigger('update');

            // Also add to All Sessions tab.  New row defined here as that includes SkillGroup
            row = '<tr connectionId="' + connectionId + '">'
                + '<td class="text-centers">' + attUID + '</td>'
                + '<td class="text-left">' + agentName + '</td>'
                + '<td class="text-center">' + sessionStartTime + '</td>'
                + '<td class="text-right"><div sessionDurationId="sessionDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center" nodeStartTimeId="nodeStartTime_' + connectionId + '">' + nodeStartTime + '</td>'
                + '<td class="text-right"><div nodeDurationId="nodeDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center">' + skillGroup + '</td>'
                + '<td class="text-left" flowNameId="flowName_' + connectionId + '">' + flowName + '</td>'
                + '<td class="text-left" nodeNameId="nodeName_' + connectionId + '"><span class="nodeInfo">' + nodeName + '</span></td>'
                + '</tr>';
            $('table.ALLSESSIONS tbody:last').append(row);
            $('table.ALLSESSIONS').trigger('update');

            $('[name="ALLSESSIONS].groupOption').off('change.groupOption').on('change.groupOption', function () {
                value = $(this).val();
                name = $(this).attr('name');
                if (value == "none") {
                    $('table.' + name).trigger('removeWidget', 'group');
                }
                if (value == "agentname") {
                    $('table.' + name).trigger('removeWidget', 'group');
                    $('table.' + name).data('tablesorter').widgets = ['group'];
                    $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [1];
                    $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
                    $('table.' + name).trigger('applyWidgets');
                }
                if (value == "skillgroup") {
                    $('table.' + name).trigger('removeWidget', 'group');
                    $('table.' + name).data('tablesorter').widgets = ['group'];
                    $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [6];
                    $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
                    $('table.' + name).trigger('applyWidgets');
                }
            });

            // Initialize Counters for the connection just added
            $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown({
                since: sessionStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkStalledSessions,
                tickInterval: 1
            });
            $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown({
                since: nodeStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkTimerStyling,
                tickInterval: 1
            });
            // Request the tables to resort
            $('table.' + skillGroup).trigger('update');
            $('table.ALLSESSIONS').trigger('update');

            // Update Count(s) of users on table(s)
            userCount = $('table.' + skillGroup + ' tbody tr').not('.group-header').length;
            $('a[skillGroup="' + skillGroup + '"] span').html(userCount);
            userCount = $('table.ALLSESSIONS tbody tr').not('.group-header').length;
            $('a[skillGroup="ALLSESSIONS"] span').html(userCount);
        }

        // Update on doubleclick events to launch detail window
        $('table tbody tr').not('.group-header').off('dblclick').on('dblclick', function () {
            id = $(this).attr('connectionId');
            winName = "window_" + id;
            if (typeof windowManager[winName] != "undefined") {
                win = windowManager[winName];
                win.close();
            }
            windowManager[winName] = window.open("/popup/index.html?id=" + id, winName);
        });
    };


    // Remove a row for disconnected/completed sessions
    myHub.client.removeSASHAConnection = function (connectionId, skillGroup) {
        // Remove timer(s) associated with connection before removing row to prevent a javascript error
        $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown('destroy');
        $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown('destroy');
        $('tr[connectionId="' + connectionId + '"]').remove();
        // force the groupable pages to refresh since their categories may now be empty
        $('table.STALLEDSESSIONS').trigger("update");
        $('table.ALLSESSIONS').trigger("update");

        // Update Count(s) of users on table(s)
        userCount = $('table.' + skillGroup + ' tbody tr').not('.group-header').length;
        $('a[skillGroup="' + skillGroup + '"] span').html(userCount);
        userCount = $('table.ALLSESSIONS tbody tr').not('.group-header').length;
        $('a[skillGroup="ALLSESSIONS"] span').html(userCount);
        userCount = $('table.STALLEDSESSIONS tbody tr').not('.group-header').length;
        $('a[skillGroup="STALLEDSESSIONS"] span').html(userCount);

        // Close any detail windows associated to connection
        winName = "window_" + connectionId;
        if (typeof windowManager[winName] === "object") {
            windowManager[winName].close();
            delete windowManager[winName];
        }

        // Can optionally have it remove the tab(s) and tables of any empty tables
        // if (!$('table.' + skillGroup + ' tbody tr').not('.group-header').length) {
        //   $('#Tabs li[tabId="' + skillGroup +'"]).remove();
        //   $('div#' + skillGroup).remove();
        // }
    };

    // Update Flow / Node and Node Timers on notification of new Flow/Node
    myHub.client.updateNodeInfo = function (connectionId, flowName, nodeName, nodeStartTime) {
        nodeStartTimestamp = new Date(nodeStartTime);
        nodeStartTime = toLocalTime(nodeStartTime);
        // first remove any countdown to avoid javascript errors
        $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown('destroy');
        $('td[flowNameId="flowName_' + connectionId + '"]').html(flowName);
        $('td[nodeNameId="nodeName_' + connectionId + '"]').html("<span class='nodeInfo'>" + nodeName + "</span>");
        $('td[nodeStartTime="nodeStartTime_' + connectionId + '"]').html(nodeStartTime);
        // restart countdown
        $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown({
            since: nodeStartTimestamp,
            compact: true,
            layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
            format: 'yowdhMS',
            onTick: checkTimerStyling,
            tickInterval: 1
        });
    };

    // Restore the Active Tab 
    myHub.client.resetActiveTab = function (active) {
        $('a[skillGroup="' + active + '"]').click();
        $('table.' + skillGroup).trigger('update');
    };


    // Show the Server Start Time on the main screen
    myHub.client.showServerStartTime = function (timestamp) {
        time = toLocalDateTime(timestamp);
        $('span#serverStartTime').html(time);
    };

    // Stalled Session detected, add an entry under stalled session to indicate it
    myHub.client.receiveStalledSession = function (connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime) {
        // If it isn't already in stalled sessions then add it
        if (!$('table.STALLEDSESSIONS tbody tr[connectionId="' + connectionId + '"]').length) {
            sessionStartTimestamp = new Date(sessionStartTime);
            sessionStartTime = toLocalTime(sessionStartTime);
            nodeStartTimestamp = new Date(nodeStartTime);
            nodeStartTime = toLocalTime(nodeStartTime);
            // If skill group was not set, set it to UNKNOWN
            if (skillGroup === null || skillGroup === "null" || skillGroup === "") {
                skillGroup = "UNKNOWN";
            }
            row = '<tr connectionId="' + connectionId + '">'
                + '<td class="text-centers">' + attUID + '</td>'
                + '<td class="text-left">' + agentName + '</td>'
                + '<td class="text-center">' + sessionStartTime + '</td>'
                + '<td class="text-right"><div sessionDurationId="sessionDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center" nodeStartTimeId="nodeStartTime_' + connectionId + '">' + nodeStartTime + '</td>'
                + '<td class="text-right"><div nodeDurationId="nodeDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center">' + skillGroup + '</td>'
                + '<td class="text-left" flowNameId="flowName_' + connectionId + '">' + flowName + '</td>'
                + '<td class="text-left" nodeNameId="nodeName_' + connectionId + '"><span class="nodeInfo">' + nodeName + '</span></td>'
                + '</tr>';
            $('table.STALLEDSESSIONS tbody:last').append(row);
            // initialize Countdown
            $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown({
                since: sessionStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkTimerStyling,
                tickInterval: 1
            });
            $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown({
                since: nodeStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkTimerStyling,
                tickInterval: 1
            });
            // update user count
            userCount = $('table.STALLEDSESSIONS tbody tr').not('.group-header').length;
            $('a[skillGroup="STALLEDSESSIONS"] span').html(userCount);

            // Create event or changing the group option button
            $('[name="STALLEDSESSIONS].groupOption').off('change.groupOption').on('change.groupOption', function () {
                value = $(this).val();
                name = $(this).attr('name');
                if (value == "none") {
                    $('table.' + name).trigger('removeWidget', 'group');
                }
                if (value == "agentname") {
                    $('table.' + name).trigger('removeWidget', 'group');
                    $('table.' + name).data('tablesorter').widgets = ['group'];
                    $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [1];
                    $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
                    $('table.' + name).trigger('applyWidgets');
                }
                if (value == "skillgroup") {
                    $('table.' + name).trigger('removeWidget', 'group');
                    $('table.' + name).data('tablesorter').widgets = ['group'];
                    $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [6];
                    $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
                    $('table.' + name).trigger('applyWidgets');
                }
            });

            // Trigger table to sort
            $('table.STALLEDSESSIONS').trigger('update');
        }
    };

    // Start the Hub then display the screen after initialization
    $.connection.hub.start()
        .done(setTimeout(showMainScreen, 1200));

    // if connection is lost, show that it was lost and try to reconnect
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


    // Clear all tables and reload
    $('button#RefreshSASHAConnections').off('click').on('click', function () {
        // store currently active tab
        active = $('li.active').attr('tabId');
        // Remove any countdown timers
        $('.is-countdown').countdown('destroy');
        // Empty information
        $('ul#Tabs').empty();
        $('div#Contents').empty();
        // Close any detail windows and remove them from window manager
        $.each(windowManager, function (key) {
            windowManager[key].close();
            delete windowManager[key];
        });
        // Add the custom Tabs back
        addCustomTabs();
        // Request sasha connections information
        myHub.server.refreshSASHAConnections(active);
    });

    // Add custom Tabs
    addCustomTabs();
});

// Convert Time to Local Time as HH:MM:SS
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

// Convert Time to DateTime as MM/DD/YY @ HH:MM:SS
toLocalDateTime = function (timestamp) {
    if (timestamp !== null) {
        timestamp = new Date(timestamp);
        month = timestamp.getMonth();
        date = timestamp.getDate();
        year = timestamp.getFullYear();
        hours = "0" + timestamp.getHours();
        hours = hours.slice(-2);
        minutes = "0" + timestamp.getMinutes();
        minutes = minutes.slice(-2);
        seconds = "0" + timestamp.getSeconds();
        seconds = seconds.slice(-2);
        return month + "/" + date + "/" + year + " @ " + hours + ":" + minutes + ":" + seconds;
    }
};

// Convert Time to local time as [ HH:MM:SS ]
toDisplayTimestamp = function (timestamp) {
    timestamp = toLocalTime(timestamp);
    return "[ " + timestamp + " ] ";
};

// Hide the initialization screen and show the main screen
showMainScreen = function () {
    // Request SASHA Connections noting that there was no active tab yet
    myHub.server.refreshSASHAConnections("");
    $('div.initializationScreen').hide();
    $('div.mainScreen').show();
    // Update Server Start Time
    myHub.server.requestServerStartTime();
};

// Sort Tabs
sortTabs = function (element) {
    var myList = $(element);
    var listItems = myList.children('li').get();
    listItems.sort(function (a, b) {
        var compA = $(a).text().toUpperCase();
        var compB = $(b).text().toUpperCase();
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    myList.empty();
    $.each(listItems, function (idx, itm) {
        myList.append(itm);
    });
};

// Checks if SESSION is showing as over threshold for being stalled and adds it to the stalled sessions if so
checkStalledSessions = function (periods) {
    if ($.countdown.periodsToSeconds(periods) > 1200) {
        $(this).addClass('highlightDuration');
        connectionId = $(this).closest('tr').attr('connectionId');
        if (!$('table.STALLEDSESSIONS tbody tr[connectionId="' + connectionId + '"]').length) {
            myHub.server.requestStalledSession(connectionId);
        }
    }
};

// Add Styling on Timer if over threshold
checkTimerStyling = function (periods) {
    if ($.countdown.periodsToSeconds(periods) > 30) {
        nodeInfo = $(this).parent().parent().find('span.nodeInfo');
        if (nodeInfo.html() == "WAIT SCREEN") {
//            nodeInfo.addClass('warnWaitScreenDuration');
            $(this).addClass('warnWaitScreenDuration');
            return;
        } else {
//            nodeInfo.removeClass("warnWaitScreenDuration");
            $(this).removeClass('warnWaitScreenDuration');
        }
    }
    if ($.countdown.periodsToSeconds(periods) > 300) {
        $(this).addClass('highlightDuration');
    } else {
        $(this).removeClass('highlightDuration');
    }
}


// Add Stalled Sessions and All Sessions tabs
addCustomTabs = function () {
    // Start by adding All Sessions Tab
    row = '<li class="pull-right" tabId="ALLSESSIONS">' +
        '<a class="nav-link" data-toggle="tab" skillGroup="ALLSESSIONS" href="#ALLSESSIONS">ALL SESSIONS (<span>0</span>)</a>' +
        '</li>';
    $('ul#Tabs').append(row);
    row = '<div id="ALLSESSIONS" class="tab-pane">' +
        '<div class="buttonrow">' +
        '<span class="buttons">' +
        'GROUP BY: ' +
        '<input type="radio" name="ALLSESSIONS" class="groupOption" value="none" checked="checked">NONE' +
        '<input type="radio" name="ALLSESSIONS" class="groupOption" value="agentname">AGENT NAME' +
        '<input type="radio" name="ALLSESSIONS" class="groupOption" value="skillgroup">SKILL GROUP' +
        '</span>' + 
        '</div> ' +
        '<table class="center groupable hover-highlight ALLSESSIONS">' +
        '<thead>' +
        '<tr>' +
        '<th class="text-center attUID group-letter">ATT<br />UID</th>' +
        '<th class="text-center agentName group-text">AGENT NAME</th>' +
        '<th class="text-center sessionStartTime">SESSION<br />START TIME</th>' +
        '<th class="text-center sessionDuration sorter-false">SESSION<br />DURATION</th>' +
        '<th class="text-center nodeStartTime sorter-false">NODE<br />START<br />TIME</th>' +
        '<th class="text-center nodeDuration sorter-false">NODE<br />DURATION</th>' +
        '<th class="text-center skillGroup group-word">SKILL GROUP</th>' +
        '<th class="text-center flowName sorter-false">FLOW NAME</th>' +
        '<th class="text-center nodeName sorter-false">NODE NAME</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody >' +
        '</tbody>' +
        '</table>' +
        '</div>';
    $('div#Contents').append(row);
    // Set ALL Sessions as default tab
    $('.nav-tabs a[skillGroup="ALLSESSIONS"]').tab('show');
    $('table.ALLSESSIONS').trigger('update');
    // Make table sortable
    $('table.ALLSESSIONS').tablesorter({
        theme: "custom",
        sortReset: true,
        sortList: [[3,1]],
        widgets: ["zebra"],
    });
    $('a[data-toggle="tab"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function (e) {
        var target = $(e.target).attr('skillGroup');
        $('table.' + target).trigger('update');
    });
    // Add StalledSessions Tab
    row = '<li class="pull-right" tabId="STALLEDSESSIONS">' +
        '<a class="nav-link" data-toggle="tab" skillGroup="STALLEDSESSIONS" href="#STALLEDSESSIONS">STALLED SESSIONS (<span>0</span>)</a>' +
        '</li> ';
    $('ul#Tabs').append(row);
    row = '<div id="STALLEDSESSIONS" class="tab-pane">' +
        '<div class="buttonrow">' +
        '<span class="buttons">' + 
        'GROUP BY: ' +
        '<input type="radio" name="STALLEDSESSIONS" class="groupOption" value="none" checked="checked">NONE' +
        '<input type="radio" name="STALLEDSESSIONS" class="groupOption" value="agentname">AGENT NAME' +
        '<input type="radio" name="STALLEDSESSIONS" class="groupOption" value="skillgroup">SKILL GROUP' +
        '</span>' +
        '</div> ' +
        '<table class="center groupable hover-highlight STALLEDSESSIONS">' +
        '<thead>' +
        '<tr>' +
        '<th class="text-center attUID group-letter">ATT<br />UID</th>' +
        '<th class="text-center agentName group-text">AGENT NAME</th>' +
        '<th class="text-center sessionStartTime">SESSION<br />START TIME</th>' +
        '<th class="text-center sessionDuration sorter-false">SESSION<br />DURATION</th>' +
        '<th class="text-center nodeStartTime sorter-false">NODE<br />START<br />TIME</th>' +
        '<th class="text-center nodeDuration sorter-false">NODE<br />DURATION</th>' +
        '<th class="text-center skillGroup group-word">SKILL GROUP</th>' +
        '<th class="text-center flowName sorter-false">FLOW NAME</th>' +
        '<th class="text-center nodeName sorter-false">NODE NAME</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody >' +
        '</tbody>' +
        '</table>' +
        '</div>';
    $('div#Contents').append(row);
    // Create event or changing the group option button
    $('.groupOption').off('change.groupOption').on('change.groupOption', function () {
        value = $(this).val();
        name = $(this).attr('name');
        if (value == "none") {
            $('table.' + name).trigger('removeWidget', 'group');
        }
        if (value == "agentname") {
            $('table.' + name).trigger('removeWidget', 'group');
            $('table.' + name).data('tablesorter').widgets = ['group'];
            $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [1];
            $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
            $('table.' + name).trigger('applyWidgets');
        }
        if (value == "skillgroup") {
            $('table.' + name).trigger('removeWidget', 'group');
            $('table.' + name).data('tablesorter').widgets = ['group'];
            $('table.' + name).data('tablesorter').widgetOptions.group_forceColumn = [6];
            $('table.' + name).data('tablesorter').widgetOptions.group_enforceSort = false;
            $('table.' + name).trigger('applyWidgets');
        }
    });
    // Make Table Sortable
    $('table.STALLEDSESSIONS').tablesorter({
        theme: "custom",
        sortList: [[3,1]],
        sortReset: true,
        widgets: ["zebra"],
    });
    // When tab is clicked, it should resort the table for it
    $('a[data-toggle="tab"]').off('shown.bs.tab.resort').on('shown.tab.bs.resort', function (e) {
        var target = $(e.target).attr('skillGroup');
        $('table.' + target).trigger('update');
    });
};