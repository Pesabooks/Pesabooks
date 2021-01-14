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
    public class DeleteAccountCommand : IRequest
    {
        public int AccountId { get; set; }
    }

    public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public DeleteAccountCommandHandler(IPesabooksDbContext context)
        {
            _dbContext = context;
        }

        public async Task<Unit> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
        {
            var account = await _dbContext.Accounts.FindAsync(request.AccountId)
                ?? throw new NotFoundException(nameof(Account), request.AccountId);

            _dbContext.Accounts.Remove(account);

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
