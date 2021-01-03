using Pesabooks.Api.IntegrationTests.Common;
using Pesabooks.Application.Members.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Api.IntegrationTests.Controllers.Members
{
    public class Get : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public Get(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GivenGetAlll_ShouldReturnsMembersList()
        {
            var client = await _factory.GetAuthenticatedClientAsync();

            var response = await client.GetAsync("/api/members");

            response.EnsureSuccessStatusCode();

            var members = await Utilities.GetResponseContent<List<MemberListDto>>(response);

            Assert.IsType<List<MemberListDto>>(members);
            Assert.NotEmpty(members);
        }
    }
}
