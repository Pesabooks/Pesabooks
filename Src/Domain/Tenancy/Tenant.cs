using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Common;
using Pesabooks.Domain.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Tenancy.Domain
{
    public class Tenant : BaseEntity
    {
        public string Name { get; private set; }
        public string Description { get; private set; }
        public string DefaultCurrency { get; private set; }

        public Tenant()
        {

        }

        public Tenant(string name, string description, string defaultCurrency)
        {
            Name = name;
            Description = description;
            DefaultCurrency = defaultCurrency;
        }

        public Tenant(int userId, string name, string description, string defaultCurrency)
        {
            Name = name;
            Description = description;
            DefaultCurrency = defaultCurrency;
            UserTenants = new List<UserTenant>
            {
                new UserTenant{UserId = userId}
            };
        }


        public ICollection<UserTenant> UserTenants { get; set; }
        public ICollection<Role> Roles { get; set; }
        public ICollection<Account> Accounts { get; private set; }
    }
}
