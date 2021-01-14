using MediatR;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Transactioning.Commands.Transactions
{
    public class DeleteTransactionCommand : IRequest
    {
        public int TransactionId { get; set; }
    }

    public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public DeleteTransactionCommandHandler(IPesabooksDbContext context)
        {
            _dbContext = context;
        }

        public async Task<Unit> Handle(DeleteTransactionCommand request, CancellationToken cancellationToken)
        {

            var transaction = await _dbContext.Transactions.FindAsync(request.TransactionId)
                ?? throw new NotFoundException(nameof(Transaction), request.TransactionId);

            _dbContext.Transactions.Remove(transaction);

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
