using Pesabooks.Tenancy.Domain;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Application.Common.Interfaces
{
    public interface ITenantManager
    {
        IQueryable<Tenant> Tenants { get; }
        Task<Tenant> FindByIdAsync(int tenantId);
        Task<Tenant> FindByDomainAsync(string domain);
    }
}
