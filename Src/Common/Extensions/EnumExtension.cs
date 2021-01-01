using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Common.Extensions
{
    public static class EnumExtension
    {
        public static string GetIdString(this Enum _enum)
        {
            var id = Convert.ToInt32(_enum);
            return id.ToString();

        }
    }
}
