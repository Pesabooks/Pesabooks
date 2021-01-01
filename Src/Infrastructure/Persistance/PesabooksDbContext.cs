using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Common;
using Pesabooks.Domain.Members;
using Pesabooks.Domain.Session;
using Pesabooks.Infrastructure.Persistance.Configurations;
using Pesabooks.Infrastructure.Persistance.Extensions;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Infrastructure.Persistance
{
    public class PesabooksDbContext : DbContext, IPesabooksDbContext
    {
        private ISession Session;

        public DbSet<Member> Members { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<JournalEntry> _journalEntries { get; set; }

        public IQueryable<JournalEntry> JournalEntries => _journalEntries.AsNoTracking();


        public PesabooksDbContext(ISession session, DbContextOptions<PesabooksDbContext> options)
           : base(options)
        {
            Session = session;
        }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            SetGlobalQuery(modelBuilder);
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

            if (entityWithCreatedAt.CreatedAt == null)
            {
                entityWithCreatedAt.CreatedAt = DateTime.UtcNow;
            }

            if (Session.UserId.HasValue && entityAsObj is IAuditable)
            {
                var entity = entityAsObj as IAuditable;
                if (!entity.CreatedById.HasValue)
                {
                    if (entity is IHaveTenant)
                    {
                        //Sets CreatorUserId only if current user is in same tenant/host with the given entity
                        if (entity is IHaveTenant && ((IHaveTenant)entity).TenantId == Session.TenantId)
                        {
                            entity.CreatedById = Session.UserId;
                        }
                    }
                    else
                    {
                        entity.CreatedById = Session.UserId;
                    }
                }
            }
        }

        private void SetModificationAuditProperties(EntityEntry entry)
        {
            if (entry.Entity is IAuditable)
            {
                ((IAuditable)entry.Entity).ModifiedAt = DateTime.UtcNow;
            }

            if (entry.Entity is IAuditable entity)
            {
                if (!Session.UserId.HasValue)
                {
                    entity.ModifiedById = null;
                    return;
                }

                //Special check for multi-tenant entities
                if (entity is IHaveTenant)
                {
                    //Sets LastModifierUserId only if current user is in same tenant/host with the given entity
                    if (((IHaveTenant)entry.Entity).TenantId == Session.TenantId)
                    {
                        entity.ModifiedById = Session.UserId;
                    }
                    else
                    {
                        entity.ModifiedById = null;
                    }
                }
                else
                {
                    entity.ModifiedById = Session.UserId;
                }
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
            if (entityAsObj is IAuditable)
            {
                var entity = (IAuditable)entityAsObj;

                if (entity.DeletedAt == null)
                {
                    entity.DeletedAt = DateTime.Now;
                }
            }

            if (entityAsObj is IAuditable)
            {
                var entity = (IAuditable)entityAsObj;

                if (!entity.DeletedById.HasValue)
                {
                    return;
                }

                if (!Session.UserId.HasValue)
                {
                    entity.DeletedById = null;
                    return;
                }

                //Special check for multi-tenant entities
                if (entity is IHaveTenant)
                {
                    //Sets LastModifierUserId only if current user is in same tenant/host with the given entity
                    if ((entity is IHaveTenant && ((IHaveTenant)entity).TenantId == Session.TenantId))
                    {
                        entity.DeletedById = Session.UserId;
                    }
                    else
                    {
                        entity.DeletedById = null;
                    }
                }
                else
                {
                    entity.DeletedById = Session.UserId;
                }
            }
        }
    }
}
