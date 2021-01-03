using AutoMapper;
using Pesabooks.Application.Members.Dto;
using Pesabooks.Domain.Members;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

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

            var result = _mapper.Map<MemberListDto>(entity);

            result.ShouldNotBeNull();
            result.ShouldBeOfType<MemberListDto>();
            result.FirstName.ShouldBe("John");
            result.LastName.ShouldBe("Doe");
            result.Email.ShouldBe("jd@email.com");
            result.Phone.ShouldBe("+1800547474");
        }
    }
}
