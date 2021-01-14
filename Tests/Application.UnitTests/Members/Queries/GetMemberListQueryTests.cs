using AutoMapper;
using Bogus;
using Pesabooks.Application.Members.Dto;
using Pesabooks.Application.Members.Queries;
using Pesabooks.Application.UnitTests.Common;
using Pesabooks.Common.Tests;
using Pesabooks.Infrastructure.Persistance;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Application.UnitTests.Members.Queries
{
    [Collection("QueryCollection")]
    public class GetMemberListQueryTests
    {
        private readonly PesabooksDbContext _context;
        private readonly IMapper _mapper;

        private int TotalMembers = Constants.InitialMembersCount;
        private int ArchivedMembers = Constants.InitialMembersArchivedCount;

        public GetMemberListQueryTests(QueryTestFixture fixture)
        {
            _context = fixture.Context;
            _mapper = fixture.Mapper;
        }

        [Fact]
        public async Task GetActiveCustomersTest()
        {

            var sut = new GetMemberListQueryHandler(_context, _mapper);
            var result = await sut.Handle(new GetMemberListQuery(), CancellationToken.None);


            result.ShouldBeOfType<List<MemberListDto>>();
            result.Count.ShouldBe(TotalMembers - ArchivedMembers);
        }

        [Fact]
        public async Task GetAllCustomersTest()
        {

            var sut = new GetMemberListQueryHandler(_context, _mapper);
            var result = await sut.Handle(new GetMemberListQuery { IncludeDeactivated = true }, CancellationToken.None);


            result.ShouldBeOfType<List<MemberListDto>>();
            result.Count.ShouldBe(TotalMembers);
        }
    }
}
