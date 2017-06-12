using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalR.Server.Web
{ 
    public class UserInfo
    {
        public string UserName;
        public string motiveSessionId;
        public string flowStartTime;
        public string nodeName;
        public string nodeStartTime;

    }

    public class Users
    {
        public string ConnectionId;
        public UserInfo userInfo;
    }
}