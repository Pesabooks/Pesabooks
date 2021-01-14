using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Application.Accounting.Dto;
using Pesabooks.Application.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Accounting.Queries
{
    public class GetTransactionsListQuery : IRequest<List<TransactionDto>>
    {
        public int? MemberId { get; set; }
    }

    public class GetTransactionsListQueryHandler : IRequestHandler<GetTransactionsListQuery, List<TransactionDto>>
    {
        private readonly IPesabooksDbContext _context;
        private readonly IMapper _mapper;

        public GetTransactionsListQueryHandler(IMapper mapper, IPesabooksDbContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<List<TransactionDto>> Handle(GetTransactionsListQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Transactions.AsQueryable();

            if (request.MemberId.HasValue)
            {
                query = query.Where(j => j.MemberId == request.MemberId.Value);
            }

            var transactions = await query.ProjectTo<TransactionDto>(_mapper.ConfigurationProvider).ToListAsync();

            return transactions;
        }
    }
}
