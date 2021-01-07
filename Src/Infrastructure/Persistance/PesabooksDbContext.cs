using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Interfaces;
using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Common;
using Pesabooks.Domain.Identity;
using Pesabooks.Domain.Members;
using Pesabooks.Domain.Session;
using Pesabooks.Infrastructure.Persistance.Configurations;
using Pesabooks.Infrastructure.Persistance.Extensions;
using Pesabooks.Tenancy.Domain;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Infrastructure.Persistance
{

    public class PesabooksDbContext : IdentityDbContext<User, Role, int, IdentityUserClaim<int>, UserRole, IdentityUserLogin<int>, IdentityRoleClaim<int>, IdentityUserToken<int>>, IPesabooksDbContext
    {
        private readonly ISession Session;
        private readonly IDateTime _dateTime;

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<JournalEntry> _journalEntries { get; set; }

        public IQueryable<JournalEntry> JournalEntries => _journalEntries.AsNoTracking();

        public PesabooksDbContext(DbContextOptions<PesabooksDbContext> options) : base(options)
        {
        }

        public PesabooksDbContext(DbContextOptions<PesabooksDbContext> options, ISession session, IDateTime dateTime)
           : base(options)
        {
            Session = session;
            _dateTime = dateTime;
        }


        public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            return this.Database.BeginTransactionAsync(default);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            SetGlobalQuery(modelBuilder);

            modelBuilder.ApplyConfiguration(new TenantConfiguration());
            modelBuilder.ApplyConfiguration(new UserTenantConfiguration());
            modelBuilder.ApplyConfiguration(new MemberConfiguration());
            modelBuilder.ApplyConfiguration(new AccountConfiguration());
            modelBuilder.ApplyConfiguration(new JournalEntryConfiguration());


            base.OnModelCreating(modelBuilder);
        }

        public void SetGlobalQuery(ModelBuilder builder)
        {
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
                    builder.Entity(entityType.ClrType).AddQueryFilter<ISoftDelete>(e => e.IsDeleted == false);

                if (typeof(IHaveTenant).IsAssignableFrom(entityType.ClrType))
                    builder.Entity(entityType.ClrType).AddQueryFilter<IHaveTenant>(e => EF.Property<int?>(e, nameof(IHaveTenant.TenantId)) == Session.TenantId);
            }

            //builder.Entity<Tenant>().HasQueryFilter(e => !e.IsDeleted);
            ////builder.Entity<Tenant>().HasQueryFilter(b => EF.Property<int?>(b, nameof(IHaveTenant.TenantId)) == Session.TenantId);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            AddTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            AddTimestamps();
            return base.SaveChanges();
        }

        private void AddTimestamps()
        {
            var entities = ChangeTracker.Entries().Where(x => x.Entity is IAuditable && (x.State == EntityState.Added || x.State == EntityState.Modified));

            var entries = ChangeTracker.Entries().ToList();
            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        CheckAndSetMustHaveTenantIddProperty(entry.Entity);
                        SetCreationAuditProperties(entry.Entity);
                        break;
                    case EntityState.Modified:
                        SetModificationAuditProperties(entry);
                        if (entry.Entity is ISoftDelete && ((ISoftDelete)entry.Entity).IsDeleted)
                        {
                            SetDeletionAuditProperties(entry.Entity);
                        }
                        break;
                    case EntityState.Deleted:
                        CancelDeletionForSoftDelete(entry);
                        SetDeletionAuditProperties(entry.Entity);
                        break;
                }
            }
        }

        private void CheckAndSetMustHaveTenantIddProperty(object entityAsObj)
        {
            //Only set IMustHaveTenant entities
            if (!(entityAsObj is IHaveTenant))
            {
                return;
            }

            var entity = (IHaveTenant)entityAsObj;

            //Don't set if it's already set
            if (entity.TenantId != 0)
            {
                return;
            }

            var currentTenantId = Session.TenantId;

            if (Session.TenantId.HasValue)
            {
                entity.TenantId = Session.TenantId.Value;
            }
            else
            {
                throw new Exception("Can not set CurrentTenant to 0 for IHaveTenant entities!");
            }
        }

        private void SetCreationAuditProperties(object entityAsObj)
        {
            if (!(entityAsObj is IAuditable entityWithCreatedAt))
            {
                return;
            }

            entityWithCreatedAt.CreatedAt = _dateTime.UtcNow;
            entityWithCreatedAt.CreatedById = Session.UserId;
        }

        private void SetModificationAuditProperties(EntityEntry entry)
        {
            if (entry.Entity is IAuditable entity)
            {
                entity.ModifiedAt = _dateTime.UtcNow;
                entity.ModifiedById = Session.UserId;
            }

        }

        private void CancelDeletionForSoftDelete(EntityEntry entry)
        {
            if (!(entry.Entity is ISoftDelete))
            {
                return;
            }

            entry.State = EntityState.Unchanged; //TODO: Or Modified? IsDeleted = true makes it modified?
            ((ISoftDelete)entry.Entity).IsDeleted = true;
        }

        private void SetDeletionAuditProperties(object entityAsObj)
        {
            if (entityAsObj is IAuditable entity)
            {

                entity.DeletedAt = _dateTime.UtcNow;
                entity.DeletedById = Session.UserId;
            }
        }

     
    }
}
