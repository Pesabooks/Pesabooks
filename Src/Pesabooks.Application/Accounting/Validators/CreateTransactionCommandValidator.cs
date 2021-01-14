using FluentValidation;
using Pesabooks.Application.Accounting.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Application.Accounting.Validators
{
   public  class CreateTransactionCommandValidator: AbstractValidator<CreateTransactionCommand>
    {
        public CreateTransactionCommandValidator()
        {
            RuleFor(x => x.MemberId).NotEmpty();
            RuleFor(x => x.CreditedAccountId).NotEmpty();
            RuleFor(x => x.DebitedAccountId).NotEmpty();
            RuleFor(x => x.Date).NotEmpty();
            RuleFor(x => x.Amount).NotEmpty().GreaterThan(0);
            RuleFor(x => x.TransactionType).IsInEnum();
        }
    }
}
