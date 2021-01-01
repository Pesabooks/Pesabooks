using Pesabooks.Domain.Common;
using Pesabooks.Tenancy.Domain;

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
