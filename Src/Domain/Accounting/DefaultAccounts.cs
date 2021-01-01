using Pesabooks.Common.Extensions;
using Pesabooks.Domain.Accounting;
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
        public static List<Account> GetDefaultAccounts(string currencyCode)
        {
            return new List<Account>
            {
                // Assets  
                new Account("101", "Cash", AccountType.Asset, AccountCategory.Cash, currencyCode),
                new Account("110", "ShortTermLoan", AccountType.Asset, AccountCategory.ShortTermLoan, currencyCode),
                new Account("120", "LongTermLoan", AccountType.Asset, AccountCategory.LongTermLoan, currencyCode),
                new Account("130", "LoanLossProvision", AccountType.Asset, AccountCategory.LoanLossProvision, currencyCode),
                new Account("140", "InterestReceivable", AccountType.Asset, AccountCategory.InterestReceivable, currencyCode),
                new Account("180", "OtherAssets", AccountType.Asset, AccountCategory.OtherAssets, currencyCode),

                //Liabilities
                
                new Account("201", "MandatorySavings", AccountType.Liability, AccountCategory.MandatorySavings, currencyCode),
                new Account("210", "VoluntarySavings", AccountType.Liability, AccountCategory.VoluntarySavings, currencyCode),
                new Account("215", "ShortTermBorrowing", AccountType.Liability, AccountCategory.ShortTermBorrowing, currencyCode),
                new Account("220", "LongTermBorrowing", AccountType.Liability, AccountCategory.LongTermBorrowing, currencyCode),
                new Account("225", "InterestPayable", AccountType.Liability, AccountCategory.InterestPayable, currencyCode),
                new Account("280", "OtherLiabilities", AccountType.Liability, AccountCategory.OtherLiabilities, currencyCode),

                //Equity
                new Account("301", "OpeningBalance", AccountType.Equity, AccountCategory.OpeningBalance, currencyCode),

                // Income
                new Account("401", "InterestOnLoan", AccountType.Income, AccountCategory.InterestOnLoan, currencyCode),
                new Account("405", "Penalty", AccountType.Income, AccountCategory.Penalty, currencyCode),
                new Account("410", "Fee", AccountType.Income, AccountCategory.Fee, currencyCode),
                new Account("480", "OtherIncome", AccountType.Income, AccountCategory.OtherIncome, currencyCode),

                // Expense
                new Account("501", "InterestOnSavings", AccountType.Expense, AccountCategory.InterestOnSavings, currencyCode),
                new Account("510", "InterestOnBorrowing", AccountType.Expense, AccountCategory.InterestOnBorrowing, currencyCode),
                new Account("580", "OtherExpense", AccountType.Expense, AccountCategory.OtherExpense, currencyCode)
            };
        }
    }
}