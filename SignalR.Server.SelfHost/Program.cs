using System;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin.Hosting;
using Owin;
using Microsoft.Owin.Cors;

namespace SignalR.Server.SelfHost
{
    class Program
    {
        static void Main(string[] args)
        {
            string url = "http://*:5500";
            using (WebApp.Start(url))
            {
                Console.WriteLine("Server Running on {0}", url);
                Console.ReadLine();
            }
        }
    }
}
