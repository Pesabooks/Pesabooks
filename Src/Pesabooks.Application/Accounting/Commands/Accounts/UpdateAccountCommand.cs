using MediatR;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Exceptions;
using Pesabooks.Domain.Accounting;
using System;
using System.Threading;
using System.Threading.Tasks;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Application.Accounting.Commands.Accounts
{
    public class UpdateAccountCommand : IRequest
    {
        public int Id { get; set; }
        public AccountCategory Category { get; set; }
        public string Code { get; set; }

        public string Name { get; set; }
        public string CurrencyCode { get; set; }

        public int? ParentAccountId { get; set; }
    }

    public class UpdateAccountCommandHandler : IRequestHandler<UpdateAccountCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public UpdateAccountCommandHandler(IPesabooksDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
        {
            Account parentAcount = null;
            var account = await _dbContext.Accounts.FindAsync(request.Id) ?? throw new NotFoundException(nameof(Account), request.Id);

            if (request.ParentAccountId.HasValue)
            {
                parentAcount = await _dbContext.Accounts.FindAsync(request.ParentAccountId) ?? throw new ArgumentException("Cannot find parent Account");
            }

            account.Update(request.Code, request.Name, request.Category, request.CurrencyCode, parentAcount);

            _dbContext.Accounts.Update(account);
            await _dbContext.SaveChangesAsync();

            return Unit.Value;
        }
    }
}
