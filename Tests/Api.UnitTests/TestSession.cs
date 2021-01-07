using Pesabooks.Domain.Session;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Api.IntegrationTests
{
    public class TestSession : ISession
    {
        public int? UserId => 1;

        public int? TenantId => 1;

        public Tenant Tenant => new Tenant { Id = 1 };
    
        
    }
}
