using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
        private readonly ISession _session;

        public CreateTenantCommandHandler(ISession session, IPesabooksDbContext context)
        {
            _session = session;
            _context = context;
        }

        public async Task<int> Handle(CreateTenantCommand command, CancellationToken cancellationToken)
        {
            if (!_session.UserId.HasValue) throw new ArgumentNullException(nameof(_session.UserId));

            using var transaction = await _context.BeginTransactionAsync();


            var tenant = new Tenant(_session.UserId.Value, command.Name, command.Description, command.DefaultCurrency);
            var tenantAddResultd = await _context.Tenants.AddAsync(tenant);
            await _context.SaveChangesAsync();
            var tenantId = tenantAddResultd.Entity.Id;



            //Add Roles
            await _context.Roles.AddRangeAsync(new List<Role>
            {
                new Role(tenantId,RoleNames.ADMIN),
                new Role(tenantId,RoleNames.Editor),
                new Role(tenantId,RoleNames.Reader)
            });
            await _context.SaveChangesAsync();


            // Add user as Admin
            var roleAdmin = await _context.Roles.IgnoreQueryFilters().Where(r => r.TenantId == tenantId && r.Name == RoleNames.ADMIN).FirstAsync();
            _context.UserRoles.Add(new UserRole { RoleId = roleAdmin.Id, UserId = _session.UserId.Value, TenantId = tenantId });
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return tenantAddResultd.Entity.Id;


        }
    }
}