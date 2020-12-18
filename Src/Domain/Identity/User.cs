using Microsoft.AspNetCore.Identity;
using Pesabooks.Tenancy.Entities;
using System.Collections.Generic;

namespace Pesabooks.Domain.Identity
{
    public class User : IdentityUser<int>
    {
        public ICollection<UserTenant> UserTenants { get; set; }
    }
}
