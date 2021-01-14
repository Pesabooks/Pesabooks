using Pesabooks.Accounting.Domain;
using Pesabooks.Domain.Common;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Domain.Accounting
{
    public class JournalEntry : BaseEntity
    {
        public int AccountId { get; private set; }
        public Account Account { get; private set; }

        public int TransactionId { get; private set; }
        public Transaction Transaction { get; private set; }
        public decimal Amount { get; private set; }
        public JournalEntryType Type { get; set; }

        private JournalEntry()
        {

        }
        public JournalEntry(Account account, decimal amount, JournalEntryType type)
        {
            AccountId = account.Id;
            Amount = amount;
            Type = type;
        }
    }
}
