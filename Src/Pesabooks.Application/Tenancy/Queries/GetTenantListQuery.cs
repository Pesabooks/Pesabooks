using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Application.Tenancy.Dto;
using Pesabooks.Domain.Session;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Tenancy.Queries
{
    public class GetTenantListQuery : IRequest<IList<TenantDto>>
    {
    }

    public class GetTenantListQueryHandler : IRequestHandler<GetTenantListQuery, IList<TenantDto>>
    {
        private readonly ISession Session;
        private readonly IPesabooksDbContext _context;
        private readonly IMapper _mapper;

        public GetTenantListQueryHandler(IPesabooksDbContext context, IMapper mapper, ISession session)
        {
            _context = context;
            _mapper = mapper;
            Session = session;
        }

        public async Task<IList<TenantDto>> Handle(GetTenantListQuery request, CancellationToken cancellationToken)
        {
            var tenants = await _context.Tenants
                .Include(t=>t.UserTenants)
                .Where(x => x.UserTenants.Any(ut => ut.UserId == Session.UserId.Value))
                .ProjectTo<TenantDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return tenants;
        }
    }
}
