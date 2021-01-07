using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace Pesabooks.Domain.Identity
{
    public class User : IdentityUser<int>
    {
        public ICollection<UserTenant> UserTenants { get; set; }
        //public ICollection<UserRole> UserRole { get; set; }
    }
}
