using MediatR;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Exceptions;
using Pesabooks.Domain.Accounting;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Application.Accounting.Commands.Accounts
{
    public class CreateAccountCommand : IRequest
    {
        public AccountCategory Category { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string CurrencyCode { get; set; }

        public int? ParentAccountId { get; set; }
    }

    public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public CreateAccountCommandHandler(IPesabooksDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
        {
            var existingAccountWithSameCode = await _dbContext.Accounts.AnyAsync(a => a.Code.ToLower() == request.Code.ToLower());
            if (existingAccountWithSameCode)
            {
                throw new BadRequestException("this number is already used by another account. Use another number");
            }

            Account parentAcount = null; ;

            if (request.ParentAccountId.HasValue)
            {
                parentAcount = await _dbContext.Accounts.FindAsync(request.ParentAccountId) ?? throw new ArgumentException("Cannot find parent Account");

            }

            var account = new Account(request.Code, request.Name, request.Category, request.CurrencyCode, parentAcount);

            await _dbContext.Accounts.AddAsync(account);

            await _dbContext.SaveChangesAsync();

            return Unit.Value;
        }


    }
}
