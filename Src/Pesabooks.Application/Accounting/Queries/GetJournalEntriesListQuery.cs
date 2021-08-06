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
using AutoMapper.QueryableExtensions;
using AutoMapper;

namespace Pesabooks.Application.Accounting.Queries
{
    public class GetJournalEntriesListQuery : IRequest<List<JournalEntryDto>>
    {
        public int? AccountId { get; set; }
    }

    public class GetJournalEntriesListQueryHandler : IRequestHandler<GetJournalEntriesListQuery, List<JournalEntryDto>>
    {
        private readonly IPesabooksDbContext _context;
        private readonly IMapper _mapper;
        public GetJournalEntriesListQueryHandler(IPesabooksDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<JournalEntryDto>> Handle(GetJournalEntriesListQuery request, CancellationToken cancellationToken)
        {
            var query = _context.JournalEntries;

            if (request.AccountId.HasValue)
            {
                query = query.Where(j => j.AccountId == request.AccountId.Value);
            }

            var entries = await query.OrderByDescending(j => j.Transaction.Date).ProjectTo<JournalEntryDto>(_mapper.ConfigurationProvider).ToListAsync();

            return entries;
        }
    }
}
