using AutoMapper;
using Moq;
using Pesabooks.Application.Tenancy.Dto;
using Pesabooks.Application.Tenancy.Queries;
using Pesabooks.Application.UnitTests.Common;
using Pesabooks.Common.Tests;
using Pesabooks.Domain.Session;
using Pesabooks.Infrastructure.Persistance;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Application.UnitTests.Tenancy.Queries
{
    [Collection("QueryCollection")]
    public class GetTenantListQueryTests
    {
        private readonly PesabooksDbContext _context;
        private readonly IMapper _mapper;
        private readonly Mock<ISession> _sessionMock;

        public GetTenantListQueryTests(QueryTestFixture fixture)
        {
            _context = fixture.Context;
            _mapper = fixture.Mapper;

            _sessionMock = new Mock<ISession>();
            _sessionMock.Setup(s => s.UserId).Returns(1);
        }

        [Fact]
        public async Task GetActiveCustomersTest()
        {
            // arrage
            var MyTenants = (new TenantFaker(1)).Generate(4);
            var otherTenants = (new TenantFaker(2)).Generate(6);
            _context.Tenants.AddRange(MyTenants.Concat(otherTenants));
            _context.SaveChangesAsync().Wait();

            // act
            var sut = new GetTenantListQueryHandler(_context, _mapper, _sessionMock.Object);
            var result = await sut.Handle(new GetTenantListQuery(), CancellationToken.None);

            // assert
            result.ShouldBeOfType<List<TenantDto>>();
            result.Count.ShouldBe(4);
        }

    }
}
