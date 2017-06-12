﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalR.Server.Web
{ 
    public class UserInfo
    {
        public string attUID;
        public string agentName;
        public string locationCode;
        public string smpSessionId;
        public string skillGroup;
        public string sessionStartTime;
        public string nodeName;
        public string nodeStartTime;

    }

    public class Users
    {
        public string ConnectionId;
        public UserInfo userInfo;
    }
}