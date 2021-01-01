using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks
{
    public static class Enums
    {
        public static class Accounting
        {
            public enum AccountType
            {
                //Balance Sheet accounts
                Asset = 1,
                Liability = 2,
                Equity = 3,

                //Income and expense accounts
                Income = 4,
                Expense = 5
            }

            public enum AccountCategory
            {
                //Assets
                Cash = 1,
                ShortTermLoan = 2,
                LongTermLoan = 3,
                LoanLossProvision = 4,
                InterestReceivable = 5,
                OtherAssets = 6,

                //Liabilities
                MandatorySavings = 7,
                VoluntarySavings = 8,
                ShortTermBorrowing = 9,
                LongTermBorrowing = 10,
                InterestPayable = 11,
                OtherLiabilities = 12,

                //Equity
                OpeningBalance = 13,

                //Income
                InterestOnLoan = 14,
                Penalty = 15,
                Fee = 16,
                OtherIncome = 17,

                //Expense
                InterestOnSavings = 18,
                InterestOnBorrowing = 19,
                OtherExpense = 20

            }

            public enum TransactionType
            {
                Deposit = 1,
                Withdrawal = 2,
                Transfert = 3,
                Expense = 4
            }


            public enum JournalEntryType
            {
                Debit = 1,
                Credit = 2
            }
        }
    }
}
