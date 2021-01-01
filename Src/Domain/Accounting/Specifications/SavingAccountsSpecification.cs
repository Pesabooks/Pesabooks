using Pesabooks.Common.Specifications;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Domain.Accounting.Specifications
{
    public class SavingAccountsSpecification : BaseSpecification<Account>
    {
        public SavingAccountsSpecification()
        {
            Criteria = a => a.Category == AccountCategory.MandatorySavings || a.Category == AccountCategory.MandatorySavings;
        }
    }
}
