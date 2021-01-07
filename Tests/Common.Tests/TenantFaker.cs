using Bogus;
using Pesabooks.Domain.Members;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Common.Tests
{
    public class TenantFaker : Faker<Tenant>
    {
        public TenantFaker(int userId)
        {
            CustomInstantiator(f => new Tenant(
                userId,
                f.Company.CompanyName(),
                 f.Name.LastName(),
                 f.Finance.Currency().Code
                 ));
        }
    }
}
