﻿using System.Text.RegularExpressions;

namespace SignalR.Server.Web
{
    public static class UserExtensions
    {
        public static string GetDomain(this string identity)
        {
            return Regex.Match(identity, ".*\\\\").ToString().ToLower();
        }

        public static string GetUserId(this string identity)
        {
            return Regex.Replace(identity, ".*\\\\", "").ToLower();
        }
    }
}