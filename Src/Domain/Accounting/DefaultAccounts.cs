using Pesabooks.Common.Extensions;
using Pesabooks.Domain.Accounting;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Accounting.Domain
{
    public static class DefaultAccounts
    {
        public static List<Account> GetDefaultAccounts(Tenant tenant)
        {
            return new List<Account>
            {
                // Assets  
                new Account(tenant, "101", "Cash", AccountCategory.Cash, null),
                new Account(tenant, "110", "ShortTermLoan", AccountCategory.ShortTermLoan, null),
                new Account(tenant, "120", "LongTermLoan", AccountCategory.LongTermLoan, null),
                new Account(tenant, "130", "LoanLossProvision", AccountCategory.LoanLossProvision, null),
                new Account(tenant, "140", "InterestReceivable", AccountCategory.InterestReceivable, null),
                new Account(tenant, "180", "OtherAssets", AccountCategory.OtherAssets, null),

                //Liabilities
                
                new Account(tenant, "201", "MandatorySavings", AccountCategory.MandatorySavings, null),
                new Account(tenant, "210", "VoluntarySavings", AccountCategory.VoluntarySavings, null),
                new Account(tenant, "215", "ShortTermBorrowing", AccountCategory.ShortTermBorrowing, null),
                new Account(tenant, "220", "LongTermBorrowing", AccountCategory.LongTermBorrowing, null),
                new Account(tenant, "225", "InterestPayable", AccountCategory.InterestPayable, null),
                new Account(tenant, "280", "OtherLiabilities", AccountCategory.OtherLiabilities, null),

                //Equity
                new Account(tenant, "301", "OpeningBalance", AccountCategory.OpeningBalance, null),

                // Income
                new Account(tenant, "401", "InterestOnLoan", AccountCategory.InterestOnLoan, null),
                new Account(tenant, "405", "Penalty", AccountCategory.Penalty, null),
                new Account(tenant, "410", "Fee", AccountCategory.Fee, null),
                new Account(tenant, "480", "OtherIncome", AccountCategory.OtherIncome, null),

                // Expense
                new Account(tenant, "501", "InterestOnSavings", AccountCategory.InterestOnSavings, null),
                new Account(tenant, "510", "InterestOnBorrowing", AccountCategory.InterestOnBorrowing, null),
                new Account(tenant, "580", "OtherExpense", AccountCategory.OtherExpense, null)
            };
        }
    }
}