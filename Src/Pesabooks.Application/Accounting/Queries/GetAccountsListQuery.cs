using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Application.Accounting.Dto;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Specifications;
using Pesabooks.Domain.Accounting.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Accounting.Queries
{
    public class GetAccountsListQuery : IRequest<IList<AccountsListDto>>
    {
        public bool OnlySavings { get; set; }
        public bool IncludeDeactivated { get; set; }

        private class GetAccountsListQueryHandler : IRequestHandler<GetAccountsListQuery, IList<AccountsListDto>>
        {
            private readonly IPesabooksDbContext _context;
            private readonly IMapper _mapper;

            public GetAccountsListQueryHandler(IPesabooksDbContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<IList<AccountsListDto>> Handle(GetAccountsListQuery request, CancellationToken cancellationToken)
            {
                var query = _context.Accounts.AsQueryable();

                if (!request.IncludeDeactivated)
                {
                    query = query.Where(m => !m.IsInactive);
                }

                if (request.OnlySavings)
                {
                    query = query.Specify(new SavingAccountsSpecification());
                }

                var accounts = await query
                    .OrderBy(a => a.Code)
                    .ProjectTo<AccountsListDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);

                return accounts;
            }
        }
    }
}
