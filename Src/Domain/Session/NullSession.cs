using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Session
{
    public class NullSession : ISession
    {
        public int? UserId => null;

        public int? TenantId => null;
    }
}
