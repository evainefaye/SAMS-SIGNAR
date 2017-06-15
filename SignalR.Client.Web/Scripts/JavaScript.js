$(document).ready(function () {

    document.title = "SAMS - SASHA ACTIVE MONITORING SYSTEM";
    windowManager = new Object();
    // Set the location of the HUB based on URL
    switch (window.location.hostname.toLowerCase()) {
        case "fde.client.sams.hawkbane.biz":
            $.connection.hub.url = "http://fde.server.sams.hawkbane.biz/signalr/";
            break;
        case "beta.client.sams.hawkbane.biz":
            $.connection.hub.url = "http://beta.server.sams.hawkbane.biz/signalr/";
            break;
        case "prod.client.sams.hawkbane.biz":
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
            break;
    }

    disconnectNotified = false;
    myHub = $.connection.myHub;

    // Remove any detail windows when main window is closed
    $(window).on('unload', function () {
        $.each(windowManager, function (key) {
            windowManager[key].close();
            delete windowManager[key];
        });
    });

    // Default Client showActivity Method
    myHub.client.showActivity = function (timestamp, text) {
        text = toDisplayTimestamp(timestamp) + text;
        $('<li>' + text + '</li>').hide().prependTo('ul#activity').slideDown('slow');
    };

    // Add row to SASHA Users Information
    myHub.client.addSASHAConnection = function (connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime) {
        if (skillGroup === null || skillGroup === "null" || skillGroup === "") {
            skillGroup = "UNKNOWN";
        }
        // Begin add tab code here
        if ($('ul#skillgroupsTab li#' + skillGroup).length === 0) {
            // Skill Group tab did not exist so we need to add one
            row = '<li id="' + skillGroup + '"><a class="nav-link"  data-toggle="tab" href="#skillgroupsContent_' + skillGroup + '">' + skillGroup + '</a></li>';
            $('ul#skillgroupsTab').append(row);
            row = '<div id="skillgroupsContent_' + skillGroup + '" class="tab-pane">' +
                '<table class="center">' +
                '<thead>' +
                '<tr>' +
                '<th class="text-center attUID">ATT<br />UID</th>' +
                '<th class="text-center agentName">AGENT NAME</th>' +
                '<th class="text-center sessionStartTime">SESSION<br />START TIME</th>' +
                '<th class="text-center sessionDuration">SESSION<br />DURATION</th>' +
                '<th class="text-center nodeStartTime">NODE<br />START<br />TIME</th>' +
                '<th class="text-center nodeDuration">NODE<br />DURATION</th>' +
                '<th class="text-center flowName">FLOW NAME</th>' +
                '<th class="text-center nodeName">NODE NAME</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody >' +
                '</tbody>' +
                '</table>' +
                '</div>';
            $('div#skillgroupsContent').append(row);
            sortTabs('ul#skillgroupsTab');
        }

        // End Add tab code

        if ($('div#skillgroupsContent_' + skillGroup).find('table tbody tr[connectionId="' + connectionId + '"]').length === 0) {
            sessionStartTimestamp = new Date(sessionStartTime);
            sessionStartTime = toLocalTime(sessionStartTime);
            nodeStartTimestamp = new Date(nodeStartTime);
            nodeStartTime = toLocalTime(nodeStartTime);
            row = '<tr connectionId="' + connectionId + '">'
                + '<td class="text-centers">' + attUID + '</td>'
                + '<td class="text-left">' + agentName + '</td>'
                + '<td class="text-center">' + sessionStartTime + '</td>'
                + '<td class="text-right"><div class="session" sessionDurationId="sessionDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center" nodeStartTimeId="nodeStartTime_' + connectionId + '">' + nodeStartTime + '</td>'
                + '<td class="text-right"><div class="node" nodeDurationId="nodeDuration_' + connectionId + '"></div></td>'
                + '<td class="text-left" flowNameId="flowName_' + connectionId + '">' + flowName + '</td>'
                + '<td class="text-left" nodeNameId="nodeName_' + connectionId + '">' + nodeName + '</td>'
                + '</tr>';
            $('div#skillgroupsContent_' + skillGroup + ' table ').find('tbody:last').append(row);
            $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown({
                since: sessionStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkExtendedDuration,
                tickInterval: 5
            });
            $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown({
                since: nodeStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkExtendedDuration,
                tickInterval: 5
            });
//            if ($('#skillgroupsTab.active').length === 0) {
//                $('#skillgroupsTab a:first').click();
//            }
        }
        // Setup the table click 
        $('table tr').off('dblclick touch').on('dblclick touch', function () {
            id = $(this).attr('connectionId');
            //            $('img#SASHAScreenshot').attr('src', '/Images/wait.gif');
            //            myHub.server.pullSASHAScreenshot(id);
            winName = "window_" + id;
            windowManager[winName] = window.open("/popup/index.html?id=" + id, winName);
        });
        $('tbody tr').removeClass('stripped');
        $('tbody tr:odd').addClass('stripped');
        $('tbody tr').hover(
            function () {
                $(this).addClass('hover');
            },
            function () {
                $(this).removeClass('hover');
            }
        );
    };

    // Display SASHA screenshot
    myHub.client.pushSASHAScreenshot = function (img) {
        $('img#SASHAScreenshot').attr('src', img);
        $('img#SASHAScreenshot').show();
    };

    myHub.client.removeSASHAConnection = function (connectionId, skillGroup) {
        $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown('destroy');
        $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown('destroy');
        $('tr[connectionId="' + connectionId + '"]').remove();

        winName = "window_" + connectionId;
        if (typeof windowManager[winName] === "object") {
            windowManager[winName].close();
            delete windowManager[winName];
        }
        //        if ($('table#sashaConnections_' + skillGroup + ' tbody tr').length == 0) {
        //            $('#skillgroupsTab li#' + skillGroup).remove();
        //            $('#skillgroupsContent_' + skillGroup).remove();
        //        }
    };

    myHub.client.updateNodeInfo = function (connectionId, flowName, nodeName, nodeStartTime) {
        nodeStartTimestamp = new Date(nodeStartTime);
        nodeStartTime = toLocalTime(nodeStartTime);
        $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown('destroy');
        $('td[flowNameId="flowName_' + connectionId + '"]').html(flowName);
        $('td[nodeNameId="nodeName_' + connectionId + '"]').html(nodeName);
        $('td[nodeStartTime="nodeStartTime_' + connectionId + '"]').html(nodeStartTime);
        $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown({
            since: nodeStartTimestamp,
            compact: true,
            layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
            format: 'yowdhMS'
        });
    };

    myHub.client.resetActiveTab = function (active) {
        //        setTimeout(function () {
        $('li#' + active + ' a:first').click();
        //            $('div.initializationScreen').hide();
        //            $('div.mainScreen').show();
        //            console.log('li#' + active + ' a:first');
        //        }, 3000);
    };

    myHub.client.showServerStartTime = function (timestamp) {
        time = toLocalDateTime(timestamp);
        $('span#serverStartTime').html(time);
    };










    myHub.client.receiveStalledSession = function (connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime) {
        if ($('div#skillgroupsContent_STALLEDSESSIONS').find('table tbody tr[connectionId="' + connectionId + '"]').length === 0) {
            sessionStartTimestamp = new Date(sessionStartTime);
            sessionStartTime = toLocalTime(sessionStartTime);
            nodeStartTimestamp = new Date(nodeStartTime);
            nodeStartTime = toLocalTime(nodeStartTime);
            if (skillGroup === null || skillGroup === "null" || skillGroup === "") {
                skillGroup = "UNKNOWN";
            }
            row = '<tr connectionId="' + connectionId + '">'
                + '<td class="text-centers">' + attUID + '</td>'
                + '<td class="text-left">' + agentName + '</td>'
                + '<td class="text-center">' + sessionStartTime + '</td>'
                + '<td class="text-right"><div class="session" sessionDurationId="sessionDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center" nodeStartTimeId="nodeStartTime_' + connectionId + '">' + nodeStartTime + '</td>'
                + '<td class="text-right"><div class="node" nodeDurationId="nodeDuration_' + connectionId + '"></div></td>'
                + '<td class="text-center">' + skillGroup + '</td>'
                + '<td class="text-left" flowNameId="flowName_' + connectionId + '">' + flowName + '</td>'
                + '<td class="text-left" nodeNameId="nodeName_' + connectionId + '">' + nodeName + '</td>'
                + '</tr>';
            $('div#skillgroupsContent_STALLEDSESSIONS table ').find('tbody:last').append(row);
            $('div[sessionDurationId="sessionDuration_' + connectionId + '"]').countdown({
                since: sessionStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkExtendedDuration,
                tickInterval: 5
            });
            $('div[nodeDurationId="nodeDuration_' + connectionId + '"]').countdown({
                since: nodeStartTimestamp,
                compact: true,
                layout: '{d<} {dn} {d1} {d>} {h<} {hnn} {sep} {h>} {mnn} {sep} {snn}',
                format: 'yowdhMS',
                onTick: checkExtendedDuration,
                tickInterval: 5
            });
        }
        $('tbody tr').removeClass('stripped');
        $('tbody tr:odd').addClass('stripped');
        $('tbody tr').hover(
            function () {
                $(this).addClass('hover');
            },
            function () {
                $(this).removeClass('hover');
            }
        );
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
        active = $('li.active').attr('id');
        $('.is-countdown').countdown('destroy');
        $('ul#skillgroupsTab').empty();
        $('div#skillgroupsContent').empty();
        $.each(windowManager, function (key) {
            windowManager[key].close();
            delete windowManager[key];
        });
        addStalledTab();
        myHub.server.refreshSASHAConnections(active);
    });
    addStalledTab();
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

toLocalDateTime = function (timestamp) {
    if (timestamp !== null) {
        timestamp = new Date(timestamp);
        month = timestamp.getMonth();
        day = timestamp.getDay();
        year = timestamp.getFullYear();
        hours = "0" + timestamp.getHours();
        hours = hours.slice(-2);
        minutes = "0" + timestamp.getMinutes();
        minutes = minutes.slice(-2);
        seconds = "0" + timestamp.getSeconds();
        seconds = seconds.slice(-2);
        return month + "/" + day + "/" + year + " @ " + hours + ":" + minutes + ":" + seconds;
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
    myHub.server.requestServerStartTime();
};

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

checkExtendedDuration = function (periods) {
    if ($(this).hasClass("session")) {
        if ($.countdown.periodsToSeconds(periods) > 1200) {
            $(this).addClass('highlightDuration');
            connectionId = $(this).closest('tr').attr('connectionId');
            if (!$('div#skillgroupContent_STALLEDSESSIONS table tbody tr[connectionId="' + connectionId + '"]').length) {
                myHub.server.requestStalledSession(connectionId);
            }
        }
    }
    if ($(this).hasClass("node")) {
        if ($.countdown.periodsToSeconds(periods) > 300) {
            $(this).addClass('highlightDuration');
        } else {
            $(this).removeClass('highlightDuration');
        }
    }
};

addStalledTab = function () {
    row = '<li class="pull-right" id="STALLEDSESSIONS"><a class="nav-link"  data-toggle="tab" href="#skillgroupsContent_STALLEDSESSIONS">STALLED SESSIONS</a></li>';
    $('ul#skillgroupsTab').append(row);
    row = '<div id="skillgroupsContent_STALLEDSESSIONS" class="tab-pane">' +
        '<table class="center">' +
        '<thead>' +
        '<tr>' +
        '<th class="text-center attUID">ATT<br />UID</th>' +
        '<th class="text-center agentName">AGENT NAME</th>' +
        '<th class="text-center sessionStartTime">SESSION<br />START TIME</th>' +
        '<th class="text-center sessionDuration">SESSION<br />DURATION</th>' +
        '<th class="text-center nodeStartTime">NODE<br />START<br />TIME</th>' +
        '<th class="text-center nodeDuration">NODE<br />DURATION</th>' +
        '<th class="text-center skillGroup">SKILL GROUP</th>' +
        '<th class="text-center flowName">FLOW NAME</th>' +
        '<th class="text-center nodeName">NODE NAME</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody >' +
        '</tbody>' +
        '</table>' +
        '</div>';
    $('div#skillgroupsContent').append(row);
    $('.nav-tabs a[href="#skillgroupsContent_STALLEDSESSIONS"]').tab('show');
};