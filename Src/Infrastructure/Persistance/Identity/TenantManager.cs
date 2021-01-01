using Microsoft.EntityFrameworkCore;
using Pesabooks.Domain.Common;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Pesabooks.Application.Common.Interfaces;

namespace Pesabooks.Infrastructure.Persistance.Identity
{
    public class TenantManager : ITenantManager
    {
        private readonly AppIdentityDbContext _identityDbContext;
        public TenantManager(AppIdentityDbContext identityDbContext)
        {
            _identityDbContext = identityDbContext;
        }

        public IQueryable<Tenant> Tenants => _identityDbContext.Tenants.AsQueryable();

        public async Task<Tenant> FindByIdAsync(int tenantId)
        {
            var tenant = await _identityDbContext.Tenants.FindAsync(tenantId);
            return tenant;
        }

        public async Task<Tenant> FindByDomainAsync(string domain)
        {
            var tenant = await _identityDbContext.Tenants.Where(t=>t.Domain.ToLower() == domain.ToLower()).FirstOrDefaultAsync();
            return tenant;
        }
    }
}
