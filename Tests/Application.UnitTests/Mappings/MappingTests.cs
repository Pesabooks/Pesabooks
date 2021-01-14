using AutoMapper;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Accounting.Dto;
using Pesabooks.Application.Members.Dto;
using Pesabooks.Application.Tenancy.Dto;
using Pesabooks.Common.Tests;
using Pesabooks.Domain.Accounting;
using Pesabooks.Domain.Members;
using Pesabooks.Tenancy.Domain;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Application.UnitTests.Mappings
{
    public class MappingTests : IClassFixture<MappingTestsFixture>
    {
        private readonly IConfigurationProvider _configuration;
        private readonly IMapper _mapper;

        public MappingTests(MappingTestsFixture fixture)
        {
            _configuration = fixture.ConfigurationProvider;
            _mapper = fixture.Mapper;
        }

        [Fact]
        public void ShouldHaveValidConfiguration()
        {
            _configuration.AssertConfigurationIsValid();
        }

        [Fact]
        public void ShouldMapMemberToMemberListDto()
        {
            var entity = new Member("John", "Doe", "jd@email.com", "+1800547474");
            entity.SetPrivate(t => t.Id, 1);

            var result = _mapper.Map<MemberListDto>(entity);

            result.ShouldNotBeNull();
            result.ShouldBeOfType<MemberListDto>();
            result.Id.ShouldBe(1);
            result.FirstName.ShouldBe("John");
            result.LastName.ShouldBe("Doe");
            result.Email.ShouldBe("jd@email.com");
            result.Phone.ShouldBe("+1800547474");
        }

        [Fact]
        public void ShouldMapTenantToTenantDto()
        {
            var entity = new Tenant("Tenant", "Description", "Currency");
            entity.SetPrivate(t => t.Id, 1);

            var result = _mapper.Map<TenantDto>(entity);

            result.ShouldNotBeNull();
            result.ShouldBeOfType<TenantDto>();
            result.Id.ShouldBe(1);
            result.Name.ShouldBe("Tenant");
            result.Description.ShouldBe("Description");
            result.DefaultCurrency.ShouldBe("Currency");
        }

        [Fact]
        public void ShouldMapTransactionTransactionDto()
        {
            var date = DateTime.UtcNow;
            //Depsit
            var debitAccount = new Account("7", "Saving", AccountCategory.MandatorySavings, null);
            var creditAccount = new Account("1", "Cash", AccountCategory.Cash, null);
            var member = new Member("John", "Doe");
            member.SetPrivate(m => m.FullName, "John Doe");
            var deposit = new Transaction(debitAccount, creditAccount, date, "a deposit", 500, TransactionType.Deposit, member);

            deposit.JournalEntries.First(a => a.Type == JournalEntryType.Debit).SetPrivate(j => j.Account, debitAccount);
            deposit.JournalEntries.Last(a => a.Type == JournalEntryType.Credit).SetPrivate(j => j.Account, creditAccount);
            deposit.SetPrivate(d => d.Member, member);
            deposit.SetPrivate(d => d.Id, 1);

            var result = _mapper.Map<TransactionDto>(deposit);

            result.ShouldNotBeNull();
            result.ShouldBeOfType<TransactionDto>();
            result.Id.ShouldBe(1);
            result.Amount.ShouldBe(500);
            result.Description.ShouldBe("a deposit");
            result.CreditedAccountName.ShouldBe("Cash");
            result.DebitedAccountName.ShouldBe("Saving");
            result.TransactionDirection.ShouldBe(deposit.Direction.ToString());
            result.MemberFullName.ShouldBe("John Doe");
        }

        [Fact]
        public void ShouldMapAccountToAccountListDto()
        {
            var entity = new Account("7", "Saving", AccountCategory.MandatorySavings, "CAD");
            entity.SetPrivate(d => d.Id, 1);

            var result = _mapper.Map<AccountsListDto>(entity);

            result.ShouldNotBeNull();
            result.ShouldBeOfType<AccountsListDto>();
            result.Id.ShouldBe(1);
            result.Code.ShouldBe("7");
            result.Name.ShouldBe("Saving");
            result.Category.ShouldBe("MandatorySavings");
        }
    }
}
