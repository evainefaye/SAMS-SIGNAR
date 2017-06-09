using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;

namespace SignalR.Server.Web
{
    public class MyHub : Hub
    {

        private static Dictionary<string, UserInfo> Users = new Dictionary<string, UserInfo>();

        // Default Server Echo Method
        public void Echo(string text)
        {
            Clients.Caller.echo(text);
        }

        // Gets the userId of the logged in user
        public void GetUserName()
        {
            if (Context.User.Identity.IsAuthenticated)
            {
                string userName = System.Environment.UserName.ToLower();
                userName = Context.User.Identity.Name.GetUserName().ToLower();
                SetUserName(userName);
            }
        }

        // Sets the UserName and displays old (if previously set) and new name
        public void SetUserName(string userName)
        {
            // Do Nothing if Username was empty
            if (userName == "")
            {
                return;
            }
            // Get Key for Dictionary Item
            string connectionId = Context.ConnectionId;
            UserInfo UserInfo;
            Users.TryGetValue(connectionId, out UserInfo);
            if (UserInfo.UserName != null) {
                Clients.Caller.echo("OldName: " + UserInfo.UserName);
            }
            Clients.Caller.echo("NewName: " + userName);
            UserInfo.UserName = userName;
            Users[connectionId] = UserInfo;
        }

        // Shows UserName
        public void ShowUserName()
        {
            string connectionId = Context.ConnectionId;
            UserInfo UserInfo;
            Users.TryGetValue(connectionId, out UserInfo);
            Clients.Caller.echo("UserName: " + UserInfo.UserName);
        }

        
        public override Task OnConnected()
        {
            string connectionId = Context.ConnectionId;
            UserInfo userInfo = new UserInfo();
            Users.Add(connectionId, userInfo);
            GetUserName();
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string connectionId = Context.ConnectionId;
            Users.Remove(connectionId);
            Clients.All.echo("Client Disconnect Detected");
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            Clients.Caller.echo("Welcome back!");
            return base.OnReconnected();
        }
    }
}