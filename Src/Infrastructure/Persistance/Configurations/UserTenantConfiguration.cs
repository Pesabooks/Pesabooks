using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pesabooks.Domain.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Infrastructure.Persistance.Configurations
{
    class UserTenantConfiguration : IEntityTypeConfiguration<UserTenant>
    {
        public void Configure(EntityTypeBuilder<UserTenant> builder)
        {
            builder.HasKey(bc => new { bc.UserId, bc.TenantId });

            builder.HasOne(bc => bc.User)
                .WithMany(b => b.UserTenants)
                .HasForeignKey(bc => bc.UserId);

            builder.HasOne(bc => bc.Tenant)
                .WithMany(c => c.UserTenants)
                .HasForeignKey(bc => bc.TenantId);

            builder.ToTable("UserTenants");
        }
    }
}
