using Microsoft.EntityFrameworkCore;
using Pesabooks.Accounting.Domain;
using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Members;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Common.Interfaces
{
    public interface IPesabooksDbContext
    {
        public DbSet<Member> Members { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public IQueryable<JournalEntry> JournalEntries { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
