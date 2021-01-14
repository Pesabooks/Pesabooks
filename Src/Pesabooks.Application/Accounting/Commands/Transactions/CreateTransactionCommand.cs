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
    public class CreateTransactionCommand : IRequest
    {
        public int MemberId { get; set; }
        public int CreditedAccountId { get; set; }
        public int DebitedAccountId { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }

        public TransactionType TransactionType { get; set; }


    }

    public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public CreateTransactionCommandHandler(IPesabooksDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
        {
            var member = await _dbContext.Members.FindAsync(request.MemberId) ?? throw new NotFoundException(nameof(Member), request.MemberId);
            var creditAccount = await _dbContext.Accounts.FindAsync(request.CreditedAccountId) ?? throw new NotFoundException(nameof(Account), request.CreditedAccountId);
            var debitAccount = await _dbContext.Accounts.FindAsync(request.DebitedAccountId) ?? throw new NotFoundException(nameof(Account), request.DebitedAccountId);

            Check(request.TransactionType, creditAccount, debitAccount);

            var transaction = new Transaction(creditAccount, debitAccount, request.Date, request.Description, request.Amount, request.TransactionType, member);

            await _dbContext.Transactions.AddAsync(transaction);

            await _dbContext.SaveChangesAsync();

            return Unit.Value;
        }

        private void Check(TransactionType type, Account creditAccount, Account debitAccount)
        {
            switch (type)
            {
                case TransactionType.Deposit:
                    CheckDeposit(creditAccount, debitAccount);
                    break;
                case TransactionType.Withdrawal:
                    CheckWidrawal(creditAccount, debitAccount);
                    break;
                case TransactionType.Transfert:
                    break;
                case TransactionType.Expense:
                    CheckDepense(creditAccount, debitAccount);
                    break;
                case TransactionType.Payment:
                    CheckPayment(creditAccount, debitAccount);
                    break;
                default:
                    break;
            }
        }

        private void CheckWidrawal(Account creditAccount, Account debitAccount)
        {
            if (!creditAccount.IsCashAccount())
            {
                throw new BadRequestException("Withdrawal should be made from a cash account");
            }

            if (!debitAccount.IsSavingAccount())
            {
                throw new BadRequestException("Withdrawal should be made to a saving account.");
            }
        }

        private void CheckDeposit(Account creditAccount, Account debitAccount)
        {

            if (!creditAccount.IsSavingAccount())
            {
                throw new BadRequestException("Deposit should be made from a saving account");
            }

            if (!debitAccount.IsCashAccount())
            {
                throw new BadRequestException("Deposit should be make to a cash account.");
            }
        }

        private void CheckPayment(Account creditAccount, Account debitAccount)
        {

            if (creditAccount.Type != AccountType.Income)
            {
                throw new BadRequestException("Payment should be made from a Expense account");
            }

            if (debitAccount.Type != AccountType.Asset)
            {
                throw new BadRequestException("Payment should be made to an asset account.");
            }
        }

        private void CheckDepense(Account creditAccount, Account debitAccount)
        {

            if (!creditAccount.IsCashAccount())
            {
                throw new BadRequestException("Expense should be made from a cash account");
            }

            if (debitAccount.Type != AccountType.Expense)
            {
                throw new BadRequestException("Payment should be made to an asset account.");
            }
        }
    }

}
