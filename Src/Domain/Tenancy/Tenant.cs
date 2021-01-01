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
        public string Domain { get; private set; }
        public string Name { get; private set; }
        public string Description { get; private set; }
        public string DefaultCurrency { get; private set; }

        public Tenant(string name, string description, string domain, string defaultCurrency)
        {
            Domain = domain;
            Name = name;
            Description = description;
            DefaultCurrency = defaultCurrency;
        }

        public ICollection<UserTenant> UserTenants { get; set; }
    }
}
