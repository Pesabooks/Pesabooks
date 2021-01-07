using MediatR;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Domain.Members;
using Pesabooks.Domain.Members.Events;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Members.Commands
{
    public class CreateMemberCommand : IRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }

    public class CreateMemberCommandHandler : IRequestHandler<CreateMemberCommand>
    {
        private readonly IPesabooksDbContext _dbContext;
        private readonly IMediator _mediator;

        public CreateMemberCommandHandler(IPesabooksDbContext context, IMediator mediator)
        {
            _dbContext = context;
            _mediator = mediator;
        }

        public async Task<Unit> Handle(CreateMemberCommand request, CancellationToken cancellationToken)
        {
            var member = new Member(
                    request.FirstName,
                    request.LastName,
                    request.Email,
                    request.Phone);

            await this._dbContext.Members.AddAsync(member);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _mediator.Publish(new MemberCreated { MemberId = member.Id }, cancellationToken);

            return Unit.Value;
        }
    }
}
