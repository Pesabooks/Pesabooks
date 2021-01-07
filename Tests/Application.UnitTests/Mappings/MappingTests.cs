using AutoMapper;
using Pesabooks.Application.Members.Dto;
using Pesabooks.Application.Tenancy.Dto;
using Pesabooks.Domain.Members;
using Pesabooks.Tenancy.Domain;
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

        [Fact]
        public void ShouldMapTenantToTenantDto()
        {
            var entity = new Tenant("Tenant", "Description", "Currency");

            var result = _mapper.Map<TenantDto>(entity);

            result.ShouldNotBeNull();
            result.ShouldBeOfType<TenantDto>();
            result.Name.ShouldBe("Tenant");
            result.Description.ShouldBe("Description");
            result.DefaultCurrency.ShouldBe("Currency");
        }
    }
}
