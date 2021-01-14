using MediatR;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Exceptions;
using Pesabooks.Domain.Accounting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Accounting.Commands.Accounts
{
    public class DeactivateAccountCommand : IRequest
    {
        public int AccountId { get; set; }
    }

    public class DeactivateAccountCommandHandler : IRequestHandler<DeactivateAccountCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public DeactivateAccountCommandHandler(IPesabooksDbContext context)
        {
            _dbContext = context;
        }

        public async Task<Unit> Handle(DeactivateAccountCommand request, CancellationToken cancellationToken)
        {
            var account = await _dbContext.Accounts.FindAsync(request.AccountId);

            if (account == null)
            {
                throw new NotFoundException(nameof(Account), request.AccountId);
            }

            account.Deactivate();

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
