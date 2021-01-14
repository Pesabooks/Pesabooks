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
                new Account("101", "Cash", AccountCategory.Cash, null),
                new Account("110", "ShortTermLoan", AccountCategory.ShortTermLoan, null),
                new Account("120", "LongTermLoan", AccountCategory.LongTermLoan, null),
                new Account("130", "LoanLossProvision", AccountCategory.LoanLossProvision, null),
                new Account("140", "InterestReceivable", AccountCategory.InterestReceivable, null),
                new Account("180", "OtherAssets", AccountCategory.OtherAssets, null),

                //Liabilities
                
                new Account("201", "MandatorySavings", AccountCategory.MandatorySavings, null),
                new Account("210", "VoluntarySavings", AccountCategory.VoluntarySavings, null),
                new Account("215", "ShortTermBorrowing", AccountCategory.ShortTermBorrowing, null),
                new Account("220", "LongTermBorrowing", AccountCategory.LongTermBorrowing, null),
                new Account("225", "InterestPayable", AccountCategory.InterestPayable, null),
                new Account("280", "OtherLiabilities", AccountCategory.OtherLiabilities, null),

                //Equity
                new Account("301", "OpeningBalance", AccountCategory.OpeningBalance, null),

                // Income
                new Account("401", "InterestOnLoan", AccountCategory.InterestOnLoan, null),
                new Account("405", "Penalty", AccountCategory.Penalty, null),
                new Account("410", "Fee", AccountCategory.Fee, null),
                new Account("480", "OtherIncome", AccountCategory.OtherIncome, null),

                // Expense
                new Account("501", "InterestOnSavings", AccountCategory.InterestOnSavings, null),
                new Account("510", "InterestOnBorrowing", AccountCategory.InterestOnBorrowing, null),
                new Account("580", "OtherExpense", AccountCategory.OtherExpense, null)
            };
        }
    }
}