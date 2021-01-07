using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Pesabooks.Accounting.Domain;
using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Identity;
using Pesabooks.Domain.Members;
using Pesabooks.Tenancy.Domain;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Application.Common.Interfaces
{
    public interface IPesabooksDbContext
    {
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public IQueryable<JournalEntry> JournalEntries { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}
