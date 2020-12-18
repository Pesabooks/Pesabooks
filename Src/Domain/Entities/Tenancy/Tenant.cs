using Pesabooks.Domain.Common.Entities;
using Pesabooks.Domain.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Tenancy.Entities
{
    public class Tenant : BaseEntity
    {
        public string Domain { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public ICollection<UserTenant> UserTenants { get; set; }
    }
}
