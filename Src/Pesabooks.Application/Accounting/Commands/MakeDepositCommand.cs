using MediatR;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Application.Members.Commands;
using Pesabooks.Common.Exceptions;
using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Members;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Application.Accounting.Commands
{
    public class MakeDepositCommand : IRequest
    {
        public int MemberId { get; set; }
        public int FromSavingAccountId { get; set; }
        public int ToCashAccountId { get; set; }
        public DateTime Date { get; set; }
        public decimal amount { get; set; }
        public string Description { get; set; }

        private class MakeDepositCommandHandler : IRequestHandler<MakeDepositCommand>
        {
            private readonly IPesabooksDbContext _dbContext;

            public MakeDepositCommandHandler(IPesabooksDbContext dbContext)
            {
                _dbContext = dbContext;
            }

            public async Task<Unit> Handle(MakeDepositCommand request, CancellationToken cancellationToken)
            {
                var member = await _dbContext.Members.FindAsync(request.MemberId) ?? throw new NotFoundException(nameof(Member), request.MemberId);
                var savingAccount = await _dbContext.Accounts.FindAsync(request.FromSavingAccountId) ?? throw new NotFoundException(nameof(Account), request.FromSavingAccountId);
                var cashAccount = await _dbContext.Accounts.FindAsync(request.ToCashAccountId) ?? throw new NotFoundException(nameof(Account), request.ToCashAccountId);

                if (!savingAccount.IsSavingAccount())
                {
                    throw new BadRequestException("Deposit should be make from a saving account.");
                }

                if (!cashAccount.IsCashAccount())
                {
                    throw new BadRequestException("Deposit should be made to a cash account");
                }

                var transaction = new Transaction(savingAccount, cashAccount,request.Date, request.Description, request.amount, TransactionType.Deposit, member);

                await _dbContext.Transactions.AddAsync(transaction);

                await _dbContext.SaveChangesAsync();

                return Unit.Value;
            }
        }
    }


}
