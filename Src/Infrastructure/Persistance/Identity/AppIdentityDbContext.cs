using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Domain.Identity;
using Pesabooks.Infrastructure.Persistance.Configurations;
using Pesabooks.Tenancy.Entities;

namespace Pesabooks.Infrastructure.Persistance
{
    public class AppIdentityDbContext : IdentityDbContext<User, Role, int>
    {
        public AppIdentityDbContext(
           DbContextOptions<AppIdentityDbContext> options) : base(options)
        {
        }
        public DbSet<Tenant> Tenants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.ApplyConfiguration(new TenantConfiguration());
            modelBuilder.ApplyConfiguration(new UserTenantConfiguration());

            base.OnModelCreating(modelBuilder);
        }
    }
}
