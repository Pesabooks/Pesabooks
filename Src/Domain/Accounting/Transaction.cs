using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Common;
using Pesabooks.Domain.Members;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Accounting.Domain
{
    public class Transaction : BaseEntity
    {
        public DateTime Date { get; set; }
        public string Description { get; private set; }
        public TransactionType Type { get; set; }
        public int? MemberId { get; private set; }
        public virtual Member Member { get; private set; }
        public IEnumerable<JournalEntry> JournalEntries { get; private set; }

        private Transaction()
        {

        }

        public Transaction(Account debitedAccount, Account creditedAccount, DateTime date, string description, decimal amount, TransactionType type, Member member = null)
        {
            Description = description;
            Date = date;
            Type = type;
            MemberId = member?.Id;
            JournalEntries = new List<JournalEntry>
            {
                new JournalEntry(debitedAccount, amount, JournalEntryType.Debit),
                new JournalEntry(creditedAccount, amount, JournalEntryType.Credit)
            };
        }

        public bool IsValid()
        {
            var totalDebit = JournalEntries.Where(j => j.Type == JournalEntryType.Debit).Sum(j => j.Amount);
            var totalCredit = JournalEntries.Where(j => j.Type == JournalEntryType.Credit).Sum(j => j.Amount);

            return totalCredit == totalDebit;
        }
    }
}
