using Pesabooks.Domain.Common.Entities;
using Pesabooks.Tenancy.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Identity
{
    public class UserTenant : BaseEntity
    {
        public bool Default { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }


        public int TenantId { get; set; }
        public Tenant Tenant { get; set; }
    }
}
