using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;

namespace SignalRServerWeb
{
    public class MyHub : Hub
    {

        private static Dictionary<string, UserInfo> Users = new Dictionary<string, UserInfo>();

        // Default Server Echo Method
        public void Echo(string text)
        {
            Clients.Caller.echo(text);
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
                Clients.Caller.echo("Old Name: " + oldName + " New Name: " + newName);
            } else { 
                Clients.Caller.echo("New Name: " + newName);
            }
            UserInfo.UserName = newName;
            Users[connectionId] = UserInfo;
        }

        // Shows UserName
        public void ShowUserName()
        {
            string connectionId = Context.ConnectionId;
            Users.TryGetValue(connectionId, out UserInfo UserInfo);
            Clients.Caller.echo("Stored Name: " + UserInfo.UserName);
        }

        public string GetUserNameByConnectionId(string connectionId)
        {
            UserInfo UserInfo;
            Users.TryGetValue(connectionId, out UserInfo);
            return UserInfo.UserName;
        }


        public override Task OnConnected()
        {
            string connectionId = Context.ConnectionId;
            UserInfo userInfo = new UserInfo();
            Users.Add(connectionId, userInfo);
            if (Context.User.Identity.IsAuthenticated)
            {
                string userName = Context.User.Identity.Name.GetUserName().Trim().ToLower();
                SetUserName(userName);
            }
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string connectionId = Context.ConnectionId;
            string userName = GetUserNameByConnectionId(connectionId);
            Clients.Others.echo("Disconnected User: " + userName);
            Users.Remove(connectionId);
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            return base.OnReconnected();
        }
    }
}