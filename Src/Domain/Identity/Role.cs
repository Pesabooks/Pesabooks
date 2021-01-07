using Microsoft.AspNetCore.Identity;
using Pesabooks.Domain.Common;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Identity
{
    public class Role : IdentityRole<int>, IHaveTenant
    {
        internal Role()
        {

        }

        public Role(int tenantId, string roleName) : base(roleName)
        {
            TenantId = tenantId;
        }

        public int TenantId { get; set; }
        public Tenant Tenant { get; set; }
    }
}
