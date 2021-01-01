using MediatR;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Specifications;
using Pesabooks.Domain.Accounting.Specifications;
using Pesabooks.Domain.Session;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Accounting.Commands
{
    public class CreateDefaultAccountsCommand : IRequest
    {
        private class CreateDefaultAccountsCommandHandler : IRequestHandler<CreateDefaultAccountsCommand>
        {
            private readonly IPesabooksDbContext _dbContext;
            private readonly ISession _session;

            public CreateDefaultAccountsCommandHandler(IPesabooksDbContext dbContext, ISession session)
            {
                _dbContext = dbContext;
                _session = session;
            }

            public async Task<Unit> Handle(CreateDefaultAccountsCommand request, CancellationToken cancellationToken)
            {
                var defaultAccounts = DefaultAccounts.GetDefaultAccounts(_session.Tenant.DefaultCurrency);

                foreach (var account in defaultAccounts)
                {
                    var existing = _dbContext.Accounts.Specify(new AccountFilterByCategorySpecification(account.Category)).Count();
                    if (existing == 0)
                    {
                        _dbContext.Accounts.Add(account);
                    }
                }
                await _dbContext.SaveChangesAsync();

                return Unit.Value;
            }
        }
    }

   
}
