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

        // Sets the UserName and displays old (if previously set) and new name
        public void SetUserName(string newName)
        {
            newName = newName.Trim().ToLower();
            // Do Nothing if Username was empty
            if (String.IsNullOrEmpty(newName)) 
            {
                return;
            }
            // Get Key for Dictionary Item
            string connectionId = Context.ConnectionId;
            if (Users.TryGetValue(connectionId, out UserInfo UserInfo))
            {
                string oldName = UserInfo.UserName;
                if (String.IsNullOrEmpty(oldName))
                {
                    ShowActivity("others", "User " + oldName + " now known as  " + newName);
                    ShowActivity("caller", "You will now be known as  " + newName);
                }
            }
            Clients.Caller.updateUserName(newName); // Update UserName 
            UserInfo.UserName = newName;
            Users[connectionId] = UserInfo;
        }

        public string GetUserNameByConnectionId(string connectionId)
        {
            Users.TryGetValue(connectionId, out UserInfo UserInfo);
            return UserInfo.UserName;
        }

        // Update the user record with parameters
        public void StartSASHASession()
        {
            string connectionId = Context.ConnectionId;
            Users.TryGetValue(connectionId, out UserInfo UserInfo);
            string userName = UserInfo.UserName;
            string motiveSessionId = KeyGenerator.GetUniqueKey(15);
            string flowStartTime = DateTime.UtcNow.ToString("o");
            string nodeName = KeyGenerator.GetUniqueKey(5);
            string nodeStartTime = DateTime.UtcNow.ToString("o");
            UserInfo.motiveSessionId = motiveSessionId;
            UserInfo.flowStartTime = flowStartTime;
            UserInfo.nodeName = nodeName;
            UserInfo.nodeStartTime = nodeStartTime;
            Users[connectionId] = UserInfo;
            AddSASHAConnection(connectionId, userName, motiveSessionId, flowStartTime, nodeName, nodeStartTime);
        }

        // Add the row to the displayed table
        public void AddSASHAConnection(string connectionId, string userName, string motiveSessionId, string flowStartTime, string nodeName, string nodeStartTime)
        {
            Clients.All.addSASHAConnection(connectionId, userName, motiveSessionId, flowStartTime, nodeName, nodeStartTime);
        }

        // Removes the row from the displayed table
        public void RemoveSASHAConnection(string connectionId)
        {
            Clients.All.removeSASHAConnection(connectionId);
        }

        // Reload the table
        public void RefreshSASHAConnections()
        {
            foreach (KeyValuePair<string, UserInfo> User in Users)
            {
                if (User.Value.flowStartTime != null)
                {
                    string connectionId = User.Key;
                    string userName = User.Value.UserName;
                    string motiveSessionId = User.Value.motiveSessionId;
                    string flowStartTime = User.Value.flowStartTime;
                    string nodeName = User.Value.nodeName;
                    string nodeStartTime = User.Value.nodeStartTime;
                    Clients.Caller.addSASHAConnection(connectionId, userName, motiveSessionId, flowStartTime, nodeName, nodeStartTime);
                }
            }
        }

        public override Task OnConnected()
        {
            string userName;
            string connectionId = Context.ConnectionId;
            UserInfo userInfo = new UserInfo();
            Users.Add(connectionId, userInfo);
            if (Context.User.Identity.IsAuthenticated)
            {
                userName = Context.User.Identity.Name.GetUserName().Trim().ToLower();
            } else
            {
                userName = KeyGenerator.GetUniqueKey(10);
            }
            userInfo.UserName = userName;
            Users[connectionId] = userInfo;
            ShowActivity("caller", "Welcome " + userName);
            ShowActivity("others", "Connection: " + userName);
            Clients.Caller.updateUserName(userName); // Update UserName 
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string connectionId = Context.ConnectionId;
            string userName = GetUserNameByConnectionId(connectionId);
            ShowActivity("others", "Disconnection: " + userName);
            Clients.All.removeSASHAConnection(connectionId);
            Users.Remove(connectionId);
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            return base.OnReconnected();
        }
    }
}