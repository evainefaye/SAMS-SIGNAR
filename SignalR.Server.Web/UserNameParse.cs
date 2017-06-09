using System.Text.RegularExpressions;

namespace SignalR.Server.Web
{
    public static class UserNameParse
    {
        public static string GetUserDomain(this string identity)
        {
            return Regex.Match(identity, ".*\\\\").ToString();
        }

        public static string GetUserName(this string identity)
        {
            return Regex.Replace(identity, ".*\\\\", "");
        }
    }
}