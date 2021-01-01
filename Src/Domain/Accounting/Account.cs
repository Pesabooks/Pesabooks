using Pesabooks.Domain.Common;
using System;
using System.Collections.Generic;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Domain.Accounting
{
    public class Account : BaseEntity, IHaveTenant
    {
        public AccountType Type { get; private set; }
        public AccountCategory Category { get; private set; }
        public string Code { get; private set; }

        public string Name { get; private set; }
        public string CurrencyCode { get; private set; }

        public int? ParentId { get; private set; }
        public virtual Account Parent { get; private set; }
        public virtual IEnumerable<Account> SubAccounts { get; private set; }


        public int TenantId { get; set; }

        protected Account()
        {

        }

        public Account(string code, string name, AccountType type, AccountCategory category, string currencyCode)
        {
            Name = name;
            Code = code;
            Type = type;
            Category = category;
            CurrencyCode = currencyCode;
        }

        public bool IsSavingAccount()
        {
            return Category == AccountCategory.MandatorySavings || Category == AccountCategory.VoluntarySavings;
        }

        public bool IsCashAccount()
        {
            return Category == AccountCategory.Cash;
        }

        public Account(string code, string name, AccountType type, AccountCategory category, string currencyCode, IEnumerable<Account> subAccounts)
            : this(code, name, type, category, currencyCode)
        {
            SubAccounts = subAccounts;
        }
    }
}
