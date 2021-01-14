using Microsoft.EntityFrameworkCore;
using Moq;
using Pesabooks.Common.Interfaces;
using Pesabooks.Domain.Members;
using Pesabooks.Domain.Session;
using Pesabooks.Infrastructure.Persistance;
using Shouldly;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Infrastructure.UnitTests
{
    public class PesabooksDbContextTests : IDisposable
    {
        private const int _userId = 2;
        private readonly DateTime _dateTime;
        private readonly Mock<ISession> _sessionMock;
        private readonly Mock<IDateTime> _dateTimeMock;
        private readonly PesabooksDbContext _sut;

        public PesabooksDbContextTests()
        {
            _dateTime = DateTime.UtcNow;

            _sessionMock = new Mock<ISession>();
            _sessionMock.Setup(m => m.UserId).Returns(_userId);


            _dateTimeMock = new Mock<IDateTime>();
            _dateTimeMock.Setup(m => m.UtcNow).Returns(_dateTime);

            var options = new DbContextOptionsBuilder<PesabooksDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _sut = new PesabooksDbContext(options, _sessionMock.Object, _dateTimeMock.Object);
        }

        [Fact]
        public async Task SaveChangesAsync_GivenNewMember_ShouldSetCreatedPropertiesAndTenant()
        {
            var _tenantId = 1;
            _sessionMock.Setup(m => m.TenantId).Returns(_tenantId);
            var member = new Member("Jane", "Doe");

            _sut.Members.Add(member);

            await _sut.SaveChangesAsync();

            member.CreatedAt.ShouldBe(_dateTime);
            member.CreatedById.ShouldBe(_userId);
            member.TenantId.ShouldBe(_tenantId);
        }

        [Fact]
        public async Task SaveChangesAsync_GivenExistingMember_ShouldSetUpdatedPropertiesAndTenant()
        {
            //Setup
            var _tenantId = 1;
            _sessionMock.Setup(m => m.TenantId).Returns(_tenantId);
            var member = new Member("Jane", "Doe");

            var result = _sut.Members.Add(member);
            await _sut.SaveChangesAsync();

            // Arrange
            var existingMember = await _sut.Members.FindAsync(result.Entity.Id);
            existingMember.Update("Jane1", "Doe", "", "");
            await _sut.SaveChangesAsync();

            existingMember.ModifiedAt.ShouldBe(_dateTime);
            existingMember.ModifiedById.ShouldBe(_userId);
            existingMember.TenantId.ShouldBe(_tenantId);
        }

        [Fact]
        public async Task SaveChangesAsync_GivenExistingMember_ShouldSetDeletedPropertiesAndTenant()
        {
            //Setup
            var _tenantId = 1;
            _sessionMock.Setup(m => m.TenantId).Returns(_tenantId);
            var member = new Member("Jane", "Doe");

            var result = _sut.Members.Add(member);
            await _sut.SaveChangesAsync();

            // Arrange
            var existingMember = await _sut.Members.FindAsync(result.Entity.Id);
            _sut.Members.Remove(existingMember);
            await _sut.SaveChangesAsync();

            // Assert
            (await _sut.Members.ToListAsync()).Count.ShouldBe(0);

            var deletedMember = await _sut.Members.IgnoreQueryFilters().FirstAsync(m=>m.Id==result.Entity.Id);
            deletedMember.DeletedAt.ShouldBe(_dateTime);
            existingMember.DeletedById.ShouldBe(_userId);
        }

        [Fact]
        public async Task QueryMember_GivenDifferentTenant_ShouldFilterOutResults()
        {
            _sessionMock.Setup(m => m.TenantId).Returns(1);
            _sut.Members.Add(new Member("John", "Doe"));
            _sut.SaveChanges();

            _sessionMock.Setup(m => m.TenantId).Returns(2);
            var member = new Member("Jane", "Doe");
            _sut.Members.Add(member);

            await _sut.SaveChangesAsync();


            var members = await _sut.Members.ToListAsync();
            members.Count.ShouldBe(1);
            members[0].TenantId.ShouldBe(2);
        }

        public void Dispose()
        {
            _sut?.Dispose();
        }
    }
}
