using Pesabooks.Domain.Common;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Domain.Accounting
{
    public class Account : BaseEntity, IHaveTenant, IInactivable, ISoftDelete
    {
        public AccountType Type { get; private set; }
        public AccountCategory Category { get; private set; }
        public string Code { get; private set; }

        public string Name { get; private set; }
        public string CurrencyCode { get; private set; }

        public int? ParentId { get; private set; }
        public virtual Account Parent { get; private set; }
        public virtual IEnumerable<Account> SubAccounts { get; private set; }
        public virtual IEnumerable<JournalEntry> JournalEntries { get; private set; }


        public int TenantId { get; set; }
        public bool IsInactive { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedById { get; set; }

        protected Account()
        {

        }

        public Account(string code, string name, AccountCategory category, string currencyCode, Account parentAcount = null)
        {
            Name = name;
            Code = code;
            Type = GetAccountType(category);
            Category = category;
            CurrencyCode = currencyCode;
            ParentId = parentAcount?.Id;
        }

        public Account(Tenant tenant, string code, string name, AccountCategory category, string currencyCode, Account parentAcount = null)
            : this(code, name, category, currencyCode, parentAcount)
        {
            if (tenant == null || tenant.Id == 0) throw new ArgumentException(nameof(tenant));
            TenantId = tenant.Id;
        }

        public Account(string code, string name, AccountCategory category, string currencyCode, IEnumerable<Account> subAccounts)
            : this(code, name, category, currencyCode)
        {
            SubAccounts = subAccounts;
        }

        public bool IsSavingAccount()
        {
            return Category == AccountCategory.MandatorySavings || Category == AccountCategory.VoluntarySavings;
        }

        public bool IsCashAccount()
        {
            return Category == AccountCategory.Cash;
        }

        public void Update(string code, string name, AccountCategory category, string currencyCode, Account parentAcount = null)
        {
            Name = name;
            Code = code;
            Type = GetAccountType(category);
            Category = category;
            CurrencyCode = currencyCode;
            ParentId = parentAcount?.Id;
        }

        private AccountType GetAccountType(AccountCategory category)
        {
            return category switch
            {
                AccountCategory.Cash => AccountType.Asset,
                AccountCategory.ShortTermLoan => AccountType.Asset,
                AccountCategory.LongTermLoan => AccountType.Asset,
                AccountCategory.LoanLossProvision => AccountType.Asset,
                AccountCategory.InterestReceivable => AccountType.Asset,
                AccountCategory.OtherAssets => AccountType.Asset,

                AccountCategory.MandatorySavings => AccountType.Liability,
                AccountCategory.VoluntarySavings => AccountType.Liability,
                AccountCategory.ShortTermBorrowing => AccountType.Liability,
                AccountCategory.LongTermBorrowing => AccountType.Liability,
                AccountCategory.InterestPayable => AccountType.Liability,
                AccountCategory.OtherLiabilities => AccountType.Liability,

                AccountCategory.OpeningBalance => AccountType.Equity,

                AccountCategory.InterestOnLoan => AccountType.Income,
                AccountCategory.Penalty => AccountType.Income,
                AccountCategory.Fee => AccountType.Income,
                AccountCategory.OtherIncome => AccountType.Income,

                AccountCategory.InterestOnSavings => AccountType.Expense,
                AccountCategory.InterestOnBorrowing => AccountType.Expense,
                AccountCategory.OtherExpense => AccountType.Expense,
                _ => throw new System.NotImplementedException()
            };
        }

        public void Deactivate()
        {
            IsInactive = !IsInactive;
        }
    }
}
