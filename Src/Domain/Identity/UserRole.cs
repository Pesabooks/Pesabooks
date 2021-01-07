using Microsoft.AspNetCore.Identity;
using Pesabooks.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Identity
{
    public class UserRole : IdentityUserRole<int>, IHaveTenant
    {
        public int TenantId { get; set; }
    }
}
