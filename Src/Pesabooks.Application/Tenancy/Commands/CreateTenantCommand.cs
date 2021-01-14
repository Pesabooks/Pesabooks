using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Domain.Identity;
using Pesabooks.Domain.Session;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Tenancy.Commands
{
    public class CreateTenantCommand : IRequest<int>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string DefaultCurrency { get; set; }
    }

    public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, int>
    {
        private readonly IPesabooksDbContext _context;
        // private readonly ISession _session;
        private readonly int? UserId;

        public CreateTenantCommandHandler(ISession session, IPesabooksDbContext context)
        {
            UserId = session?.UserId;
            _context = context;
        }

        public async Task<int> Handle(CreateTenantCommand command, CancellationToken cancellationToken)
        {
            if (!UserId.HasValue) throw new ArgumentNullException(nameof(UserId));

            using var transaction = await _context.BeginTransactionAsync();


            var tenant = new Tenant(UserId.Value, command.Name, command.Description, command.DefaultCurrency);
            var tenantAddResultd = await _context.Tenants.AddAsync(tenant);
            await _context.SaveChangesAsync();

            // Add ACcounts
            var defaultAccounts = DefaultAccounts.GetDefaultAccounts(tenant);
            await _context.Accounts.AddRangeAsync(defaultAccounts);

            //Add Roles
            await _context.Roles.AddRangeAsync(new List<Role>
            {
                new Role(tenant.Id,RoleNames.ADMIN),
                new Role(tenant.Id,RoleNames.Editor),
                new Role(tenant.Id,RoleNames.Reader)
            });
            await _context.SaveChangesAsync();


            // Add user as Admin
            var roleAdmin = await _context.Roles.IgnoreQueryFilters().Where(r => r.TenantId == tenant.Id && r.Name == RoleNames.ADMIN).FirstAsync();
            _context.UserRoles.Add(new UserRole { RoleId = roleAdmin.Id, UserId = UserId.Value, TenantId = tenant.Id });
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return tenantAddResultd.Entity.Id;


        }
    }
}