using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using System;

namespace SignalR.Server.Web
{
    public class MyHub : Hub
    {

        // Default Server Echo Method
        public void Echo(string text)
        {
            Clients.Caller.echo(text);
        }

        public void Authenticated()
        {
            // Generate a Random Number to attach to user Name for testing only
            Random rnd = new Random();
            int rndNum = rnd.Next(1, 5);
            string user = System.Environment.UserName.ToLower() + rndNum.ToString();
            // string user = System.Environment.UserName.ToLower();
            Clients.Caller.echo("Connected as " + user);
        }

        public override Task OnConnected()
        {
            return base.OnConnected();
        }
    }
}