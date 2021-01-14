using MediatR;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Exceptions;
using Pesabooks.Domain.Members;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Members.Commands
{
    public class DeactivateMemberCommand : IRequest
    {
        public int MemberId { get; set; }

    }

    public class DeactivateMemberCommandHandler : IRequestHandler<DeactivateMemberCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public DeactivateMemberCommandHandler(IPesabooksDbContext context)
        {
            _dbContext = context;
        }

        public async Task<Unit> Handle(DeactivateMemberCommand request, CancellationToken cancellationToken)
        {
            var member = await _dbContext.Members
                .FindAsync(request.MemberId);

            if (member == null)
            {
                throw new NotFoundException(nameof(Member), request.MemberId);
            }

            member.Deactivate();

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
