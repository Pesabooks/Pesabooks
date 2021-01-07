using Pesabooks.Api.IntegrationTests.Common;
using Pesabooks.Application.Members.Commands;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Api.IntegrationTests.Controllers.Members
{
    public class Delete : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public Delete(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GivenDeleteMemberCommand_ReturnsSuccessStatusCode()
        {
            var client = await _factory.GetAuthenticatedClientAsync();

            var response = await client.DeleteAsync($"/api/members/5");

            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task GivenDeleteMemberCommand_ReturnsNotFound()
        {
            var client = await _factory.GetAuthenticatedClientAsync();

            var response = await client.DeleteAsync($"/api/members/999");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
       
    }

}
