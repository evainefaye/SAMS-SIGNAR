// var attUID, agentName, location, smpSessionId, skillGroup, flowName, stepName;

$(document).ready(function () {
    // Set the location of the SignalR HUB based on URL
    switch (window.location.hostname.toLowerCase().split(".")[0]) {
        case "fde":
            $.connection.hub.url = "http://fde.server.sams.hawkbane.biz/signalr/";
            version = "FDE (FLOW DEVELOPMENT ENVIRONMENT)";
            monitorURL = "http://fde.hawkbane.biz";
            break;
        case "beta":
            $.connection.hub.url = "http://beta.server.sams.hawkbane.biz/signalr/";
            version = "BETA (PRE-PROD)";
            monitorURL = "http://beta.hawkbane.biz";
            break;
        case "prod":
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
            version = "PRODUCTION";
            monitorURL = "http://prod.hawkbane.biz";
            break;
        default:
            $.connection.hub.url = "http://prod.server.sams.hawkbane.biz/signalr/";
            version = "PRODUCTION";
            monitorURL = "http://prod.hawkbane.biz";
            break;
    }

    // Set the Version Type and the link to the monitor
    $('span#version').html(version);
    $('a#monitorURL').attr('href', monitorURL);

    // Initialize variables
    disconnectNotified = false;
    myHub = $.connection.myHub;

    myHub.client.showActivity = function (timestamp, text) {
        time = toDisplayTimestamp(timestamp);
        text = "<li>" + time + text + "</li>";
        $('ul#activity').append(text);
    };

    // Request a SASHA Screenshot
    myHub.client.requestSASHAScreenshot = function (connectionId) {
        element = $('body');
        html2canvas(element).then(function (canvas) {
            try {
                img = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
            }
            catch (e) {
                img = canvas.toDataURL().split(",")[1];
            }
            img = "data:image/jpeg;base64," + img;;
            myHub.server.receiveSASHAScreenshot(connectionId, img);
        });
    };

    //Start the hub then show the first screen
    $.connection.hub.start()
        .done(showRegisterSASHASession);

    // if connection is lost, show that it was lost and try to reconnect
    $.connection.hub.disconnected(function () {
        if (!disconnectNotified) {
            disconnectNotified = true;
        }
        setTimeout(function () {
            $.connection.hub.start()
            .done(function () {
                disconnectNotified = false;
            });
        }, 5000); // Restart connection after 5 seconds.
     });
});

showRegisterSASHASession = function () {
    $('div#connecting').hide();
    $('div#registerSASHASession').show();
    $('input#attUID').val(randomString(6));
    $('input#agentName').val(randomString((Math.random() * 10) + 5));
    $('input#location').val(randomString((Math.random() * 5) + 5));
    $('input#smpSessionId').val(randomString(25, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));

    $('button#registerSASHASessionButton').off('click').on('click', function () {
        $('.error').removeClass('error');
        attUID = $.trim($('input#attUID').val()).toLowerCase();
        agentName = $.trim($('input#agentName').val()).toUpperCase();
        loc = $.trim($('input#location').val()).toUpperCase();
       smpSessionId = $.trim($('input#smpSessionId').val()).toUpperCase();
        if (attUID == "") {
            $('input#attUID').addClass("error");
        }
        if (agentName == "") {
            $('input#agentName').addClass("error");
        }
        if (loc == "") {
            $('input#location').addClass("error");
        }
        if (smpSessionId == "") {
            $('input#smpSessionId').addClass("error");
        }
        if (attUID == "" || agentName == "" || loc == "" || smpSessionId == "") {
            return false;
        }
        myHub.server.registerSASHASession(attUID, agentName, location, smpSessionId);
        console.log('running: myHub.server.registerSASHASession("' + attUID + '", "' + agentName + '","' + loc + '","' + smpSessionId + '");');
        console.log('exact: myHub.server.registerSASHASession(attUID, agentName, location, smpSessionId);');
        $('div#registerSASHASession').hide();
        $('div#startSASHAFlow').show();
        showStartSASHAFlow();
    });
};

showStartSASHAFlow = function () {
    $('td.agentName').html(agentName + " (" + attUID + ")");
    $('input#skillGroup').val(getSkillGroup());
    $('input#flowName').val(randomString(12));
    $('input#stepName').val(randomString(18));
    $('button#startSASHAFlowButton').off('click').on('click', function () {
        $('.error').removeClass('error');
        skillGroup = $.trim($('input#skillGroup').val()).toUpperCase();
        flowName = $.trim($('input#flowName').val()).toUpperCase();
        stepName = $.trim($('input#stepName').val()).toUpperCase();
        if (skillGroup == "") {
            $('input#skillGroup').addClass('error');
        }
        if (flowName == "") {
            $('input#flowName').addClass('error');
        }
        if (stepName == "") {
            $('input#stepname').addClass('error');
        }
        if (skillGroup == "" || flowName == "" || stepName == "") {
            return false;
        }
        myHub.server.startSASHAFlow(skillGroup, flowName, stepName);
        console.log('running: myHub.server.startSASHAFlow("' + skillGroup + '", "' + flowName + '", "' + stepName + '");');
        console.log('exact: myHub.server.startSASHAFlow(skillGroup, flowName, stepName);');
        $('div#startSASHAFlow').hide();
        $('div#updateNodeInfo').show();
        showUpdateNodeInfo();
    });
};

showUpdateNodeInfo = function () {
    $('td.agentName').html(agentName + " (" + attUID + ")");
    $('td.skillGroup').html(skillGroup);
    $('td.lastFlowName').html(flowName);
    $('td.lastStepName').html(stepName);
    $('input.flowName').val(randomString(12));
    $('input.stepName').val(randomString(18));
    $('button#updateNodeInfoButton').off('click').on('click', function () {
        $('.error').removeClass('error');
        flowName = $.trim($('input.flowName').val()).toUpperCase();
        stepName = $.trim($('input.stepName').val()).toUpperCase();
        if (flowName == "") {
            $('input.flowName').addClass('error');
        }
        if (stepName == "") {
            $('input.stepname').addClass('error');
        }
        if (flowName == "" || stepName == "") {
            return false;
        }
        myHub.server.updateNodeInfo(flowName, stepName);
        console.log('running: myHub.server.updateNodeInfo("' + flowName + '", "' + stepName + '")');
        console.log('exact: myHub.server.updateNodeInfo(flowName, stepName);');
    });
    $('button#restartFlow').off('click').on('click', function () {
        location.reload();
    });
};

randomString = function (len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}

getSkillGroup = function () {
    skillGroups = ["UA_TRINITY_ORDERING", "UA_SPECIAL", "TSCNOC", "TSC", "GCSC", "NSD", "MIS", "AVOICS", "BVOIP", "HALO", "LNS", "GAMMA", "ATTC", "VT", "MISGov", "VDS", "CABS", "AEGIS", "UNKNOWN"
    ];
    return skillGroups[Math.floor(Math.random() * skillGroups.length)];
}

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