using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using UniqueKey;
using LoginInfo;

namespace SignalR.Server.Web
{
    public class MyHub : Hub
    {

        private static Dictionary<string, UserInfo> Users = new Dictionary<string, UserInfo>();
        public static string serverStarted = DateTime.UtcNow.ToString("o");

        // Default Server ShowActivity Method
        public void ShowActivity(string target, string text)
        {
            string timestamp = DateTime.UtcNow.ToString("o");
            switch (target.ToLower())
            {
                case "caller":
                    Clients.Caller.showActivity(timestamp, text);
                    break;
                case "all":
                    Clients.All.showActivity(timestamp, text);
                    break;
                case "others":
                    Clients.Others.showActivity(timestamp, text);
                    break;
            }
        }

//        // Sets the UserName and displays old (if previously set) and new name
//        public void SetUserName(string newName)
//        {
//            newName = newName.Trim().ToLower();
//            // Do Nothing if Username was empty
//            if (String.IsNullOrEmpty(newName)) 
//            {
//                return;
//            }
//            // Get Key for Dictionary Item
//            string connectionId = Context.ConnectionId;
//            if (Users.TryGetValue(connectionId, out UserInfo UserInfo))
//            {
//                string oldName = UserInfo.attUID;
//                if (String.IsNullOrEmpty(oldName))
//                {
//                    ShowActivity("others", "User " + oldName + " now known as  " + newName);
//                    ShowActivity("caller", "You will now be known as  " + newName);
//                }
//            }
//            Clients.Caller.updateUserName(newName); // Update UserName 
//            UserInfo.attUID = newName;
//            Users[connectionId] = UserInfo;
//        }

        // Return UserName when you submit the connectionId
        public string GetAgentNameByConnectionId(string connectionId)
        {
            Users.TryGetValue(connectionId, out UserInfo UserInfo);
            return UserInfo.agentName;
        }

        // Registers a SASHA Session with agentName, locationCode, and smpSessionId
        public void RegisterSASHASession(string attUID, string agentName, string locationCode, string smpSessionId)
        {
            string connectionId = Context.ConnectionId;
            if (!Users.TryGetValue(connectionId, out UserInfo UserInfo))
            {
                UserInfo userInfo = new UserInfo();
                userInfo.attUID = attUID;
                userInfo.agentName = agentName;
                userInfo.locationCode = locationCode;
                userInfo.smpSessionId = smpSessionId;
                Users.Add(connectionId, userInfo);
                ShowActivity("all", "Registered: " + attUID + ", " + agentName + ", " + locationCode + ", " + smpSessionId);
            }
        }

        public void RequestServerStartTime()
        {
            Clients.Caller.showServerStartTime(serverStarted);
        }

        // Indicates that the SASHA session has started
        public void StartSASHAFlow(string skillGroup, string flowName, string nodeName)
        {
            string connectionId = Context.ConnectionId;
            Users.TryGetValue(connectionId, out UserInfo UserInfo);
            string attUID = UserInfo.attUID;
            string agentName = UserInfo.agentName;
            string locationCode = UserInfo.locationCode;
            string smpSessionId = UserInfo.smpSessionId;
            string sessionStartTime = DateTime.UtcNow.ToString("o");
            string nodeStartTime = DateTime.UtcNow.ToString("o");
            if (skillGroup == null || skillGroup == "null" || skillGroup == "")
            {
                skillGroup = "UNKNOWN";
            }
            Groups.Add(connectionId, skillGroup);
            Groups.Add(connectionId, locationCode);
            UserInfo.skillGroup = skillGroup;
            UserInfo.sessionStartTime = sessionStartTime;
            UserInfo.flowName = flowName;
            UserInfo.nodeName = nodeName;
            UserInfo.nodeStartTime = nodeStartTime;
            Users[connectionId] = UserInfo;
            AddSASHAConnection(connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime);
            ShowActivity("all", "Started flow for " + connectionId + "," + attUID + "," + agentName + "," + locationCode + "," + smpSessionId + "," + skillGroup + "," + sessionStartTime + "," + flowName + "," + nodeName + "," + nodeStartTime);
        }

        // Request all clients to add an active SASHA flow to the monitor display
        public void AddSASHAConnection(string connectionId, string attUID, string agentName, string locationCode, string smpSessionId, string skillGroup, string flowStartTime, string flowName, string nodeName, string nodeStartTime)
        {
            Clients.All.addSASHAConnection(connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, flowStartTime, flowName, nodeName, nodeStartTime);
        }

        // Removes the row from the displayed table
        public void RemoveSASHAConnection(string connectionId)
        {
            Clients.All.removeSASHAConnection(connectionId);
        }

        // Reload the table
        public void RefreshSASHAConnections(string active)
        {
//            ShowActivity("all", "Refreshing SASHA Connections");
            foreach (KeyValuePair<string, UserInfo> User in Users)
            {
                if (User.Value.sessionStartTime != null)
                {
                    string connectionId = User.Key;
                    string attUID = User.Value.attUID;
                    string agentName = User.Value.agentName;
                    string locationCode = User.Value.locationCode;
                    string smpSessionId = User.Value.smpSessionId;
                    string skillGroup = User.Value.skillGroup;
                    string sessionStartTime = User.Value.sessionStartTime;
                    string flowName = User.Value.flowName;
                    string nodeName = User.Value.nodeName;
                    string nodeStartTime = User.Value.nodeStartTime;
                    Clients.Caller.addSASHAConnection(connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime);
                }
            }
            if (active != "")
            {
                Clients.Caller.resetActiveTab(active);
            }
        }

        public void UpdateNodeInfo(string flowName, string nodeName)
        {
            string connectionId = Context.ConnectionId;
            string nodeStartTime = DateTime.UtcNow.ToString("o");
            if (Users.TryGetValue(connectionId, out UserInfo UserInfo))
            {
                UserInfo.flowName = flowName;
                UserInfo.nodeName = nodeName;
                UserInfo.nodeStartTime = nodeStartTime;
                Users[connectionId] = UserInfo;
            }
            Clients.All.updateNodeInfo(connectionId, flowName, nodeName, nodeStartTime);
            ShowActivity("all", "Updating Node: " + connectionId + "," + flowName + "," + nodeStartTime);
        }

        public void PullSASHAScreenshot(string SASHAConnectionId)
        {
            string connectionId = Context.ConnectionId;
            Clients.Client(SASHAConnectionId).requestSASHAScreenshot(connectionId);
        }

        public void ReceiveSASHAScreenshot(string MonitorConnectionId, string image)
        {
            string connectionId = Context.ConnectionId;
            Clients.Client(MonitorConnectionId).pushSASHAScreenshot(image);
        }

        public void PullSASHADictionary(string SASHAConnectionId)
        {
            string connectionId = Context.ConnectionId;
            Clients.Client(SASHAConnectionId).requestSASHADictionary(connectionId);
        }

        public void ReceiveSASHADictionary(string MonitorConnectionId, string dictionary)
        {
            string connectionId = Context.ConnectionId;
            Clients.Client(MonitorConnectionId).pushSASHADictionary(dictionary);
        }

        public void PullSASHADictionaryValue(string SASHAConnectionId, object requestValue)
        {
            string connectionId = Context.ConnectionId;
            Clients.Client(SASHAConnectionId).requestSASHADictionaryValue(connectionId, requestValue);
        }

        public void ReceiveSASHADictionaryValue(string MonitorConnectionId, object requestValue)
        {
            Clients.Client(MonitorConnectionId).pushSASHADictionaryValue(requestValue);
        }

        public void RequestStalledSession(string connectionId)
        {
            if (Users.TryGetValue(connectionId, out UserInfo UserInfo))
            {
                string attUID = UserInfo.attUID;
                string agentName = UserInfo.agentName;
                string locationCode = UserInfo.locationCode;
                string smpSessionId = UserInfo.smpSessionId;
                string skillGroup = UserInfo.skillGroup;
                string sessionStartTime = UserInfo.sessionStartTime;
                string flowName = UserInfo.flowName;
                string nodeName = UserInfo.nodeName;
                string nodeStartTime = UserInfo.nodeStartTime;
                Clients.All.receiveStalledSession(connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime);
            }
        }

        public void RequestClientDetail(string connectionId)
        {
//            string connectionId = Context.ConnectionId;
            if (Users.TryGetValue(connectionId, out UserInfo UserInfo))
            {
                string attUID = UserInfo.attUID;
                string agentName = UserInfo.agentName;
                string locationCode = UserInfo.locationCode;
                string smpSessionId = UserInfo.smpSessionId;
                string skillGroup = UserInfo.skillGroup;
                string sessionStartTime = UserInfo.sessionStartTime;
                string flowName = UserInfo.flowName;
                string nodeName = UserInfo.nodeName;
                string nodeStartTime = UserInfo.nodeStartTime;
                Clients.Caller.setClientDetail(connectionId, attUID, agentName, locationCode, smpSessionId, skillGroup, sessionStartTime, flowName, nodeName, nodeStartTime);
            }
            else
            {
                Clients.Caller.closeWindow();
            }

        }

        public override Task OnConnected()
        {
//            string userName;
//            string connectionId = Context.ConnectionId;
//            UserInfo userInfo = new UserInfo();
//            Users.Add(connectionId, userInfo);
//            if (Context.User.Identity.IsAuthenticated)
//            {
//                userName = Context.User.Identity.Name.GetUserName().Trim().ToLower();
//            } else
//            {
//                userName = KeyGenerator.GetUniqueKey(10);
//            }
//            userInfo.attUID = userName;
//            Users[connectionId] = userInfo;
//            ShowActivity("caller", "Welcome " + userName);
//            ShowActivity("others", "Connection: " + userName);
//            Clients.Caller.updateUserName(userName); // Update UserName 
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string connectionId = Context.ConnectionId;
            if (Users.TryGetValue(connectionId, out UserInfo UserInfo))
            {
                string skillGroup = UserInfo.skillGroup;
                Clients.All.removeSASHAConnection(connectionId, skillGroup);
                Users.Remove(connectionId);
            }
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            return base.OnReconnected();
        }
    }
}