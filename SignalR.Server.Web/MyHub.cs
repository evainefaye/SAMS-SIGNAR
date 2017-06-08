using Microsoft.AspNet.SignalR;

namespace SignalR.Server.Web
{
    public class MyHub : Hub
    {

        // Default Server Method
        public void Hello()
        {
            Clients.All.hello();
        }
    }
}