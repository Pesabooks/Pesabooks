using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Application.Members.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Members.Queries
{
    public class GetMemberListQuery : IRequest<IList<MemberListDto>>
    {
        private class GetMemberListQueryHandler : IRequestHandler<GetMemberListQuery, IList<MemberListDto>>
        {
            private readonly IPesabooksDbContext _context;
            private readonly IMapper _mapper;

            public GetMemberListQueryHandler(IPesabooksDbContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<IList<MemberListDto>> Handle(GetMemberListQuery request, CancellationToken cancellationToken)
            {
                var query = _context.Members.AsQueryable();

                var members = await query.ProjectTo<MemberListDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken);

                return members;
            }
        }
    }
}
