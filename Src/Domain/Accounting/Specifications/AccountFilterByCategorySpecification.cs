using Pesabooks.Common.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Domain.Accounting.Specifications
{
    public class AccountFilterByCategorySpecification : BaseSpecification<Account>
    {
        public AccountFilterByCategorySpecification(AccountCategory category)
        {
            Criteria = a => a.Category == category;
        }
    }
}
