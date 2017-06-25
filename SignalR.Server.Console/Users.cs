using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalR.Server.Console
{ 
    public class UserInfo
    {
        public string attUID;
        public string agentName;
        public string locationCode;
        public string smpSessionId;
        public string skillGroup;
        public string sessionStartTime;
        public string flowName;
        public string nodeName;
        public string nodeStartTime;
        public List<string> flowHistory;
        public List<string> nodeHistory;
        public UserInfo()
        {
            this.flowHistory = new List<string>();
            this.nodeHistory = new List<string>();
        }
    }

    public class Users
    {
        public string ConnectionId;
        public UserInfo userInfo;
    }
}